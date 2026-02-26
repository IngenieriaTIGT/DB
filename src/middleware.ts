import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const user = req.auth?.user

  // Rutas públicas
  const isPublicRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/"

  // Si no está logueado y trata de acceder a ruta protegida
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // Si está logueado y trata de acceder a login
  if (isLoggedIn && nextUrl.pathname === "/login") {
    // Redirigir según rol
    if (user?.rol === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl))
    }
    return NextResponse.redirect(new URL("/portal", nextUrl))
  }

  // Si está logueado en la raíz
  if (isLoggedIn && nextUrl.pathname === "/") {
    if (user?.rol === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl))
    }
    return NextResponse.redirect(new URL("/portal", nextUrl))
  }

  // Proteger rutas de admin
  if (nextUrl.pathname.startsWith("/dashboard") || 
      nextUrl.pathname.startsWith("/clientes") ||
      nextUrl.pathname.startsWith("/trabajos") ||
      nextUrl.pathname.startsWith("/tipos-servicio")) {
    if (user?.rol !== "ADMIN") {
      return NextResponse.redirect(new URL("/portal", nextUrl))
    }
  }

  // Proteger rutas de cliente
  if (nextUrl.pathname.startsWith("/portal")) {
    if (user?.rol !== "CLIENTE") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads).*)"]
}