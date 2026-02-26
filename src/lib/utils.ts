import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"

// Generar código único para cliente
export function generarCodigoCliente(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = randomBytes(3).toString("hex").toUpperCase()
  return `CLI-${timestamp}-${random}`
}

// Generar código único para trabajo
export function generarCodigoTrabajo(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = randomBytes(3).toString("hex").toUpperCase()
  return `TRB-${timestamp}-${random}`
}

// Generar password aleatorio
export function generarPassword(length: number = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Hashear password
export async function hashearPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Verificar password
export async function verificarPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Formatear fecha
export function formatearFecha(fecha: Date): string {
  return new Intl.DateTimeFormat("es-GT", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(fecha)
}

// Formatear fecha corta
export function formatearFechaCorta(fecha: Date): string {
  return new Intl.DateTimeFormat("es-GT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(fecha)
}

// Formatear tamaño de archivo
export function formatearTamano(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}