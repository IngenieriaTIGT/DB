import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LogoutButton } from "./LogoutButton"

async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session || session.user.rol !== "CLIENTE") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Portal de Servicios</h1>
                <p className="text-xs text-green-400">Polígrafo y Visitas Socioeconómicas</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{session.user.nombre}</p>
                <p className="text-xs text-gray-400">{session.user.email}</p>
              </div>
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                {session.user.nombre.charAt(0).toUpperCase()}
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Ingeniería TI GT. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default ClienteLayout
