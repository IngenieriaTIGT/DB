"use client"

import { useState } from "react"
import Link from "next/link"

interface Trabajo {
  id: string
  codigo: string
  fecha: Date
  estado: string
  observaciones: string | null
  datos: Record<string, unknown>
  cliente: {
    id: string
    codigo: string
    nombre: string
    email: string | null
    telefono: string | null
  }
  tipoServicio: {
    id: string
    nombre: string
    descripcion: string | null
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

interface TrabajoDetalleClientProps {
  trabajo: Trabajo
}

export default function TrabajoDetalleClient({ trabajo }: TrabajoDetalleClientProps) {
  const [estado, setEstado] = useState(trabajo.estado)
  const [documentos, setDocumentos] = useState(trabajo.documentos)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

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

  const handleEstadoChange = async (nuevoEstado: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/trabajos/${trabajo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado })
      })
      if (res.ok) {
        setEstado(nuevoEstado)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("trabajoId", trabajo.id)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })

      if (res.ok) {
        const nuevoDoc = await res.json()
        setDocumentos([...documentos, nuevoDoc])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDocumento = async (docId: string) => {
    if (!confirm("¿Está seguro de eliminar este documento?")) return

    try {
      const res = await fetch(`/api/documentos/${docId}`, {
        method: "DELETE"
      })
      if (res.ok) {
        setDocumentos(documentos.filter(d => d.id !== docId))
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/trabajos" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Trabajos
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{trabajo.tipoServicio.nombre}</h1>
            <p className="text-gray-600 mt-1">Código: {trabajo.codigo}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getEstadoColor(estado)}`}>
            {estado.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cliente */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cliente</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-medium text-gray-900">{trabajo.cliente.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Código</p>
                <p className="font-medium text-gray-900">{trabajo.cliente.codigo}</p>
              </div>
              {trabajo.cliente.email && (
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{trabajo.cliente.email}</p>
                </div>
              )}
              {trabajo.cliente.telefono && (
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium text-gray-900">{trabajo.cliente.telefono}</p>
                </div>
              )}
            </div>
          </div>

          {/* Detalles del servicio */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalles del Servicio</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="font-medium text-gray-900">{formatearFecha(trabajo.fecha)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tipo de Servicio</p>
                <p className="font-medium text-gray-900">{trabajo.tipoServicio.nombre}</p>
              </div>
              {campos.map((campo: { nombre: string; label: string; tipo: string }) => (
                <div key={campo.nombre}>
                  <p className="text-sm text-gray-500">{campo.label}</p>
                  <p className="font-medium text-gray-900">
                    {trabajo.datos[campo.nombre]?.toString() || "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Observaciones */}
          {trabajo.observaciones && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h2>
              <p className="text-gray-600">{trabajo.observaciones}</p>
            </div>
          )}

          {/* Documentos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Documentos</h2>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {uploading ? "Subiendo..." : "Subir Documento"}
                </span>
              </label>
            </div>

            {documentos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay documentos adjuntos</p>
            ) : (
              <div className="space-y-3">
                {documentos.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">{doc.nombreOriginal}</p>
                        <p className="text-sm text-gray-500">{formatearTamano(doc.tamaño)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`/api/documentos/${doc.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                      >
                        Ver
                      </a>
                      <button
                        onClick={() => handleDeleteDocumento(doc.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cambiar estado */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cambiar Estado</h2>
            <div className="space-y-2">
              {["PENDIENTE", "EN_PROCESO", "COMPLETADO", "ENTREGADO"].map((e) => (
                <button
                  key={e}
                  onClick={() => handleEstadoChange(e)}
                  disabled={saving}
                  className={`w-full px-4 py-2 rounded-lg text-left transition ${
                    estado === e
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {e.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h2>
            <div className="space-y-3">
              <Link
                href={`/trabajos/${trabajo.id}/editar`}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar Trabajo
              </Link>
              <button
                onClick={() => window.print()}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}