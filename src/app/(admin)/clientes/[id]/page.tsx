import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ResetPasswordButton } from "@/components/ResetPasswordButton"

async function ClienteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      usuario: true,
      trabajos: {
        include: {
          tipoServicio: true
        },
        orderBy: { createdAt: "desc" }
      }
    }
  })

  if (!cliente) {
    notFound()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/clientes" className="text-green-600 hover:text-green-800 text-sm mb-2 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a clientes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{cliente.nombre}</h1>
          <p className="text-gray-600 mt-1">Código: {cliente.codigo}</p>
        </div>
        <div className="flex gap-3">
          <ResetPasswordButton 
            clienteId={cliente.id}
            clienteNombre={cliente.nombre}
            clienteEmail={cliente.usuario.email}
          />
          <Link
            href={`/clientes/${cliente.id}/editar`}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
          >
            Editar Cliente
          </Link>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Nombre</label>
              <p className="font-medium">{cliente.nombre}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">NIT</label>
              <p className="font-medium">{cliente.nit || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Dirección</label>
              <p className="font-medium">{cliente.direccion || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Teléfono</label>
              <p className="font-medium">{cliente.telefono || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium">{cliente.email || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Estado</label>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                cliente.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {cliente.activo ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Credenciales de Acceso</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Email de acceso</label>
              <p className="font-medium">{cliente.usuario.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Estado del usuario</label>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                cliente.usuario.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {cliente.usuario.activo ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div>
              <label className="text-sm text-gray-500">Fecha de registro</label>
              <p className="font-medium">{new Date(cliente.usuario.createdAt).toLocaleDateString("es-GT")}</p>
            </div>
          </div>
          
          {cliente.observaciones && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="text-sm text-gray-500">Observaciones</label>
              <p className="text-gray-700 mt-1">{cliente.observaciones}</p>
            </div>
          )}
        </div>
      </div>

      {/* Trabajos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Trabajos Realizados ({cliente.trabajos.length})</h2>
        </div>
        
        {cliente.trabajos.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <p>No hay trabajos registrados para este cliente</p>
            <Link
              href={`/trabajos/nuevo?clienteId=${cliente.id}`}
              className="mt-4 inline-block text-blue-600 hover:text-blue-800"
            >
              Crear primer trabajo
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cliente.trabajos.map((trabajo) => (
                  <tr key={trabajo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-green-600">{trabajo.codigo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{trabajo.tipoServicio.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(trabajo.fecha).toLocaleDateString("es-GT")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        trabajo.estado === "COMPLETADO" ? "bg-green-100 text-green-800" :
                        trabajo.estado === "ENTREGADO" ? "bg-blue-100 text-blue-800" :
                        trabajo.estado === "EN_PROCESO" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {trabajo.estado.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/trabajos/${trabajo.id}`}
                        className="text-green-600 hover:text-green-800"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClienteDetallePage
