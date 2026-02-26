import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ session: null })
  }

  return NextResponse.json({ 
    session: {
      user: {
        id: session.user.id,
        email: session.user.email,
        nombre: session.user.nombre,
        rol: session.user.rol
      }
    }
  })
}
