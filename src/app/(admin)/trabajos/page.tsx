import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { TrabajosTable } from "@/components/TrabajosTable"

async function TrabajosPage() {
  const session = await auth()
  
  const trabajos = await prisma.trabajo.findMany({
    include: {
      cliente: true,
      tipoServicio: true,
      documentos: true
    },
    orderBy: { createdAt: "desc" }
  })

  const clientes = await prisma.cliente.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" }
  })

  const tiposServicio = await prisma.tipoServicio.findMany({
    where: { activo: true }
  })

  // Serializar fechas para el cliente
  const trabajosSerializados = trabajos.map(t => ({
    ...t,
    fecha: t.fecha,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt
  }))

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trabajos</h1>
          <p className="text-gray-600 mt-2">Gestión de trabajos y servicios realizados</p>
        </div>
        <Link
          href="/trabajos/nuevo"
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo Trabajo
        </Link>
      </div>

      <TrabajosTable 
        trabajos={trabajosSerializados} 
        clientes={clientes} 
        tiposServicio={tiposServicio}
        userRol={session?.user?.rol}
      />
    </div>
  )
}

export default TrabajosPage
