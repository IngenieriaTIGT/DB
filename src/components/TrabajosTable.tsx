"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Trabajo {
  id: string
  codigo: string
  fecha: Date
  estado: string
  observaciones: string | null
  datos: string
  cliente: {
    id: string
    nombre: string
    codigo: string
  }
  tipoServicio: {
    id: string
    nombre: string
  }
  documentos: {
    id: string
    nombre: string
  }[]
}

interface Cliente {
  id: string
  nombre: string
  codigo: string
}

interface TipoServicio {
  id: string
  nombre: string
}

interface Props {
  trabajos: Trabajo[]
  clientes: Cliente[]
  tiposServicio: TipoServicio[]
  userRol?: string
}

export function TrabajosTable({ trabajos, clientes, tiposServicio, userRol }: Props) {
  const router = useRouter()
  const [busqueda, setBusqueda] = useState("")
  const [clienteFiltro, setClienteFiltro] = useState("")
  const [tipoFiltro, setTipoFiltro] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState("")
  const [eliminando, setEliminando] = useState<string | null>(null)

  const puedeEliminar = userRol === "ADMIN" || userRol === "SUPER_ADMIN"

  const trabajosFiltrados = useMemo(() => {
    return trabajos.filter((trabajo) => {
      // Filtro de búsqueda
      if (busqueda) {
        const busquedaLower = busqueda.toLowerCase()
        if (
          !trabajo.codigo.toLowerCase().includes(busquedaLower) &&
          !trabajo.cliente.nombre.toLowerCase().includes(busquedaLower)
        ) {
          return false
        }
      }

      // Filtro de cliente
      if (clienteFiltro && trabajo.cliente.id !== clienteFiltro) {
        return false
      }

      // Filtro de tipo de servicio
      if (tipoFiltro && trabajo.tipoServicio.id !== tipoFiltro) {
        return false
      }

      // Filtro de estado
      if (estadoFiltro && trabajo.estado !== estadoFiltro) {
        return false
      }

      return true
    })
  }, [trabajos, busqueda, clienteFiltro, tipoFiltro, estadoFiltro])

  const limpiarFiltros = () => {
    setBusqueda("")
    setClienteFiltro("")
    setTipoFiltro("")
    setEstadoFiltro("")
  }

  const handleEliminar = async (trabajoId: string, codigo: string) => {
    if (!confirm(`¿Está seguro de eliminar el trabajo ${codigo}? Se eliminarán también los documentos asociados.`)) {
      return
    }

    setEliminando(trabajoId)
    try {
      const res = await fetch(`/api/trabajos/${trabajoId}`, {
        method: "DELETE"
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Error al eliminar trabajo")
        return
      }

      router.refresh()
    } catch {
      alert("Error al eliminar trabajo")
    } finally {
      setEliminando(null)
    }
  }

  return (
    <div>
      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-700">Filtros</h3>
          {(busqueda || clienteFiltro || tipoFiltro || estadoFiltro) && (
            <button
              onClick={limpiarFiltros}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Limpiar filtros
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              placeholder="Código o cliente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <select
              value={clienteFiltro}
              onChange={(e) => setClienteFiltro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Servicio</label>
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              {tiposServicio.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="COMPLETADO">Completado</option>
              <option value="ENTREGADO">Entregado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="mb-4 text-sm text-gray-600">
        Mostrando {trabajosFiltrados.length} de {trabajos.length} trabajos
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Docs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trabajosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900">No hay trabajos que coincidan</p>
                    <p className="mt-1">Intenta con otros filtros</p>
                  </td>
                </tr>
              ) : (
                trabajosFiltrados.map((trabajo) => (
                  <tr key={trabajo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-green-600">{trabajo.codigo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{trabajo.cliente.nombre}</div>
                      <div className="text-sm text-gray-500">{trabajo.cliente.codigo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{trabajo.tipoServicio.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(trabajo.fecha).toLocaleDateString("es-GT")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        trabajo.estado === "COMPLETADO" ? "bg-green-100 text-green-800" :
                        trabajo.estado === "PENDIENTE" ? "bg-yellow-100 text-yellow-800" :
                        trabajo.estado === "EN_PROCESO" ? "bg-blue-100 text-blue-800" :
                        "bg-purple-100 text-purple-800"
                      }`}>
                        {trabajo.estado.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {trabajo.documentos.length > 0 ? (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {trabajo.documentos.length}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Link
                          href={`/trabajos/${trabajo.id}`}
                          className="text-green-600 hover:text-green-800"
                        >
                          Ver
                        </Link>
                        <Link
                          href={`/trabajos/${trabajo.id}/editar`}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Editar
                        </Link>
                        {puedeEliminar && (
                          <button
                            onClick={() => handleEliminar(trabajo.id, trabajo.codigo)}
                            disabled={eliminando === trabajo.id}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {eliminando === trabajo.id ? "Eliminando..." : "Eliminar"}
                          </button>
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
