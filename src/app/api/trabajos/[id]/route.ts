import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

// GET - Obtener trabajo por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  const trabajo = await prisma.trabajo.findUnique({
    where: { id },
    include: {
      cliente: true,
      tipoServicio: true,
      documentos: true
    }
  })

  if (!trabajo) {
    return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 })
  }

  // Verificar permisos si es cliente
  if (session.user.rol === "CLIENTE") {
    const cliente = await prisma.cliente.findFirst({
      where: { usuarioId: session.user.id }
    })
    if (!cliente || trabajo.clienteId !== cliente.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }
  }

  return NextResponse.json({
    ...trabajo,
    datos: typeof trabajo.datos === 'string' ? JSON.parse(trabajo.datos) : trabajo.datos
  })
}

// PATCH - Actualizar estado del trabajo
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session || (session.user.rol !== "ADMIN" && session.user.rol !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { estado, observaciones, datos } = body

    const updateData: any = {}
    if (estado) updateData.estado = estado
    if (observaciones !== undefined) updateData.observaciones = observaciones
    if (datos) updateData.datos = JSON.stringify(datos)

    const trabajo = await prisma.trabajo.update({
      where: { id },
      data: updateData,
      include: {
        cliente: true,
        tipoServicio: true
      }
    })

    return NextResponse.json({
      ...trabajo,
      datos: typeof trabajo.datos === 'string' ? JSON.parse(trabajo.datos) : trabajo.datos
    })
  } catch (error) {
    console.error("Error al actualizar trabajo:", error)
    return NextResponse.json({ error: "Error al actualizar trabajo" }, { status: 500 })
  }
}

// PUT - Actualizar trabajo completo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session || (session.user.rol !== "ADMIN" && session.user.rol !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { clienteId, tipoServicioId, fecha, estado, observaciones, datos } = body

    const trabajo = await prisma.trabajo.update({
      where: { id },
      data: {
        clienteId,
        tipoServicioId,
        fecha: new Date(fecha),
        estado,
        observaciones,
        datos: JSON.stringify(datos || {})
      },
      include: {
        cliente: true,
        tipoServicio: true
      }
    })

    return NextResponse.json({
      ...trabajo,
      datos: typeof trabajo.datos === 'string' ? JSON.parse(trabajo.datos) : trabajo.datos
    })
  } catch (error) {
    console.error("Error al actualizar trabajo:", error)
    return NextResponse.json({ error: "Error al actualizar trabajo" }, { status: 500 })
  }
}

// DELETE - Eliminar trabajo (solo SUPER_ADMIN)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session || session.user.rol !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado - Solo SUPER_ADMIN puede eliminar" }, { status: 401 })
  }

  const { id } = await params

  try {
    // Eliminar documentos primero
    await prisma.documento.deleteMany({
      where: { trabajoId: id }
    })

    // Eliminar trabajo
    await prisma.trabajo.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Trabajo eliminado" })
  } catch (error) {
    console.error("Error al eliminar trabajo:", error)
    return NextResponse.json({ error: "Error al eliminar trabajo" }, { status: 500 })
  }
}