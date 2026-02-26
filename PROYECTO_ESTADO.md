# Portal Polígrafo - CT Consultores
## Estado del Proyecto - 26 de Febrero 2026

---

## 📋 Información General

| Campo | Valor |
|-------|-------|
| **Nombre** | Portal Polígrafo |
| **Cliente** | CT Consultores |
| **Desarrollador** | Ingeniería TI GT |
| **URL Producción** | https://ctconsultores.vercel.app |
| **Repositorio** | https://github.com/IngenieriaTIGT/DB |
| **Estado** | Funcional - En desarrollo |

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión |
|------------|---------|
| Next.js | 16.1.6 (Turbopack) |
| React | 19 |
| Prisma | 7.4.1 |
| NextAuth | v5 (authjs) |
| PostgreSQL | Neon (serverless) |
| Hosting | Vercel (Free tier) |

---

## 👥 Roles del Sistema

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **SUPER_ADMIN** | Ingeniería TI GT | Control total: crear, modificar, eliminar TODO |
| **ADMIN** | CT Consultores | Crear y modificar clientes, trabajos, tipos de servicio. NO puede eliminar |
| **CLIENTE** | Clientes de CT Consultores | Solo ver sus trabajos y subir documentos |

---

## 🔐 Credenciales de Acceso

### SUPER_ADMIN (Funcionando ✅)
```
Email: administrador@ingenieriatigt.com
Password: Princesa@lis1702
```

### ADMIN (Pendiente de crear)
- Debe ser creado por SUPER_ADMIN desde `/clientes/nuevo`
- Seleccionar rol "Administrador" en el formulario

---

## 📁 Estructura del Proyecto

```
portal-poligrafo/
├── prisma/
│   └── schema.prisma          # Modelos: Usuario, Cliente, Trabajo, TipoServicio, Documento
├── src/
│   ├── app/
│   │   ├── (admin)/           # Rutas para ADMIN y SUPER_ADMIN
│   │   │   ├── dashboard/     # Panel principal
│   │   │   ├── clientes/      # Gestión de clientes
│   │   │   │   └── nuevo/     # Crear cliente/admin
│   │   │   ├── trabajos/      # Gestión de trabajos
│   │   │   ├── tipos-servicio/# Tipos de servicio
│   │   │   └── perfil/        # Perfil del usuario
│   │   ├── (cliente)/         # Rutas para CLIENTE
│   │   │   └── portal/        # Portal del cliente
│   │   ├── api/
│   │   │   ├── clientes/      # CRUD clientes
│   │   │   ├── trabajos/      # CRUD trabajos
│   │   │   ├── tipos-servicio/# CRUD tipos
│   │   │   ├── usuarios/      # Foto de perfil
│   │   │   ├── upload/        # Subir documentos
│   │   │   └── test-session/  # Verificar sesión
│   │   └── login/             # Inicio de sesión
│   ├── components/
│   │   ├── FotoPerfil.tsx     # Componente de avatar
│   │   ├── LogoutButton.tsx   # Botón de cerrar sesión
│   │   └── TrabajosTable.tsx  # Tabla de trabajos
│   └── lib/
│       ├── auth.ts            # Configuración NextAuth
│       ├── db.ts              # Cliente Prisma
│       └── utils.ts           # Utilidades
└── public/
    └── uploads/
        ├── perfiles/          # Fotos de perfil
        └── documentos/        # Documentos de trabajos
```

---

## ✅ Funcionalidades Implementadas

### Autenticación
- [x] Login con credenciales
- [x] Logout funcional
- [x] Middleware de protección de rutas
- [x] Sesión persistente con cookies

### Gestión de Usuarios
- [x] Crear clientes (ADMIN y SUPER_ADMIN)
- [x] Crear administradores (solo SUPER_ADMIN)
- [x] Fotos de perfil para todos los usuarios
- [x] Página de perfil para cambiar foto

### Gestión de Clientes
- [x] Listar clientes
- [x] Ver detalle de cliente
- [x] Editar cliente
- [x] Eliminar cliente (solo SUPER_ADMIN)
- [x] Generación de código único
- [x] Generación de contraseña temporal

### Gestión de Trabajos
- [x] Crear trabajos
- [x] Asignar a cliente
- [x] Estados: PENDIENTE, EN_PROCESO, COMPLETADO, ENTREGADO
- [x] Subir documentos adjuntos

### Tipos de Servicio
- [x] CRUD completo
- [x] Campos dinámicos (JSON)

