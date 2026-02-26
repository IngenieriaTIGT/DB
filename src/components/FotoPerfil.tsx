"use client"

import { useState, useRef } from "react"

interface FotoPerfilProps {
  imagenActual?: string | null
  nombre: string
  usuarioId?: string
  onImagenCargada?: (url: string) => void
  size?: "sm" | "md" | "lg" | "xl"
  editable?: boolean
}

const sizes = {
  sm: "w-10 h-10 text-sm",
  md: "w-16 h-16 text-lg",
  lg: "w-24 h-24 text-2xl",
  xl: "w-32 h-32 text-4xl"
}

export default function FotoPerfil({ 
  imagenActual, 
  nombre, 
  usuarioId,
  onImagenCargada,
  size = "md",
  editable = false
}: FotoPerfilProps) {
  const [imagen, setImagen] = useState<string | null>(imagenActual || null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Generar iniciales
  const iniciales = nombre
    .split(" ")
    .map(n => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  const handleClick = () => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    const tiposPermitidos = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!tiposPermitidos.includes(file.type)) {
      setError("Tipo de archivo no permitido")
      return
    }

    // Validar tamaño (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("El archivo es muy grande. Máximo 2MB")
      return
    }

    setSubiendo(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      if (usuarioId) {
        formData.append("usuarioId", usuarioId)
      }

      const res = await fetch("/api/usuarios/foto", {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Error al subir foto")
      }

      setImagen(data.imagen)
      onImagenCargada?.(data.imagen)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir foto")
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div 
        onClick={handleClick}
        className={`relative rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold shadow-lg ${sizes[size]} ${editable ? "cursor-pointer hover:ring-4 hover:ring-green-200 transition-all" : ""}`}
      >
        {imagen ? (
          <img 
            src={imagen} 
            alt={nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{iniciales}</span>
        )}
        
        {editable && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            {subiendo ? (
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </div>
        )}
      </div>

      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      )}

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}

      {editable && !error && (
        <p className="text-gray-400 text-xs mt-1">Click para cambiar</p>
      )}
    </div>
  )
}
