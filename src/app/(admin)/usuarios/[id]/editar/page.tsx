"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

interface Usuario {
  id: string
  nombre: string
  email: string
  rol: string
  activo: boolean
  cliente?: {
    id: string
    nit: string
    direccion: string
    telefono: string
    observaciones: string
  }
}

export default function EditarUsuarioPage() {
  const router = useRouter()
  const params = useParams()
  const usuarioId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [esAdminPrincipal, setEsAdminPrincipal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [resettingPassword, setResettingPassword] = useState(false)

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rol: "ADMIN",
    activo: true,
    cliente: {
      nit: "",
      direccion: "",
      telefono: "",
      observaciones: ""
    }
  })

  useEffect(() => {
    cargarUsuario()
  }, [usuarioId])

  const cargarUsuario = async () => {
    try {
      const res = await fetch(`/api/usuarios/${usuarioId}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al cargar usuario")
        setLoading(false)
        return
      }

      setUsuario(data)
      setEsAdminPrincipal(data.email === "administrador@ingenieriatigt.com")
      setFormData({
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
        activo: data.activo,
        cliente: {
          nit: data.cliente?.nit || "",
          direccion: data.cliente?.direccion || "",
          telefono: data.cliente?.telefono || "",
          observaciones: data.cliente?.observaciones || ""
        }
      })
      setLoading(false)
    } catch {
      setError("Error al cargar usuario")
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (name.startsWith("cliente.")) {
      const campo = name.split(".")[1]
      setFormData({
        ...formData,
        cliente: {
          ...formData.cliente,
          [campo]: value
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const res = await fetch(`/api/usuarios/${usuarioId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al actualizar usuario")
        setSaving(false)
        return
      }

      router.push("/usuarios")
    } catch {
      setError("Error al actualizar usuario")
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const res = await fetch(`/api/usuarios/${usuarioId}`, {
        method: "DELETE"
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al eliminar usuario")
        return
      }

      router.push("/usuarios")
    } catch {
      setError("Error al eliminar usuario")
    }
  }

  const handleResetPassword = async () => {
    if (!confirm("¿Está seguro de generar una nueva contraseña temporal para este usuario?")) {
      return
    }

    setResettingPassword(true)
    setError("")

    try {
      const res = await fetch("/api/usuarios/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al resetear contraseña")
        setResettingPassword(false)
        return
      }

      setNewPassword(data.password)
      setShowPassword(true)
    } catch {
      setError("Error al resetear contraseña")
    } finally {
      setResettingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/usuarios" className="text-green-600 hover:text-green-800 flex items-center gap-2 mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Usuarios
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Editar Usuario</h1>
        <p className="text-gray-600 mt-2">Modifica los datos del usuario</p>
      </div>

      {esAdminPrincipal && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> Este es el Super Administrador principal. Algunos campos no se pueden modificar.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={esAdminPrincipal}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-2">
              Rol
            </label>
            <select
              id="rol"
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              disabled={esAdminPrincipal}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="SUPER_ADMIN">Super Administrador</option>
              <option value="ADMIN">Administrador</option>
              <option value="CLIENTE">Cliente</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="activo"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="activo" className="text-sm font-medium text-gray-700">
              Usuario activo
            </label>
          </div>

          {/* Campos adicionales si es CLIENTE */}
          {formData.rol === "CLIENTE" && usuario?.cliente && (
            <>
              <hr className="my-6" />
              <h3 className="text-lg font-medium text-gray-900 mb-4">Datos del Cliente</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="cliente.nit" className="block text-sm font-medium text-gray-700 mb-2">
                    NIT
                  </label>
                  <input
                    type="text"
                    id="cliente.nit"
                    name="cliente.nit"
                    value={formData.cliente.nit}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="cliente.telefono" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    id="cliente.telefono"
                    name="cliente.telefono"
                    value={formData.cliente.telefono}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cliente.direccion" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  id="cliente.direccion"
                  name="cliente.direccion"
                  value={formData.cliente.direccion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="cliente.observaciones" className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  id="cliente.observaciones"
                  name="cliente.observaciones"
                  value={formData.cliente.observaciones}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex gap-4">
          <Link
            href="/usuarios"
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50 transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>

        {/* Botón de eliminar */}
        {!esAdminPrincipal && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleDelete}
              className="w-full px-6 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-100 transition"
            >
              Eliminar Usuario
            </button>
          </div>
        )}
      </form>

      {/* Modal de contraseña reseteada */}
      {showPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">¡Contraseña Reseteada!</h2>
              <p className="text-gray-600 mt-2">Comparte estas credenciales con el usuario</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email de acceso</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={usuario?.email || ""}
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(usuario?.email || "")}
                      className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nueva contraseña temporal</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={newPassword}
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(newPassword)}
                      className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> El usuario deberá cambiar su contraseña al iniciar sesión.
              </p>
            </div>

            <button
              onClick={() => {
                setShowPassword(false)
                setNewPassword("")
              }}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Sección de resetear contraseña */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Seguridad</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Generar una nueva contraseña temporal para este usuario.</p>
            <p className="text-xs text-gray-400 mt-1">La contraseña actual será reemplazada.</p>
          </div>
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={resettingPassword || esAdminPrincipal}
            className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium hover:bg-yellow-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resettingPassword ? "Generando..." : "Resetear Contraseña"}
          </button>
        </div>

        {esAdminPrincipal && (
          <p className="text-xs text-red-500 mt-2">No se puede resetear la contraseña del Super Administrador principal.</p>
        )}
      </div>
    </div>
  )
}
