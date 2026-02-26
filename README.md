# Portal Polígrafo - Sistema de Gestión de Servicios

Sistema web para gestión de servicios de polígrafo y visitas socioeconómicas. Permite a los clientes ver sus trabajos realizados mediante un portal seguro.

Desarrollado por **Ingeniería TI GT** - Soluciones Tecnológicas Integrales

## 🚀 Características

- **Panel de Administración**: Gestión completa de clientes, servicios y trabajos
- **Portal de Cliente**: Vista de trabajos realizados con opción de impresión
- **Campos Dinámicos**: Campos personalizables por tipo de servicio
- **Gestión de Documentos**: Subida y descarga de documentos adjuntos
- **Autenticación Segura**: Sistema de roles (Admin/Cliente) con sesiones seguras
- **Recuperación de Contraseña**: Sistema de código de verificación

## 🛠️ Tecnologías

- **Frontend**: Next.js 16.1.6 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes, Prisma 7.4.1
- **Base de Datos**: SQLite (desarrollo) / PostgreSQL (producción)
- **Autenticación**: NextAuth.js v5
- **Estilos**: Tailwind CSS 4
- **Validación**: Zod, React Hook Form

## 📋 Requisitos

- Node.js 18+
- npm o yarn

## 🔧 Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/portal-poligrafo.git
cd portal-poligrafo

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Generar cliente de Prisma
npm run db:generate

# Sincronizar base de datos
npm run db:push

# Ejecutar seed para datos iniciales
npm run seed

# Iniciar servidor de desarrollo
npm run dev
```
## 🔐 Credenciales por Defecto
## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── (admin)/          # Rutas protegidas para administrador
│   │   ├── dashboard/    # Panel principal
│   │   ├── clientes/     # Gestión de clientes
│   │   ├── tipos-servicio/ # Tipos de servicio
│   │   └── trabajos/     # Gestión de trabajos
│   ├── (auth)/           # Autenticación
│   │   └── login/        # Página de login
│   ├── (cliente)/        # Portal de cliente
│   │   └── portal/       # Vista de trabajos del cliente
│   └── api/              # API Routes
├── components/           # Componentes reutilizables
├── lib/                  # Utilidades y configuración
└── types/                # Tipos TypeScript
```

## 🗄️ Modelos de Base de Datos

- **Usuario**: Usuarios del sistema (Admin/Cliente)
- **Cliente**: Clientes de la empresa
- **TipoServicio**: Tipos de servicio ofrecidos
- **Trabajo**: Trabajos realizados a clientes
- **Documento**: Documentos adjuntos a trabajos

## 🚀 Despliegue


## 📝 Scripts Disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run start      # Servidor de producción
npm run lint       # Linter
npm run db:generate # Generar cliente Prisma
npm run db:push    # Sincronizar schema con DB
npm run db:studio  # Abrir Prisma Studio
npm run seed       # Ejecutar seed
```

## 🎨 Colores Institucionales

- **Verde Principal**: #16a34a
- **Negro/Gris Oscuro**: #171717

## 📞 Contacto

**Ingeniería TI GT**
- Teléfono: +502 3533-6570
- WhatsApp: [wa.me/50235336570](https://wa.me/50235336570)
- Web: [www.ingenieriatigt.com](https://www.ingenieriatigt.com)

---

*"Si no lo sabemos, por ti lo aprendemos"*

*Todo lo puedo en Cristo que me fortalece - Filipenses 4:13*
