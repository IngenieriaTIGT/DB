import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { generarCodigoCliente, generarPassword, hashearPassword } from "@/lib/utils"

// GET - Listar clientes o obtener uno por ID
export async function GET(request: NextRequest) {
  const session = await auth()
  
  if (!session || session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (id) {
    // Obtener un cliente específico
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        usuario: {
          select: { id: true, email: true, nombre: true, activo: true }
        },
        trabajos: {
          include: {
            tipoServicio: true
          },
          orderBy: { createdAt: "desc" }
        }
      }
    })

    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    return NextResponse.json(cliente)
  }

  // Listar todos los clientes
  const clientes = await prisma.cliente.findMany({
    include: {
      usuario: {
        select: { id: true, email: true, nombre: true, activo: true }
      },
      _count: {
        select: { trabajos: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json(clientes)
}

// POST - Crear cliente
export async function POST(request: NextRequest) {
  const session = await auth()
  
  if (!session || session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { nombre, nit, direccion, telefono, email, observaciones } = body

    // Validar campos requeridos
    if (!nombre || !email) {
      return NextResponse.json({ error: "Nombre y email son requeridos" }, { status: 400 })
    }

    // Verificar si el email ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    })

    if (usuarioExistente) {
      return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 400 })
    }

    // Generar código único y password
    const codigo = generarCodigoCliente()
    const passwordTemporal = generarPassword(12)
    const passwordHash = await hashearPassword(passwordTemporal)

    // Crear usuario y cliente en una transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // Crear usuario
      const usuario = await tx.usuario.create({
        data: {
          email,
          password: passwordHash,
          nombre,
          rol: "CLIENTE"
        }
      })

      // Crear cliente
      const cliente = await tx.cliente.create({
        data: {
          codigo,
          nombre,
          nit,
          direccion,
          telefono,
          email,
          observaciones,
          usuarioId: usuario.id
        },
        include: {
          usuario: {
            select: { id: true, email: true, nombre: true }
          }
        }
      })

      return cliente
    })

    return NextResponse.json({
      cliente: resultado,
      usuario: {
        email: email,
        password: passwordTemporal
      }
    })
  } catch (error) {
    console.error("Error al crear cliente:", error)
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 })
  }
}

// PUT - Actualizar cliente
export async function PUT(request: NextRequest) {
  const session = await auth()
  
  if (!session || session.user.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, nombre, nit, direccion, telefono, email, observaciones, activo } = body

    if (!id) {
      return NextResponse.json({ error: "ID de cliente requerido" }, { status: 400 })
    }

    // Verificar que el cliente existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { id },
      include: { usuario: true }
    })

    if (!clienteExistente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    // Actualizar cliente y usuario
    const resultado = await prisma.$transaction(async (tx) => {
      // Actualizar usuario
      await tx.usuario.update({
        where: { id: clienteExistente.usuarioId },
        data: {
          nombre,
          activo: activo ? true : false
        }
      })

      // Actualizar cliente
      const cliente = await tx.cliente.update({
        where: { id },
        data: {
          nombre,
          nit,
          direccion,
          telefono,
          email,
          observaciones,
          activo: activo ? true : false
        },
        include: {
          usuario: {
            select: { id: true, email: true, nombre: true, activo: true }
          }
        }
      })

      return cliente
    })

    return NextResponse.json(resultado)
  } catch (error) {
    console.error("Error al actualizar cliente:", error)
    return NextResponse.json({ error: "Error al actualizar cliente" }, { status: 500 })
  }
}
