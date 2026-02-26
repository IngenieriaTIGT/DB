"use client"

import { useState, useEffect } from "react"

interface TipoServicio {
  id: string
  nombre: string
  descripcion: string | null
  campos: CampoConfig[]
  activo: boolean
  createdAt: string
}

interface CampoConfig {
  nombre: string
  label: string
  tipo: string
  requerido?: boolean
  opciones?: string[]
}

interface CampoForm {
  nombre: string
  label: string
  tipo: string
  requerido: boolean
  opciones: string
}

export default function TiposServicioPage() {
  const [tipos, setTipos] = useState<TipoServicio[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTipo, setEditingTipo] = useState<TipoServicio | null>(null)
  const [formData, setFormData] = useState<{ nombre: string; descripcion: string; campos: CampoForm[] }>({
    nombre: "",
    descripcion: "",
    campos: [{ nombre: "", label: "", tipo: "texto", requerido: false, opciones: "" }]
  })

  useEffect(() => {
    fetchTipos()
  }, [])

  const fetchTipos = async () => {
    try {
      const res = await fetch("/api/tipos-servicio")
      const data = await res.json()
      // Parsear campos JSON string
      const tiposParsed = data.map((t: any) => ({
        ...t,
        campos: typeof t.campos === 'string' ? JSON.parse(t.campos) : t.campos
      }))
      setTipos(tiposParsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCampo = () => {
    setFormData({
      ...formData,
      campos: [...formData.campos, { nombre: "", label: "", tipo: "texto", requerido: false, opciones: "" }]
    })
  }

  const handleRemoveCampo = (index: number) => {
    setFormData({
      ...formData,
      campos: formData.campos.filter((_, i) => i !== index)
    })
  }

  const handleCampoChange = (index: number, field: string, value: string | boolean) => {
    const nuevosCampos = [...formData.campos]
    nuevosCampos[index] = { ...nuevosCampos[index], [field]: value }
    setFormData({ ...formData, campos: nuevosCampos })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const camposFormateados = formData.campos.map(c => ({
      nombre: c.nombre,
      label: c.label,
      tipo: c.tipo,
      requerido: c.requerido,
      ...(c.tipo === "select" && c.opciones ? { opciones: c.opciones.split(",").map(o => o.trim()) } : {})
    }))

    try {
      const url = editingTipo ? `/api/tipos-servicio/${editingTipo.id}` : "/api/tipos-servicio"
      const method = editingTipo ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          campos: camposFormateados
        })
      })

      if (res.ok) {
        setShowModal(false)
        setEditingTipo(null)
        setFormData({
          nombre: "",
          descripcion: "",
          campos: [{ nombre: "", label: "", tipo: "texto", requerido: false, opciones: "" }]
        })
        fetchTipos()
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleEdit = (tipo: TipoServicio) => {
    setEditingTipo(tipo)
    setFormData({
      nombre: tipo.nombre,
      descripcion: tipo.descripcion || "",
      campos: tipo.campos.map(c => ({
        nombre: c.nombre,
        label: c.label,
        tipo: c.tipo,
        requerido: c.requerido || false,
        opciones: c.opciones?.join(", ") || ""
      }))
    })
    setShowModal(true)
  }

  const handleToggleActivo = async (tipo: TipoServicio) => {
    try {
      await fetch(`/api/tipos-servicio/${tipo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !tipo.activo })
      })
      fetchTipos()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tipos de Servicio</h1>
          <p className="text-gray-600 mt-2">Configura los tipos de servicios que ofreces</p>
        </div>
        <button
          onClick={() => {
            setEditingTipo(null)
            setFormData({
              nombre: "",
              descripcion: "",
              campos: [{ nombre: "", label: "", tipo: "texto", requerido: false, opciones: "" }]
            })
            setShowModal(true)
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo Tipo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tipos.map((tipo) => (
          <div key={tipo.id} className={`bg-white rounded-xl shadow-sm border ${tipo.activo ? "border-gray-200" : "border-red-200 bg-red-50"} p-6`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{tipo.nombre}</h3>
                <p className="text-sm text-gray-500 mt-1">{tipo.descripcion}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                tipo.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {tipo.activo ? "Activo" : "Inactivo"}
              </span>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Campos ({tipo.campos.length})</p>
              <div className="flex flex-wrap gap-2">
                {tipo.campos.slice(0, 4).map((campo, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {campo.label}
                  </span>
                ))}
                {tipo.campos.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                    +{tipo.campos.length - 4} más
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(tipo)}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Editar
              </button>
              <button
                onClick={() => handleToggleActivo(tipo)}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition ${
                  tipo.activo
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {tipo.activo ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        ))}

        {tipos.length === 0 && (
          <div className="col-span-full text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg font-medium text-gray-900">No hay tipos de servicio</p>
            <p className="text-gray-500 mt-1">Crea el primer tipo de servicio para comenzar</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTipo ? "Editar Tipo de Servicio" : "Nuevo Tipo de Servicio"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Polígrafo, Visita Socioeconómica"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Breve descripción del servicio"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Campos del Formulario
                    </label>
                    <button
                      type="button"
                      onClick={handleAddCampo}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Agregar campo
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.campos.map((campo, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium text-gray-700">Campo {index + 1}</span>
                          {formData.campos.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCampo(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Nombre (ej: nombreEvaluado)"
                            value={campo.nombre}
                            onChange={(e) => handleCampoChange(index, "nombre", e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Etiqueta (ej: Nombre del Evaluado)"
                            value={campo.label}
                            onChange={(e) => handleCampoChange(index, "label", e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <select
                            value={campo.tipo}
                            onChange={(e) => handleCampoChange(index, "tipo", e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="texto">Texto</option>
                            <option value="textarea">Texto largo</option>
                            <option value="fecha">Fecha</option>
                            <option value="numero">Número</option>
                            <option value="select">Selección</option>
                          </select>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={campo.requerido}
                              onChange={(e) => handleCampoChange(index, "requerido", e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-700">Requerido</span>
                          </label>
                        </div>

                        {campo.tipo === "select" && (
                          <input
                            type="text"
                            placeholder="Opciones separadas por coma (ej: Opción 1, Opción 2)"
                            value={campo.opciones}
                            onChange={(e) => handleCampoChange(index, "opciones", e.target.value)}
                            className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingTipo ? "Guardar Cambios" : "Crear Tipo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}