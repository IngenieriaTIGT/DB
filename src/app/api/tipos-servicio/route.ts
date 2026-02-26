import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

// GET - Listar tipos de servicio
export async function GET() {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const tipos = await prisma.tipoServicio.findMany({
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json(tipos)
}

// POST - Crear tipo de servicio
export async function POST(request: NextRequest) {
  const session = await auth()
  
  if (!session || (session.user.rol !== "ADMIN" && session.user.rol !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { nombre, descripcion, campos } = body

    if (!nombre || !campos) {
      return NextResponse.json({ error: "Nombre y campos son requeridos" }, { status: 400 })
    }

    const tipo = await prisma.tipoServicio.create({
      data: {
        nombre,
        descripcion,
        campos: JSON.stringify(campos)
      }
    })

    return NextResponse.json(tipo)
  } catch (error) {
    console.error("Error al crear tipo de servicio:", error)
    return NextResponse.json({ error: "Error al crear tipo de servicio" }, { status: 500 })
  }
}