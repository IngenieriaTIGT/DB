import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    hasDbUrl: !!process.env.DATABASE_URL,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV
  })
}
