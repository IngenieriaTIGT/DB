import { Usuario, Cliente, Trabajo, TipoServicio, Documento, Rol, EstadoTrabajo } from '@prisma/client'

export type { Usuario, Cliente, Trabajo, TipoServicio, Documento, Rol, EstadoTrabajo }

export type UsuarioSinPassword = Omit<Usuario, 'password'>

export interface UsuarioConCliente extends UsuarioSinPassword {
  cliente: Cliente | null
}

// Campos dinámicos para tipos de servicio
export interface CampoConfig {
  nombre: string
  label: string
  tipo: 'texto' | 'textarea' | 'fecha' | 'numero' | 'select'
  requerido?: boolean
  opciones?: string[] // para campos tipo select
}

// Datos del trabajo según tipo
export interface DatosPoligrafo {
  nombreEvaluado: string
  tipoExamen: string
  resultado: string
  observaciones?: string
}

export interface DatosVisitaSocioeconomica {
  direccion: string
  nombreVisitado: string
  parentesco: string
  observacionesVivienda: string
  ingresosMensuales?: number
  numeroHabitantes?: number
}

// Formulario de login
export interface LoginForm {
  email: string
  password: string
}

// Formulario de cliente
export interface ClienteForm {
  nombre: string
  nit?: string
  direccion?: string
  telefono?: string
  email?: string
  observaciones?: string
}

// Formulario de trabajo
export interface TrabajoForm {
  clienteId: string
  tipoServicioId: string
  fecha: Date
  observaciones?: string
  datos: Record<string, unknown>
}