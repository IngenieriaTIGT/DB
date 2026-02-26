import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"

// POST - Subir foto de perfil
export async function POST(request: NextRequest) {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const usuarioId = formData.get("usuarioId") as string

    if (!file) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 })
    }

    // Validar tipo de archivo
    const tiposPermitidos = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!tiposPermitidos.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de archivo no permitido. Use JPG, PNG, GIF o WebP" }, { status: 400 })
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo es muy grande. Máximo 2MB" }, { status: 400 })
    }

    // Determinar el usuario a actualizar
    const idActualizar = usuarioId || session.user.id

    // Verificar permisos: solo SUPER_ADMIN puede cambiar foto de otros
    if (idActualizar !== session.user.id && session.user.rol !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "No tiene permisos para cambiar esta foto" }, { status: 403 })
    }

    // Crear directorio de uploads si no existe
    const uploadDir = path.join(process.cwd(), "public", "uploads", "perfiles")
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generar nombre único
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const nombreArchivo = `${idActualizar}-${timestamp}.${extension}`
    const ruta = path.join("public", "uploads", "perfiles", nombreArchivo)

    // Guardar archivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(path.join(process.cwd(), ruta), buffer)

    // URL pública
    const urlImagen = `/uploads/perfiles/${nombreArchivo}`

    // Actualizar usuario en la base de datos
    const usuario = await prisma.usuario.update({
      where: { id: idActualizar },
      data: { imagen: urlImagen },
      select: {
        id: true,
        nombre: true,
        email: true,
        imagen: true,
        rol: true
      }
    })

    return NextResponse.json({ 
      message: "Foto actualizada",
      imagen: urlImagen,
      usuario 
    })
  } catch (error) {
    console.error("Error al subir foto:", error)
    return NextResponse.json({ error: "Error al subir foto" }, { status: 500 })
  }
}
