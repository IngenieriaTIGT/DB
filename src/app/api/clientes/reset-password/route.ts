import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { generarPassword, hashearPassword } from "@/lib/utils"

// POST - Generar nueva contraseña temporal para un cliente
export async function POST(request: NextRequest) {
  const session = await auth()
  
  if (!session || (session.user.rol !== "ADMIN" && session.user.rol !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { clienteId } = body

    if (!clienteId) {
      return NextResponse.json({ error: "ID de cliente requerido" }, { status: 400 })
    }

    // Buscar cliente
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      include: { usuario: true }
    })

    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    // Generar nueva contraseña temporal
    const nuevaPassword = generarPassword(12)
    const passwordHash = await hashearPassword(nuevaPassword)

    // Actualizar contraseña del usuario
    await prisma.usuario.update({
      where: { id: cliente.usuarioId },
      data: {
        password: passwordHash,
        codigoRecuperacion: null,
        codigoRecuperacionExp: null
      }
    })

    return NextResponse.json({
      message: "Contraseña reseteada exitosamente",
      email: cliente.usuario.email,
      password: nuevaPassword
    })
  } catch (error) {
    console.error("Error al resetear contraseña:", error)
    return NextResponse.json({ error: "Error al resetear contraseña" }, { status: 500 })
  }
}
