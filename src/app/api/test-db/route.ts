import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      count: usuarios.length,
      usuarios 
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 })
  }
}
