"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

interface Usuario {
  id: string
  nombre: string
  email: string
  imagen?: string | null
  rol: string
}

export default function PerfilPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/test-session")
      .then(res => res.json())
      .then(data => {
        if (data?.session?.user) {
          setUsuario(data.session.user)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !usuario) return

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

    setSubiendo(true)
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/usuarios/foto", {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Error al subir foto")
      }

      setUsuario({ ...usuario, imagen: data.imagen })
      setSuccess("Foto actualizada correctamente")
      
      // Recargar la página para actualizar la sesión
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir foto")
    } finally {
      setSubiendo(false)
    }
  }

  // Generar iniciales
  const iniciales = usuario?.nombre
    .split(" ")
    .map(n => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "?"

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="animate-pulse">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-1/3 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="flex flex-col items-center mb-8">
          {/* Foto de perfil */}
          <div 
            onClick={handleImageClick}
            className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg cursor-pointer hover:ring-4 hover:ring-green-200 transition-all"
          >
            {usuario?.imagen ? (
              <img 
                src={usuario.imagen} 
                alt={usuario.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{iniciales}</span>
            )}
            
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              {subiendo ? (
                <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />

          <p className="text-gray-500 text-sm mt-3">Click para cambiar tu foto de perfil</p>
          <p className="text-gray-400 text-xs mt-1">JPG, PNG, GIF o WebP. Máximo 2MB</p>
        </div>

        {/* Información del usuario */}
        <div className="space-y-4">
          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-500 mb-1">Nombre</label>
            <p className="text-lg text-gray-900">{usuario?.nombre}</p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
            <p className="text-lg text-gray-900">{usuario?.email}</p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-500 mb-1">Rol</label>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              usuario?.rol === "SUPER_ADMIN" 
                ? "bg-red-100 text-red-800" 
                : usuario?.rol === "ADMIN"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
            }`}>
              {usuario?.rol === "SUPER_ADMIN" 
                ? "Super Administrador" 
                : usuario?.rol === "ADMIN"
                  ? "Administrador"
                  : "Cliente"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
