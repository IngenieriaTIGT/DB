import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

export async function GET() {
  try {
    // Crear cliente Prisma directamente
    const adapter = new PrismaPg({ 
      connectionString: process.env.DATABASE_URL! 
    })
    const prisma = new PrismaClient({ adapter })
    
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true
      }
    })
    
    await prisma.$disconnect()
    
    return NextResponse.json({ 
      success: true, 
      count: usuarios.length,
      usuarios,
      dbUrl: process.env.DATABASE_URL ? "configured" : "missing"
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ 
      success: false, 
      error: String(error),
      dbUrl: process.env.DATABASE_URL ? "configured" : "missing"
    }, { status: 500 })
  }
}
