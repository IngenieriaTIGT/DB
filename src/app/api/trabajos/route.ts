import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { generarCodigoTrabajo } from "@/lib/utils"

// GET - Listar trabajos
export async function GET(request: NextRequest) {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const clienteId = searchParams.get("clienteId")
  const estado = searchParams.get("estado")

  let where: any = {}

  // Si es cliente, solo ver sus propios trabajos
  if (session.user.rol === "CLIENTE") {
    // Buscar el cliente asociado al usuario
    const cliente = await prisma.cliente.findFirst({
      where: { usuarioId: session.user.id }
    })
    if (cliente) {
      where.clienteId = cliente.id
    }
  } else if (clienteId) {
    where.clienteId = clienteId
  }

  if (estado) {
    where.estado = estado
  }

  const trabajos = await prisma.trabajo.findMany({
    where,
    include: {
      cliente: true,
      tipoServicio: true,
      documentos: true
    },
    orderBy: { createdAt: "desc" }
  })

  // Parsear datos JSON
  const trabajosParsed = trabajos.map(t => ({
    ...t,
    datos: typeof t.datos === 'string' ? JSON.parse(t.datos) : t.datos
  }))

  return NextResponse.json(trabajosParsed)
}

// POST - Crear trabajo
export async function POST(request: NextRequest) {
  const session = await auth()
  
  if (!session || (session.user.rol !== "ADMIN" && session.user.rol !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { clienteId, tipoServicioId, fecha, estado, observaciones, datos } = body

    // Validar campos requeridos
    if (!clienteId || !tipoServicioId || !fecha) {
      return NextResponse.json({ error: "Cliente, tipo de servicio y fecha son requeridos" }, { status: 400 })
    }

    // Generar código único
    const codigo = generarCodigoTrabajo()

    const trabajo = await prisma.trabajo.create({
      data: {
        codigo,
        clienteId,
        tipoServicioId,
        fecha: new Date(fecha),
        estado: estado || "PENDIENTE",
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
    console.error("Error al crear trabajo:", error)
    return NextResponse.json({ error: "Error al crear trabajo" }, { status: 500 })
  }
}