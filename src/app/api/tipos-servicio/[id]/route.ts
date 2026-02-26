import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

// GET - Obtener tipo de servicio por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  const tipo = await prisma.tipoServicio.findUnique({
    where: { id }
  })

  if (!tipo) {
    return NextResponse.json({ error: "Tipo de servicio no encontrado" }, { status: 404 })
  }

  return NextResponse.json(tipo)
}

// PUT - Actualizar tipo de servicio
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
    const { nombre, descripcion, campos } = body

    const tipo = await prisma.tipoServicio.update({
      where: { id },
      data: {
        nombre,
        descripcion,
        campos: JSON.stringify(campos)
      }
    })

    return NextResponse.json(tipo)
  } catch (error) {
    console.error("Error al actualizar tipo de servicio:", error)
    return NextResponse.json({ error: "Error al actualizar tipo de servicio" }, { status: 500 })
  }
}

// PATCH - Cambiar estado activo
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
    const { activo } = body

    const tipo = await prisma.tipoServicio.update({
      where: { id },
      data: { activo }
    })

    return NextResponse.json(tipo)
  } catch (error) {
    console.error("Error al actualizar estado:", error)
    return NextResponse.json({ error: "Error al actualizar estado" }, { status: 500 })
  }
}

// DELETE - Eliminar tipo de servicio (solo SUPER_ADMIN)
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
    await prisma.tipoServicio.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Tipo de servicio eliminado" })
  } catch (error) {
    console.error("Error al eliminar tipo de servicio:", error)
    return NextResponse.json({ error: "Error al eliminar tipo de servicio" }, { status: 500 })
  }
}