import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    
    return NextResponse.json({
      hasSession: !!session,
      session: session ? {
        user: {
          id: session.user.id,
          email: session.user.email,
          nombre: session.user.nombre,
          rol: session.user.rol
        }
      } : null
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
