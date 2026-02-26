"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

export default function EliminarClientePage() {
  const router = useRouter()
  const params = useParams()
  const clienteId = params.id as string

  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [cliente, setCliente] = useState<{
    id: string
    codigo: string
    nombre: string
    nit: string | null
    email: string | null
    usuario: { email: string; nombre: string }
    _count: { trabajos: number }
  } | null>(null)

  useEffect(() => {
    cargarCliente()
  }, [clienteId])

  const cargarCliente = async () => {
    try {
      const res = await fetch(`/api/clientes/${clienteId}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al cargar cliente")
        setLoading(false)
        return
      }

      setCliente(data)
      setLoading(false)
    } catch {
      setError("Error al cargar cliente")
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError("")

    try {
      const res = await fetch(`/api/clientes/${clienteId}`, {
        method: "DELETE"
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al eliminar cliente")
        setDeleting(false)
        return
      }

      router.push("/clientes")
    } catch {
      setError("Error al eliminar cliente")
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/2"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <p className="text-red-600">{error || "Cliente no encontrado"}</p>
          <Link href="/clientes" className="text-green-600 hover:text-green-800 mt-4 inline-block">
            Volver a Clientes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <Link href="/clientes" className="text-green-600 hover:text-green-800 flex items-center gap-2 mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Clientes
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Eliminar Cliente</h1>
        <p className="text-gray-600 mt-2">Esta acción no se puede deshacer</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">¿Está seguro de eliminar este cliente?</h3>
              <p className="text-red-600 mt-1">Se eliminarán todos los trabajos y documentos asociados.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600">Código</span>
            <span className="font-mono text-green-600">{cliente.codigo}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600">Nombre</span>
            <span className="font-medium text-gray-900">{cliente.nombre}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600">NIT</span>
            <span className="text-gray-900">{cliente.nit || "-"}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600">Email</span>
            <span className="text-gray-900">{cliente.email || cliente.usuario.email}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="text-gray-600">Trabajos asociados</span>
            <span className={`font-medium ${cliente._count.trabajos > 0 ? "text-red-600" : "text-green-600"}`}>
              {cliente._count.trabajos} trabajo(s)
            </span>
          </div>
        </div>

        {cliente._count.trabajos > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Advertencia:</strong> Este cliente tiene {cliente._count.trabajos} trabajo(s) asociado(s). 
              Todos serán eliminados permanentemente junto con sus documentos.
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <Link
            href="/clientes"
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50 transition"
          >
            Cancelar
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? "Eliminando..." : "Sí, Eliminar Cliente"}
          </button>
        </div>
      </div>
    </div>
  )
}
