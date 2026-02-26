"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NuevoClientePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState<{ email: string; password: string; rol: string; usuarioId: string } | null>(null)
  const [esSuperAdmin, setEsSuperAdmin] = useState(false)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    nombre: "",
    nit: "",
    direccion: "",
    telefono: "",
    email: "",
    observaciones: "",
    rol: "CLIENTE"
  })

  // Verificar rol del usuario actual
  useEffect(() => {
    fetch("/api/test-session")
      .then(res => res.json())
      .then(data => {
        if (data?.session?.user?.rol === "SUPER_ADMIN") {
          setEsSuperAdmin(true)
        }
      })
      .catch(() => {})
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    const tiposPermitidos = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!tiposPermitidos.includes(file.type)) {
      setError("Tipo de archivo no permitido. Use JPG, PNG, GIF o WebP")
      return
    }

    // Validar tamaño (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("El archivo es muy grande. Máximo 2MB")
      return
    }

    setImagenFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagenPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Crear usuario
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al crear usuario")
        setLoading(false)
        return
      }

      // Si hay imagen, subirla
      if (imagenFile && data.usuario) {
        const formDataImagen = new FormData()
        formDataImagen.append("file", imagenFile)
        formDataImagen.append("usuarioId", data.usuario.id || "temp")

        await fetch("/api/usuarios/foto", {
          method: "POST",
          body: formDataImagen
        })
      }

      setSuccess({
        email: data.usuario.email,
        password: data.usuario.password,
        rol: formData.rol,
        usuarioId: data.usuario.id || ""
      })
    } catch {
      setError("Error al crear usuario")
      setLoading(false)
    }
  }

  // Generar iniciales para el avatar
  const iniciales = formData.nombre
    .split(" ")
    .map(n => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {success.rol === "ADMIN" ? "¡Administrador Creado!" : "¡Cliente Creado!"}
            </h2>
            <p className="text-gray-600 mt-2">Comparte estas credenciales con el usuario</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Rol</label>
                <div className="mt-1">
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    success.rol === "ADMIN" 
                      ? "bg-purple-100 text-purple-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {success.rol === "ADMIN" ? "Administrador" : "Cliente"}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email de acceso</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={success.email}
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(success.email)}
                    className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    Copiar
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña temporal</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={success.password}
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(success.password)}
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
              <strong>Importante:</strong> El usuario deberá cambiar su contraseña al iniciar sesión por primera vez.
            </p>
          </div>

          <div className="flex gap-4">
            <Link
              href="/clientes"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center hover:bg-gray-50 transition"
            >
              Volver a Clientes
            </Link>
            <button
              onClick={() => {
                setSuccess(null)
                setFormData({
                  nombre: "",
                  nit: "",
                  direccion: "",
                  telefono: "",
                  email: "",
                  observaciones: "",
                  rol: "CLIENTE"
                })
                setImagenPreview(null)
                setImagenFile(null)
              }}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Crear Otro
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/clientes" className="text-green-600 hover:text-green-800 flex items-center gap-2 mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Clientes
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Usuario</h1>
        <p className="text-gray-600 mt-2">
          {esSuperAdmin 
            ? "Crea un nuevo administrador o cliente y genera sus credenciales de acceso"
            : "Registra un nuevo cliente y genera sus credenciales de acceso"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Foto de perfil */}
          <div className="flex flex-col items-center">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg cursor-pointer hover:ring-4 hover:ring-green-200 transition-all"
            >
              {imagenPreview ? (
                <img 
                  src={imagenPreview} 
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{iniciales || "?"}</span>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
            <p className="text-gray-400 text-xs mt-2">Click para agregar foto (opcional)</p>
          </div>

          {/* Selector de Rol - Solo visible para SUPER_ADMIN */}
          {esSuperAdmin && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <label htmlFor="rol" className="block text-sm font-medium text-purple-800 mb-2">
                Tipo de Usuario *
              </label>
              <select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="CLIENTE">Cliente - Puede ver y subir documentos a sus trabajos</option>
                <option value="ADMIN">Administrador - Puede crear y gestionar clientes y trabajos</option>
              </select>
              <p className="text-sm text-purple-600 mt-2">
                {formData.rol === "ADMIN" 
                  ? "Los administradores pueden crear clientes, trabajos y gestionar el sistema."
                  : "Los clientes solo pueden ver sus trabajos y subir documentos."}
              </p>
            </div>
          )}

          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre / Razón Social *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Nombre del cliente o empresa"
            />
          </div>

          {/* Campos adicionales solo para CLIENTE */}
          {formData.rol === "CLIENTE" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nit" className="block text-sm font-medium text-gray-700 mb-2">
                    NIT
                  </label>
                  <input
                    type="text"
                    id="nit"
                    name="nit"
                    value={formData.nit}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="1234567-8"
                  />
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+502 1234-5678"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Dirección del cliente"
                />
              </div>

              <div>
                <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  id="observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Notas adicionales sobre el cliente"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email de Contacto *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="correo@ejemplo.com"
            />
            <p className="text-sm text-gray-500 mt-1">Este email se usará para generar las credenciales de acceso</p>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <Link
            href="/clientes"
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50 transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando..." : `Crear ${formData.rol === "ADMIN" ? "Administrador" : "Cliente"}`}
          </button>
        </div>
      </form>
    </div>
  )
}
