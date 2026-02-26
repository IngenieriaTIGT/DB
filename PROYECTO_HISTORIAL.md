# Portal Polígrafo - CT Consultores
## Historial del Proyecto

**Desarrollador:** Ingeniería TI GT  
**Fecha última actualización:** 26 de febrero de 2026  
**URL Producción:** https://ctconsultores.vercel.app  
**Repositorio:** https://github.com/IngenieriaTIGT/DB

---

## 📋 Información del Proyecto

### Tecnología
- **Framework:** Next.js 16.1.6 (Turbopack)
- **Frontend:** React 19
- **ORM:** Prisma 7.4.1
- **Autenticación:** NextAuth v5 (authjs)
- **Base de datos:** PostgreSQL (Neon)
- **Hosting:** Vercel (Free tier)

### Contacto
- **Empresa:** Ingeniería TI GT
- **Teléfono:** +502 3533-6570
- **WhatsApp:** https://wa.me/50235336570
- **Sitio web:** www.ingenieriatigt.com
- **Lema:** "Si no lo sabemos, por ti lo aprendemos"

---

## 🔐 Credenciales

### Super Administrador (Ingeniería TI GT)
- **Email:** administrador@ingenieriatigt.com
- **Contraseña:** Princesa@lis1702
- **Rol:** SUPER_ADMIN
- **Permisos:** Control total del sistema

### Administrador (CT Consultores)
- **Estado:** Pendiente de crear
- **Rol:** ADMIN
- **Permisos:** Ver, crear, editar (no eliminar clientes ni gestionar usuarios)

---

## 👥 Sistema de Roles y Permisos

### Nivel 1: CLIENTE
| Permiso | Acceso |
|---------|:------:|
| Ver sus propios trabajos | ✅ |
| Ver documentos de sus trabajos | ✅ |
| Subir documentos a sus trabajos | ✅ |
| Eliminar sus propios documentos | ✅ |
| Ver otros clientes/trabajos | ❌ |
| Crear/Editar/Eliminar | ❌ |

### Nivel 2: ADMIN (CT Consultores)
| Permiso | Acceso |
|---------|:------:|
| Ver Dashboard | ✅ |
| Ver Clientes | ✅ |
| Crear Clientes | ✅ |
| Editar Clientes | ✅ |
| Eliminar Clientes | ❌ |
| Ver Trabajos | ✅ |
| Crear Trabajos | ✅ |
| Editar Trabajos | ✅ |
| Eliminar Trabajos | ✅ |
| Subir/Eliminar Documentos | ✅ |
| Ver Tipos de Servicio | ✅ |
| Crear/Editar Tipos de Servicio | ✅ |
| Eliminar Tipos de Servicio | ❌ |
| Ver Usuarios | ❌ |
| Gestionar Usuarios | ❌ |

### Nivel 3: SUPER_ADMIN (Ingeniería TI GT)
| Permiso | Acceso |
|---------|:------:|
| Todo lo de ADMIN | ✅ |
| Eliminar Clientes | ✅ |
| Eliminar Tipos de Servicio | ✅ |
| Ver Usuarios | ✅ |
| Crear Usuarios (ADMIN/CLIENTE) | ✅ |
| Editar Usuarios | ✅ |
| Eliminar Usuarios | ✅ |
| Resetear Contraseñas | ✅ |

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── (admin)/
│   │   ├── layout.tsx          # Layout con sidebar y header
│   │   ├── dashboard/          # Página principal
│   │   ├── usuarios/           # Gestión de usuarios (solo SUPER_ADMIN)
│   │   │   ├── page.tsx        # Lista de usuarios
│   │   │   └── [id]/editar/    # Editar usuario
│   │   ├── clientes/           # Gestión de clientes
│   │   │   ├── page.tsx        # Lista de clientes
│   │   │   ├── nuevo/          # Crear cliente
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # Ver cliente
│   │   │       ├── editar/     # Editar cliente
│   │   │       └── eliminar/   # Eliminar cliente (solo SUPER_ADMIN)
│   │   ├── trabajos/           # Gestión de trabajos
│   │   │   ├── page.tsx        # Lista de trabajos
│   │   │   ├── nuevo/          # Crear trabajo
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # Ver trabajo
│   │   │       └── editar/     # Editar trabajo
│   │   └── tipos-servicio/     # Gestión de tipos de servicio
│   ├── api/
│   │   ├── clientes/           # API clientes
│   │   │   ├── route.ts        # CRUD clientes
│   │   │   ├── [id]/route.ts   # Obtener/Eliminar cliente
│   │   │   └── reset-password/ # Resetear contraseña
│   │   ├── usuarios/           # API usuarios
│   │   │   ├── [id]/route.ts   # CRUD usuarios
│   │   │   └── reset-password/ # Resetear contraseña
│   │   ├── trabajos/           # API trabajos
│   │   ├── tipos-servicio/     # API tipos de servicio
│   │   ├── documentos/         # API documentos
│   │   └── upload/             # Subir archivos
│   └── login/                  # Página de login
├── components/
│   ├── LogoutButton.tsx        # Botón de cerrar sesión
│   └── TrabajosTable.tsx       # Tabla de trabajos con filtros
└── lib/
    ├── auth.ts                 # Configuración NextAuth
    ├── db.ts                   # Cliente Prisma
    └── utils.ts                # Utilidades (hash, generar password)
