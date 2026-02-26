import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

// GET - Obtener usuario por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session || session.user.rol !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      nombre: true,
      rol: true,
      activo: true,
      createdAt: true,
      cliente: {
        select: {
          id: true,
          codigo: true,
          nombre: true,
          nit: true,
          direccion: true,
          telefono: true,
          email: true,
          observaciones: true
        }
      }
    }
  })

  if (!usuario) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  return NextResponse.json(usuario)
}

// PUT - Actualizar usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session || session.user.rol !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado - Solo SUPER_ADMIN puede modificar usuarios" }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { nombre, email, rol, activo } = body

    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id },
      include: { cliente: true }
    })

    if (!usuarioExistente) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // No permitir modificar el rol del SUPER_ADMIN principal
    if (usuarioExistente.email === "administrador@ingenieriatigt.com" && rol !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "No se puede cambiar el rol del Super Administrador principal" }, { status: 400 })
    }

    // Si cambia de email, verificar que no exista
    if (email && email !== usuarioExistente.email) {
      const emailExiste = await prisma.usuario.findUnique({
        where: { email }
      })
      if (emailExiste) {
        return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 400 })
      }
    }

    // Actualizar usuario
    const usuario = await prisma.usuario.update({
      where: { id },
      data: {
        nombre: nombre || usuarioExistente.nombre,
        email: email || usuarioExistente.email,
        rol: rol || usuarioExistente.rol,
        activo: activo !== undefined ? activo : usuarioExistente.activo
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true
      }
    })

    // Si tiene cliente, actualizar también
    if (usuarioExistente.cliente && body.cliente) {
      await prisma.cliente.update({
        where: { id: usuarioExistente.cliente.id },
        data: {
          nombre: nombre || usuarioExistente.nombre,
          email: email || usuarioExistente.email,
          nit: body.cliente.nit,
          direccion: body.cliente.direccion,
          telefono: body.cliente.telefono,
          observaciones: body.cliente.observaciones
        }
      })
    }

    return NextResponse.json(usuario)
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 })
  }
}

// DELETE - Eliminar usuario (solo SUPER_ADMIN)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session || session.user.rol !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado - Solo SUPER_ADMIN puede eliminar usuarios" }, { status: 401 })
  }

  const { id } = await params

  try {
    // Verificar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: { cliente: true }
    })

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // No permitir eliminar el SUPER_ADMIN principal
    if (usuario.email === "administrador@ingenieriatigt.com") {
      return NextResponse.json({ error: "No se puede eliminar el Super Administrador principal" }, { status: 400 })
    }

    // Eliminar cliente si existe
    if (usuario.cliente) {
      // Eliminar trabajos y documentos relacionados
      await prisma.documento.deleteMany({
        where: { trabajo: { clienteId: usuario.cliente.id } }
      })
      await prisma.trabajo.deleteMany({
        where: { clienteId: usuario.cliente.id }
      })
      await prisma.cliente.delete({
        where: { id: usuario.cliente.id }
      })
    }

    // Eliminar usuario
    await prisma.usuario.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Usuario eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 })
  }
}
