import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { unlink } from "fs/promises"
import path from "path"

// GET - Descargar documento
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params

  const documento = await prisma.documento.findUnique({
    where: { id },
    include: {
      trabajo: {
        include: { cliente: true }
      }
    }
  })

  if (!documento) {
    return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 })
  }

  // Verificar permisos
  if (session.user.rol === "CLIENTE") {
    if (documento.trabajo.cliente.usuarioId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }
  }

  try {
    const filePath = path.join(process.cwd(), documento.ruta)
    const fileBuffer = await require("fs/promises").readFile(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": documento.tipo,
        "Content-Disposition": `attachment; filename="${documento.nombreOriginal}"`
      }
    })
  } catch (error) {
    console.error("Error al leer archivo:", error)
    return NextResponse.json({ error: "Error al leer el archivo" }, { status: 500 })
  }
}

// DELETE - Eliminar documento (solo SUPER_ADMIN)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  
  if (!session || session.user.rol !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado - Solo SUPER_ADMIN puede eliminar" }, { status: 401 })
  }

  const { id } = await params

  const documento = await prisma.documento.findUnique({
    where: { id }
  })

  if (!documento) {
    return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 })
  }

  try {
    // Eliminar archivo físico
    const filePath = path.join(process.cwd(), documento.ruta)
    await unlink(filePath).catch(() => {
      // Ignorar error si el archivo no existe
    })

    // Eliminar registro de base de datos
    await prisma.documento.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Documento eliminado" })
  } catch (error) {
    console.error("Error al eliminar documento:", error)
    return NextResponse.json({ error: "Error al eliminar documento" }, { status: 500 })
  }
}