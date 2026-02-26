import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
    const prisma = new PrismaClient({ adapter })
    
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    })
    
    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" })
    }
    
    const passwordValid = await bcrypt.compare(password, usuario.password)
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      usuario: {
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        activo: usuario.activo
      },
      passwordValid,
      passwordLength: password.length,
      hashLength: usuario.password.length
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
