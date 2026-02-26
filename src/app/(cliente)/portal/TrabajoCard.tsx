"use client"

import { useState } from "react"

interface Trabajo {
  id: string
  codigo: string
  fecha: Date
  estado: string
  observaciones: string | null
  datos: Record<string, unknown>
  tipoServicio: {
    id: string
    nombre: string
    campos: { nombre: string; label: string; tipo: string }[]
  }
  documentos: {
    id: string
    nombre: string
    nombreOriginal: string
    tipo: string
    tamaño: number
    ruta: string
  }[]
}

interface TrabajoCardProps {
  trabajo: Trabajo
}

export default function TrabajoCard({ trabajo }: TrabajoCardProps) {
  const [expanded, setExpanded] = useState(false)

  // Parsear campos si es string
  const campos = typeof trabajo.tipoServicio.campos === 'string' 
    ? JSON.parse(trabajo.tipoServicio.campos) 
    : trabajo.tipoServicio.campos

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "COMPLETADO":
        return "bg-green-100 text-green-800"
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800"
      case "EN_PROCESO":
        return "bg-blue-100 text-blue-800"
      case "ENTREGADO":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatearFecha = (fecha: Date) => {
    return new Intl.DateTimeFormat("es-GT", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(new Date(fecha))
  }

  const formatearTamano = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-gray-300">
      {/* Header */}
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{trabajo.tipoServicio.nombre}</h3>
              <p className="text-sm text-gray-500">Código: {trabajo.codigo}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-gray-600">{formatearFecha(trabajo.fecha)}</p>
              <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(trabajo.estado)}`}>
                {trabajo.estado.replace("_", " ")}
              </span>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Mobile info */}
        <div className="sm:hidden mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">{formatearFecha(trabajo.fecha)}</p>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(trabajo.estado)}`}>
            {trabajo.estado.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-200 p-6">
          {/* Detalles del trabajo */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Detalles del Servicio</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {campos.map((campo: { nombre: string; label: string; tipo: string }) => (
                <div key={campo.nombre}>
                  <p className="text-xs text-gray-500">{campo.label}</p>
                  <p className="text-sm text-gray-900">
                    {trabajo.datos[campo.nombre]?.toString() || "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Observaciones */}
          {trabajo.observaciones && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Observaciones</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{trabajo.observaciones}</p>
            </div>
          )}

          {/* Documentos */}
          {trabajo.documentos.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Documentos Adjuntos</h4>
              <div className="space-y-2">
                {trabajo.documentos.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.nombreOriginal}</p>
                        <p className="text-xs text-gray-500">{formatearTamano(doc.tamaño)}</p>
                      </div>
                    </div>
                    <a
                      href={`/api/documentos/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                    >
                      Descargar
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir
            </button>
          </div>
        </div>
      )}
    </div>
  )
}