```

---

## 🔄 Historial de Cambios

### Sesión 26 de febrero de 2026

#### 1. Corrección de Login
- **Problema:** Login mostraba "Credenciales incorrectas"
- **Causa:** Middleware buscaba cookies incorrectas
- **Solución:** Actualizado `middleware.ts` para buscar `authjs.session-token`

#### 2. Permisos SUPER_ADMIN
- **Problema:** SUPER_ADMIN no podía acceder a APIs
- **Causa:** APIs solo permitían rol ADMIN
- **Solución:** Agregado SUPER_ADMIN a todas las verificaciones

#### 3. Crear Usuarios ADMIN
- **Problema:** No había forma de crear usuarios ADMIN
- **Causa:** Formulario solo creaba CLIENTE
- **Solución:** Agregado selector de rol visible solo para SUPER_ADMIN

#### 4. Página de Usuarios
- **Creado:** `/usuarios` - Lista de administradores
- **Creado:** `/usuarios/[id]/editar` - Editar usuarios
- **Funciones:** Editar nombre, email, rol, estado, eliminar, resetear contraseña

#### 5. Menú Usuarios Solo SUPER_ADMIN
- **Cambio:** Menú "Usuarios" solo visible para SUPER_ADMIN
- **Archivo:** `src/app/(admin)/layout.tsx`

#### 6. Eliminar Clientes Solo SUPER_ADMIN
- **Creado:** `/clientes/[id]/eliminar` - Página de confirmación
- **Creado:** `/api/clientes/[id]` - Endpoint DELETE
- **Cambio:** Botón "Eliminar" solo visible para SUPER_ADMIN

#### 7. ADMIN Puede Eliminar Trabajos
- **Cambio:** API `/api/trabajos/[id]` permite DELETE para ADMIN y SUPER_ADMIN
- **Cambio:** Agregado botón "Eliminar" en tabla de trabajos

#### 8. Resetear Contraseñas
- **Creado:** `/api/usuarios/reset-password` - Generar contraseña temporal
- **Función:** Modal con credenciales y botones para copiar

---

## 🚀 Comandos Útiles

### Desarrollo Local
```bash
cd C:\Windows\System32\portal-poligrafo
npm run dev
```

### Build
```bash
npm run build
```

### Prisma
```bash
npx prisma studio      # Abrir interfaz visual
npx prisma generate    # Generar cliente
npx prisma db push     # Sincronizar schema
```

### Git
```bash
git status
git add .
git commit -m "Mensaje"
git push origin main
```

---

## ⚠️ Notas Importantes

1. **NEXTAUTH_URL:** Debe estar configurado en Vercel como `https://ctconsultores.vercel.app`

2. **Super Admin Principal:** El usuario `administrador@ingenieriatigt.com` no puede ser eliminado ni cambiar su rol

3. **Fotos de Perfil:** Funcionalidad pausada (revertida), pendiente para implementación futura

4. **Variables de Entorno en Vercel:**
   - DATABASE_URL
   - NEXTAUTH_URL
   - NEXTAUTH_SECRET
   - UPLOAD_DIR=/tmp/uploads

---

## 📞 Soporte

Para cualquier consulta o soporte técnico:
- **WhatsApp:** +502 3533-6570
- **Email:** administrador@ingenieriatigt.com

---

*Documento generado por Ingeniería TI GT*
