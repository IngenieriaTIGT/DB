import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import Link from "next/link"

async function ClientesPage() {
  const session = await auth()
  const isSuperAdmin = session?.user?.rol === "SUPER_ADMIN"

  const clientes = await prisma.cliente.findMany({
    include: {
      usuario: {
        select: {
          id: true,
          email: true,
          nombre: true,
          activo: true,
          rol: true
        }
      },
      _count: {
        select: { trabajos: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-2">Gestión de clientes y sus credenciales de acceso</p>
        </div>
        <Link
          href="/clientes/nuevo"
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo Cliente
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trabajos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900">No hay clientes registrados</p>
                    <p className="mt-1">Comienza agregando tu primer cliente</p>
                  </td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-green-600">{cliente.codigo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cliente.nombre}</div>
                      <div className="text-sm text-gray-500">{cliente.usuario.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cliente.nit || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cliente.telefono || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cliente.email || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{cliente._count.trabajos}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        cliente.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {cliente.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Link
                          href={`/clientes/${cliente.id}`}
                          className="text-green-600 hover:text-green-800"
                        >
                          Ver
                        </Link>
                        <Link
                          href={`/clientes/${cliente.id}/editar`}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Editar
                        </Link>
                        {isSuperAdmin && (
                          <Link
                            href={`/clientes/${cliente.id}/eliminar`}
                            className="text-red-600 hover:text-red-800"
                          >
                            Eliminar
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ClientesPage