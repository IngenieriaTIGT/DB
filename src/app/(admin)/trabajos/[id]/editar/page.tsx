"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface TipoServicio {
  id: string
  nombre: string
  campos: string
}

interface Trabajo {
  id: string
  codigo: string
  clienteId: string
  tipoServicioId: string
  fecha: string
  estado: string
  observaciones: string | null
  datos: string
  cliente: { id: string; nombre: string }
  tipoServicio: { id: string; nombre: string; campos: string }
}

export default function EditarTrabajoPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [trabajoId, setTrabajoId] = useState<string>("")
  const [trabajo, setTrabajo] = useState<Trabajo | null>(null)
  const [tiposServicio, setTiposServicio] = useState<TipoServicio[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [campos, setCampos] = useState<{ nombre: string; label: string; tipo: string; opciones?: string[] }[]>([])
  
  const [formData, setFormData] = useState({
    tipoServicioId: "",
    fecha: "",
    estado: "PENDIENTE",
    observaciones: "",
    datos: {} as Record<string, string>
  })

  useEffect(() => {
    params.then(p => setTrabajoId(p.id))
  }, [params])

  useEffect(() => {
    if (trabajoId) {
      fetchData()
    }
  }, [trabajoId])

  const fetchData = async () => {
    try {
      // Cargar trabajo
      const resTrabajo = await fetch(`/api/trabajos/${trabajoId}`)
      if (resTrabajo.ok) {
        const data = await resTrabajo.json()
        setTrabajo(data)
        
        // Parsear datos
        const datosParsed = typeof data.datos === 'string' ? JSON.parse(data.datos) : data.datos
        const camposParsed = typeof data.tipoServicio.campos === 'string' 
          ? JSON.parse(data.tipoServicio.campos) 
          : data.tipoServicio.campos
        
        setCampos(camposParsed)
        setFormData({
          tipoServicioId: data.tipoServicioId,
          fecha: new Date(data.fecha).toISOString().split('T')[0],
          estado: data.estado,
          observaciones: data.observaciones || "",
          datos: datosParsed
        })
      }

      // Cargar tipos de servicio
      const resTipos = await fetch("/api/tipos-servicio")
      if (resTipos.ok) {
        setTiposServicio(await resTipos.json())
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTipoServicioChange = (tipoId: string) => {
    const tipo = tiposServicio.find(t => t.id === tipoId)
    if (tipo) {
      const camposParsed = typeof tipo.campos === 'string' ? JSON.parse(tipo.campos) : tipo.campos
      setCampos(camposParsed)
      setFormData({ 
        ...formData, 
        tipoServicioId: tipoId,
        datos: {} // Reset datos when tipo changes
      })
    }
  }

  const handleDatoChange = (nombre: string, valor: string) => {
    setFormData({
      ...formData,
      datos: { ...formData.datos, [nombre]: valor }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/trabajos/${trabajoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoServicioId: formData.tipoServicioId,
          fecha: formData.fecha,
          estado: formData.estado,
          observaciones: formData.observaciones,
          datos: formData.datos
        })
      })

      if (res.ok) {
        router.push(`/trabajos/${trabajoId}`)
      } else {
        const error = await res.json()
        alert(error.error || "Error al actualizar trabajo")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al actualizar trabajo")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/trabajos/${trabajoId}`} className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al trabajo
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Editar Trabajo</h1>
        <p className="text-gray-600 mt-1">Código: {trabajo?.codigo} | Cliente: {trabajo?.cliente.nombre}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Tipo de Servicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Servicio *
          </label>
          <select
            required
            value={formData.tipoServicioId}
            onChange={(e) => handleTipoServicioChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar tipo</option>
            {tiposServicio.map(tipo => (
              <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
            ))}
          </select>
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha *
          </label>
          <input
            type="date"
            required
            value={formData.fecha}
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado *
          </label>
          <select
            required
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PROCESO">En Proceso</option>
            <option value="COMPLETADO">Completado</option>
            <option value="ENTREGADO">Entregado</option>
          </select>
        </div>

        {/* Campos dinámicos */}
        {campos.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Campos del Servicio</h3>
            {campos.map((campo) => (
              <div key={campo.nombre}>
                <label className="block text-sm text-gray-600 mb-1">
                  {campo.label} {campo.tipo !== 'select' && '*'}
                </label>
                {campo.tipo === 'texto' && (
                  <input
                    type="text"
                    value={formData.datos[campo.nombre] || ''}
                    onChange={(e) => handleDatoChange(campo.nombre, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                )}
                {campo.tipo === 'numero' && (
                  <input
                    type="number"
                    value={formData.datos[campo.nombre] || ''}
                    onChange={(e) => handleDatoChange(campo.nombre, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                )}
                {campo.tipo === 'textarea' && (
                  <textarea
                    rows={3}
                    value={formData.datos[campo.nombre] || ''}
                    onChange={(e) => handleDatoChange(campo.nombre, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                )}
                {campo.tipo === 'select' && campo.opciones && (
                  <select
                    value={formData.datos[campo.nombre] || ''}
                    onChange={(e) => handleDatoChange(campo.nombre, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    {campo.opciones.map((op: string) => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones
          </label>
          <textarea
            rows={3}
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
          <Link
            href={`/trabajos/${trabajoId}`}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition text-center"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
