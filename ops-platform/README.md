# Ops Platform - Sistema de Gestión Operativa
## Forestal Santa Lucía SpA

Sistema web para la gestión operativa de Forestal Santa Lucía SpA.

## 🚀 Stack Tecnológico

- **Next.js 16.1.4** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Prisma** - ORM para PostgreSQL
- **Auth.js (NextAuth.js v5)** - Autenticación
- **shadcn/ui** - Componentes UI
- **Tailwind CSS v4** - Estilos
- **React Query** - Gestión de estado del servidor
- **Zod** - Validación de esquemas
- **React Hook Form** - Manejo de formularios

## 📁 Estructura del Proyecto

```
ops-platform/
├── src/
│   ├── app/              # App Router de Next.js
│   │   ├── (auth)/      # Rutas de autenticación
│   │   ├── (dashboard)/  # Rutas del dashboard
│   │   └── api/         # API Routes
│   └── components/      # Componentes React
├── components/           # Componentes compartidos
│   ├── ui/              # Componentes shadcn/ui
│   └── shared/          # Componentes compartidos
├── lib/                 # Utilidades y configuraciones
│   ├── db.ts           # Prisma Client
│   ├── auth.ts         # Auth.js config
│   ├── utils.ts        # Utilidades generales
│   ├── validations/     # Schemas Zod
│   └── pdf/            # Generación de PDFs
├── types/              # Tipos TypeScript
└── prisma/             # Schema y migraciones de Prisma
```

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint

# Formatear código
npm run format

# Verificar formato
npm run format:check
```

## 🔧 Configuración

### Variables de Entorno

Copia `.env.example` a `.env.local` y configura:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

### Base de Datos

1. Configurar PostgreSQL
2. Ejecutar migraciones: `npx prisma migrate dev`
3. Ejecutar seed: `npx prisma db seed`

## 📚 Documentación

Ver documentación completa en `/docs`:
- `PLAN-DESARROLLO.md` - Plan de desarrollo por fases
- `SDD-forestal-santa-lucia.md` - Especificación funcional
- `DATABASE-SCHEMA.md` - Esquema de base de datos
- `API-SPEC.md` - Especificación de API
- `UI-SPEC.md` - Especificación de UI

## 🎯 Estado del Proyecto

**Fase 0: Setup y Configuración Inicial** ✅ COMPLETADA

- ✅ Proyecto Next.js configurado
- ✅ Estructura de carpetas creada
- ✅ Dependencias instaladas
- ✅ shadcn/ui configurado
- ✅ Prettier configurado
- ✅ TypeScript configurado

**Próxima Fase:** Fase 1 - Autenticación y Base de Datos

---

**Última actualización:** 2026-01-15
