import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Este middleware solo verifica la existencia del token de sesión
// La verificación completa de autenticación se hace en los layouts

export function middleware(request: NextRequest) {
  const { nextUrl } = request
  
  // Verificar si existe la cookie de sesión de NextAuth
  const sessionToken = request.cookies.get("next-auth.session-token") || 
                       request.cookies.get("__Secure-next-auth.session-token")
  
  const isLoggedIn = !!sessionToken?.value
  const isPublicRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/"

  // Rutas protegidas
  const isAdminRoute = nextUrl.pathname.startsWith("/dashboard") || 
                       nextUrl.pathname.startsWith("/clientes") ||
                       nextUrl.pathname.startsWith("/trabajos") ||
                       nextUrl.pathname.startsWith("/tipos-servicio")
  
  const isClienteRoute = nextUrl.pathname.startsWith("/portal")

  // Si no está logueado y trata de acceder a ruta protegida
  if (!isLoggedIn && (isAdminRoute || isClienteRoute)) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // Si está logueado y trata de acceder a login o raíz
  if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/")) {
    // Redirigir a página de redirección
    return NextResponse.redirect(new URL("/redirect", nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads|redirect).*)"]
}
