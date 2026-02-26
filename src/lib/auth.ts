import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      nombre: string
      rol: string
      clienteId?: string
    }
  }
  interface User {
    id: string
    nombre: string
    rol: string
    clienteId?: string
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    email: string
    nombre: string
    rol: string
    clienteId?: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email as string },
          include: { cliente: true }
        })

        if (!usuario || !usuario.activo) {
          return null
        }

        const passwordValid = await bcrypt.compare(
          credentials.password as string,
          usuario.password
        )

        if (!passwordValid) {
          return null
        }

        return {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol,
          clienteId: usuario.cliente?.id
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.email = user.email!
        token.nombre = user.nombre!
        token.rol = user.rol!
        token.clienteId = user.clienteId
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.email = token.email
      session.user.nombre = token.nombre
      session.user.rol = token.rol
      session.user.clienteId = token.clienteId
      return session
    }
  },
  pages: {
    signIn: "/login"
  }
})