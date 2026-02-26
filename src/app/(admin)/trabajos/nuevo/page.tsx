"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Cliente {
  id: string
  codigo: string
  nombre: string
}

interface TipoServicio {
  id: string
  nombre: string
  campos: CampoConfig[] | string
}

interface CampoConfig {
  nombre: string
  label: string
  tipo: string
  requerido?: boolean
  opciones?: string[]
}

export default function NuevoTrabajoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [tiposServicio, setTiposServicio] = useState<TipoServicio[]>([])
  const [camposDinamicos, setCamposDinamicos] = useState<CampoConfig[]>([])

  const [formData, setFormData] = useState({
    clienteId: "",
    tipoServicioId: "",
    fecha: new Date().toISOString().split("T")[0],
    estado: "PENDIENTE",
    observaciones: "",
    datos: {} as Record<string, string>
  })

  useEffect(() => {
    fetchClientes()
    fetchTiposServicio()
  }, [])

  const fetchClientes = async () => {
    const res = await fetch("/api/clientes")
    const data = await res.json()
    setClientes(data)
  }

  const fetchTiposServicio = async () => {
    const res = await fetch("/api/tipos-servicio")
    const data = await res.json()
    // Filtrar solo activos y parsear campos
    const tiposActivos = data.filter((t: any) => t.activo).map((t: any) => ({
      ...t,
      campos: typeof t.campos === 'string' ? JSON.parse(t.campos) : t.campos
    }))
    setTiposServicio(tiposActivos)
  }

  useEffect(() => {
    if (formData.tipoServicioId) {
      const tipo = tiposServicio.find(t => t.id === formData.tipoServicioId)
      if (tipo) {
        const campos = typeof tipo.campos === 'string' ? JSON.parse(tipo.campos) : tipo.campos
        setCamposDinamicos(campos)
        // Inicializar datos dinámicos
        const datosIniciales: Record<string, string> = {}
        campos.forEach((campo: CampoConfig) => {
          datosIniciales[campo.nombre] = ""
        })
        setFormData(prev => ({ ...prev, datos: datosIniciales }))
      }
    } else {
      setCamposDinamicos([])
      setFormData(prev => ({ ...prev, datos: {} }))
    }
  }, [formData.tipoServicioId, tiposServicio])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleDatoChange = (nombre: string, value: string) => {
    setFormData({
      ...formData,
      datos: { ...formData.datos, [nombre]: value }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/trabajos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al crear trabajo")
        setLoading(false)
        return
      }

      router.push(`/trabajos/${data.id}`)
    } catch {
      setError("Error al crear trabajo")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/trabajos" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Trabajos
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Trabajo</h1>
        <p className="text-gray-600 mt-2">Registra un nuevo trabajo o servicio</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información General</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="clienteId" className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                id="clienteId"
                name="clienteId"
                value={formData.clienteId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} ({cliente.codigo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tipoServicioId" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Servicio *
              </label>
              <select
                id="tipoServicioId"
                name="tipoServicioId"
                value={formData.tipoServicioId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar tipo</option>
                {tiposServicio.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_PROCESO">En Proceso</option>
                  <option value="COMPLETADO">Completado</option>
                  <option value="ENTREGADO">Entregado</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Campos dinámicos */}
        {camposDinamicos.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalles del Servicio</h2>

            <div className="space-y-4">
              {camposDinamicos.map((campo) => (
                <div key={campo.nombre}>
                  <label htmlFor={campo.nombre} className="block text-sm font-medium text-gray-700 mb-2">
                    {campo.label} {campo.requerido && "*"}
                  </label>
                  
                  {campo.tipo === "texto" && (
                    <input
                      type="text"
                      id={campo.nombre}
                      value={formData.datos[campo.nombre] || ""}
                      onChange={(e) => handleDatoChange(campo.nombre, e.target.value)}
                      required={campo.requerido}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  )}

                  {campo.tipo === "textarea" && (
                    <textarea
                      id={campo.nombre}
                      value={formData.datos[campo.nombre] || ""}
                      onChange={(e) => handleDatoChange(campo.nombre, e.target.value)}
                      required={campo.requerido}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  )}

                  {campo.tipo === "fecha" && (
                    <input
                      type="date"
                      id={campo.nombre}
                      value={formData.datos[campo.nombre] || ""}
                      onChange={(e) => handleDatoChange(campo.nombre, e.target.value)}
                      required={campo.requerido}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  )}

                  {campo.tipo === "numero" && (
                    <input
                      type="number"
                      id={campo.nombre}
                      value={formData.datos[campo.nombre] || ""}
                      onChange={(e) => handleDatoChange(campo.nombre, e.target.value)}
                      required={campo.requerido}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  )}

                  {campo.tipo === "select" && campo.opciones && (
                    <select
                      id={campo.nombre}
                      value={formData.datos[campo.nombre] || ""}
                      onChange={(e) => handleDatoChange(campo.nombre, e.target.value)}
                      required={campo.requerido}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar...</option>
                      {campo.opciones.map((opcion) => (
                        <option key={opcion} value={opcion}>{opcion}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observaciones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h2>
          <textarea
            id="observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Notas adicionales sobre el trabajo..."
          />
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <Link
            href="/trabajos"
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50 transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando..." : "Crear Trabajo"}
          </button>
        </div>
      </form>
    </div>
  )
}