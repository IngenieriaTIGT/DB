"use client"

import { useState } from "react"

interface Props {
  clienteId: string
  clienteNombre: string
  clienteEmail: string
}

export function ResetPasswordButton({ clienteId, clienteNombre, clienteEmail }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState<{ email: string; password: string } | null>(null)

  const handleReset = async () => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/clientes/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al resetear contraseña")
        setLoading(false)
        return
      }

      setSuccess({
        email: data.email,
        password: data.password
      })
      setLoading(false)
    } catch {
      setError("Error al resetear contraseña")
      setLoading(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setError("")
    setSuccess(null)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        Resetear Contraseña
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            {!success ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Resetear Contraseña</h2>
                  <p className="text-gray-600 mt-2">
                    Se generará una nueva contraseña temporal para:
                  </p>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{clienteNombre}</p>
                    <p className="text-sm text-gray-500">{clienteEmail}</p>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                    {error}
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> La contraseña actual será reemplazada. Asegúrate de compartir la nueva contraseña con el cliente.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
                  >
                    {loading ? "Generando..." : "Generar Nueva Contraseña"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">¡Contraseña Generada!</h2>
                  <p className="text-gray-600 mt-2">Comparte estas credenciales con el cliente</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="space-y-3">
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
                          title="Copiar"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nueva contraseña temporal</label>
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
                          title="Copiar"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Importante:</strong> El cliente deberá cambiar su contraseña al iniciar sesión.
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
