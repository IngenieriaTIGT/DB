import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashearPassword } from "@/lib/utils"
import bcrypt from "bcryptjs"

// POST - Solicitar código de recuperación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 })
    }

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    })

    if (!usuario) {
      // Por seguridad, no revelamos si el email existe o no
      return NextResponse.json({ 
        message: "Si el email existe, recibirás un código de recuperación" 
      })
    }

    // Generar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString()
    
    // El código expira en 15 minutos
    const expiracion = new Date(Date.now() + 15 * 60 * 1000)

    // Guardar código en la base de datos
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        codigoRecuperacion: codigo,
        codigoRecuperacionExp: expiracion
      }
    })

    // En producción, aquí enviarías el email
    // Por ahora, devolvemos el código en la respuesta (solo para desarrollo)
    return NextResponse.json({ 
      message: "Código generado exitosamente",
      // En producción, remover esta línea y enviar por email
      codigo: process.env.NODE_ENV === "development" ? codigo : undefined,
      email: usuario.email
    })
  } catch (error) {
    console.error("Error al solicitar recuperación:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}

// PUT - Verificar código y cambiar contraseña
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, codigo, nuevaPassword } = body

    if (!email || !codigo || !nuevaPassword) {
      return NextResponse.json({ 
        error: "Email, código y nueva contraseña son requeridos" 
      }, { status: 400 })
    }

    if (nuevaPassword.length < 6) {
      return NextResponse.json({ 
        error: "La contraseña debe tener al menos 6 caracteres" 
      }, { status: 400 })
    }

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    })

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Verificar código
    if (
      !usuario.codigoRecuperacion ||
      !usuario.codigoRecuperacionExp ||
      usuario.codigoRecuperacion !== codigo ||
      new Date() > usuario.codigoRecuperacionExp
    ) {
      return NextResponse.json({ 
        error: "Código inválido o expirado" 
      }, { status: 400 })
    }

    // Hashear nueva contraseña
    const passwordHash = await hashearPassword(nuevaPassword)

    // Actualizar contraseña y limpiar código de recuperación
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        password: passwordHash,
        codigoRecuperacion: null,
        codigoRecuperacionExp: null
      }
    })

    return NextResponse.json({ 
      message: "Contraseña actualizada exitosamente" 
    })
  } catch (error) {
    console.error("Error al cambiar contraseña:", error)
    return NextResponse.json({ error: "Error al cambiar contraseña" }, { status: 500 })
  }
}
