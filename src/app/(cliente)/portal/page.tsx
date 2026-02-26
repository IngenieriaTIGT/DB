import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import TrabajoCard from "./TrabajoCard"

async function PortalPage() {
  const session = await auth()
  
  if (!session || session.user.rol !== "CLIENTE") {
    redirect("/login")
  }

  // Obtener información del cliente
  const cliente = await prisma.cliente.findFirst({
    where: { usuarioId: session.user.id }
  })

  if (!cliente) {
    redirect("/login")
  }

  // Obtener trabajos del cliente
  const trabajosRaw = await prisma.trabajo.findMany({
    where: { clienteId: cliente.id },
    include: {
      tipoServicio: true,
      documentos: true
    },
    orderBy: { fecha: "desc" }
  })

  // Parsear datos JSON
  const trabajos = trabajosRaw.map(t => ({
    ...t,
    datos: typeof t.datos === 'string' ? JSON.parse(t.datos) : t.datos,
    tipoServicio: {
      ...t.tipoServicio,
      campos: typeof t.tipoServicio.campos === 'string' 
        ? JSON.parse(t.tipoServicio.campos) 
        : t.tipoServicio.campos
    }
  }))

  // Estadísticas
  const totalTrabajos = trabajos.length
  const trabajosCompletados = trabajos.filter(t => t.estado === "COMPLETADO" || t.estado === "ENTREGADO").length
  const trabajosPendientes = trabajos.filter(t => t.estado === "PENDIENTE" || t.estado === "EN_PROCESO").length

  return (
    <div>
      {/* Bienvenida */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bienvenido, {cliente.nombre}</h1>
        <p className="text-gray-600 mt-2">Aquí puede ver todos los trabajos y servicios que le hemos realizado</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Trabajos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalTrabajos}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completados</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{trabajosCompletados}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Proceso</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{trabajosPendientes}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de trabajos */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Mis Trabajos</h2>
      </div>

      {trabajos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium text-gray-900">No hay trabajos registrados</p>
          <p className="text-gray-500 mt-1">Los trabajos que le realicemos aparecerán aquí</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trabajos.map((trabajo) => (
            <TrabajoCard key={trabajo.id} trabajo={trabajo as any} />
          ))}
        </div>
      )}
    </div>
  )
}

export default PortalPage