### Portal del Cliente
- [x] Ver sus trabajos asignados
- [x] Subir documentos a sus trabajos
- [x] Descargar documentos

---

## 🔧 Permisos por Rol

| Acción | SUPER_ADMIN | ADMIN | CLIENTE |
|--------|:-----------:|:-----:|:-------:|
| Ver Dashboard | ✅ | ✅ | ❌ |
| Ver Portal Cliente | ✅ | ✅ | ✅ (solo suyo) |
| Crear Clientes | ✅ | ✅ | ❌ |
| Modificar Clientes | ✅ | ✅ | ❌ |
| Eliminar Clientes | ✅ | ❌ | ❌ |
| Crear Trabajos | ✅ | ✅ | ❌ |
| Modificar Trabajos | ✅ | ✅ | ❌ |
| Eliminar Trabajos | ✅ | ❌ | ❌ |
| Ver Documentos | ✅ | ✅ | ✅ (suyos) |
| Subir Documentos | ✅ | ✅ | ✅ (suyos) |
| Eliminar Documentos | ✅ | ❌ | ❌ |
| Crear Tipos Servicio | ✅ | ✅ | ❌ |
| Eliminar Tipos Servicio | ✅ | ❌ | ❌ |

---

## 📝 Modelos de Base de Datos

### Usuario
```prisma
model Usuario {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  nombre        String
  imagen        String?   // URL de foto de perfil
  rol           Rol       @default(CLIENTE)
  activo        Boolean   @default(true)
  codigoRecuperacion    String?
  codigoRecuperacionExp DateTime?
  cliente       Cliente?
}
```

### Cliente
```prisma
model Cliente {
  id            String    @id @default(cuid())
  codigo        String    @unique
  nombre        String
  nit           String?
  direccion     String?
  telefono      String?
  email         String?
  observaciones String?
  activo        Boolean   @default(true)
  usuarioId     String    @unique
  usuario       Usuario   @relation(...)
  trabajos      Trabajo[]
}
```

### Trabajo
```prisma
model Trabajo {
  id            String    @id @default(cuid())
  codigo        String    @unique
  fecha         DateTime  @default(now())
  estado        EstadoTrabajo @default(PENDIENTE)
  observaciones String?
  datos         String    // JSON
  clienteId     String
  tipoServicioId String
  documentos    Documento[]
}
```

---

## 🚀 Deploy en Vercel

### Variables de Entorno Requeridas
```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://ctconsultores.vercel.app
NEXTAUTH_SECRET=...
UPLOAD_DIR=/tmp/uploads
```

### ⚠️ IMPORTANTE: Migración Pendiente
El campo `imagen` fue agregado al modelo Usuario. Ejecutar migración:

```bash
npx prisma migrate deploy
```

O hacer redeploy en Vercel (sin cache).

---

## 📞 Contacto

| Campo | Valor |
|-------|-------|
| **Empresa** | Ingeniería TI GT |
| **Teléfono** | +502 3533-6570 |
| **WhatsApp** | https://wa.me/50235336570 |
| **Sitio Web** | www.ingenieriatigt.com |
| **Eslogan** | "Si no lo sabemos, por ti lo aprendemos" |

---

## 📅 Historial de Cambios

### 26 de Febrero 2026
1. ✅ Corregido login - cookies de NextAuth v5
2. ✅ Agregado soporte para SUPER_ADMIN en APIs
3. ✅ Implementado selector de rol (ADMIN/CLIENTE) para SUPER_ADMIN
4. ✅ Configurado permisos: ADMIN crea/modifica, SUPER_ADMIN elimina
5. ✅ Agregadas fotos de perfil para todos los usuarios
6. ✅ Creada página de perfil para cambiar foto
7. ✅ Actualizado sidebar y navbar con avatares

---

## 🔜 Pendientes

1. [ ] Actualizar NEXTAUTH_URL en Vercel
2. [ ] Ejecutar migración de base de datos (campo imagen)
3. [ ] Crear usuario ADMIN para CT Consultores
4. [ ] Probar flujo completo de creación de trabajos
5. [ ] Configurar dominio personalizado (opcional)

---

## 📌 Notas Importantes

- **NextAuth v5** usa cookies con nombre `authjs.session-token` (no `next-auth.session-token`)
- Los archivos se guardan en `/tmp/uploads` en Vercel (se borran al reiniciar)
- Considerar usar almacenamiento externo (S3, Cloudinary) para producción
- El plan gratuito de Vercel tiene límites de ancho de banda

---

*Documento generado por Ingeniería TI GT*
*Última actualización: 26 de febrero 2026*
