import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LogoutButton } from "@/components/LogoutButton"

async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session || (session.user.rol !== "ADMIN" && session.user.rol !== "SUPER_ADMIN")) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-xl font-bold">Portal Polígrafo</h1>
            <p className="text-green-400 text-sm mt-1">Panel de Administración</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>

            {/* Solo SUPER_ADMIN puede ver Usuarios */}
            {session.user.rol === "SUPER_ADMIN" && (
              <Link href="/usuarios" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Usuarios
              </Link>
            )}

            <Link href="/clientes" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Clientes
            </Link>

            <Link href="/trabajos" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Trabajos
            </Link>

            <Link href="/tipos-servicio" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Tipos de Servicio
            </Link>
          </nav>

          {/* Footer del sidebar */}
          <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
            <p>Ingeniería TI GT</p>
            <p className="mt-1">"Si no lo sabemos, por ti lo aprendemos"</p>
          </div>
        </div>
      </aside>

      {/* Header superior */}
      <header className="fixed top-0 right-0 left-64 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
        <div></div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{session.user.nombre}</p>
            <p className="text-xs text-gray-500">
              {session.user.rol === "SUPER_ADMIN" ? "Super Administrador" : "Administrador"}
            </p>
          </div>
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
            {session.user.nombre.charAt(0).toUpperCase()}
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main content */}
      <main className="ml-64 pt-16 p-8">
        {children}
      </main>
    </div>
  )
}

export default AdminLayout
