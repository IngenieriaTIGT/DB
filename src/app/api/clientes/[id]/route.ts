import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

// GET - Obtener cliente por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session || (session.user.rol !== "ADMIN" && session.user.rol !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      usuario: {
        select: { id: true, email: true, nombre: true, activo: true, rol: true }
      },
      _count: {
        select: { trabajos: true }
      }
    }
  })

  if (!cliente) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
  }

  return NextResponse.json(cliente)
}

// DELETE - Eliminar cliente (solo SUPER_ADMIN)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session || session.user.rol !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado - Solo SUPER_ADMIN puede eliminar clientes" }, { status: 401 })
  }

  const { id } = await params

  try {
    // Verificar que el cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: { usuario: true }
    })

    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    // Eliminar documentos asociados a los trabajos
    await prisma.documento.deleteMany({
      where: { trabajo: { clienteId: id } }
    })

    // Eliminar trabajos asociados
    await prisma.trabajo.deleteMany({
      where: { clienteId: id }
    })

    // Eliminar cliente
    await prisma.cliente.delete({
      where: { id }
    })

    // Eliminar usuario asociado
    await prisma.usuario.delete({
      where: { id: cliente.usuarioId }
    })

    return NextResponse.json({ message: "Cliente eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar cliente:", error)
    return NextResponse.json({ error: "Error al eliminar cliente" }, { status: 500 })
  }
}
