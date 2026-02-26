import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"

// POST - Subir documento (ADMIN y SUPER_ADMIN pueden subir, CLIENTE también puede subir a sus propios trabajos)
export async function POST(request: NextRequest) {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const trabajoId = formData.get("trabajoId") as string

    if (!file || !trabajoId) {
      return NextResponse.json({ error: "Archivo y trabajoId son requeridos" }, { status: 400 })
    }

    // Verificar que el trabajo existe
    const trabajo = await prisma.trabajo.findUnique({
      where: { id: trabajoId },
      include: { cliente: true }
    })

    if (!trabajo) {
      return NextResponse.json({ error: "Trabajo no encontrado" }, { status: 404 })
    }

    // Si es CLIENTE, verificar que el trabajo sea suyo
    if (session.user.rol === "CLIENTE") {
      const cliente = await prisma.cliente.findFirst({
        where: { usuarioId: session.user.id }
      })
      if (!cliente || trabajo.clienteId !== cliente.id) {
        return NextResponse.json({ error: "No autorizado - Este trabajo no pertenece a su cuenta" }, { status: 403 })
      }
    }

    // Crear directorio de uploads si no existe
    const uploadDir = path.join(process.cwd(), "public", "uploads", "documentos")
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generar nombre único
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const nombreArchivo = `${trabajo.codigo}-${timestamp}.${extension}`
    const ruta = path.join("public", "uploads", "documentos", nombreArchivo)

    // Guardar archivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(path.join(process.cwd(), ruta), buffer)

    // Crear registro en base de datos
    const documento = await prisma.documento.create({
      data: {
        nombre: nombreArchivo,
        nombreOriginal: file.name,
        tipo: file.type,
        tamaño: file.size,
        ruta: ruta,
        trabajoId
      }
    })

    return NextResponse.json(documento)
  } catch (error) {
    console.error("Error al subir archivo:", error)
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 })
  }
}