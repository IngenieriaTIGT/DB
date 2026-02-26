import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { generarPassword, hashearPassword } from "@/lib/utils"

// POST - Generar nueva contraseña temporal para un usuario (solo SUPER_ADMIN)
export async function POST(request: NextRequest) {
  const session = await auth()
  
  if (!session || session.user.rol !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado - Solo SUPER_ADMIN puede resetear contraseñas" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { usuarioId } = body

    if (!usuarioId) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 })
    }

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    })

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Generar nueva contraseña temporal
    const nuevaPassword = generarPassword(12)
    const passwordHash = await hashearPassword(nuevaPassword)

    // Actualizar contraseña del usuario
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        password: passwordHash,
        codigoRecuperacion: null,
        codigoRecuperacionExp: null
      }
    })

    return NextResponse.json({
      message: "Contraseña reseteada exitosamente",
      email: usuario.email,
      password: nuevaPassword
    })
  } catch (error) {
    console.error("Error al resetear contraseña:", error)
    return NextResponse.json({ error: "Error al resetear contraseña" }, { status: 500 })
  }
}
