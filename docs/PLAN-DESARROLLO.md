# Plan de Desarrollo - Sistema de Gestión Operativa
## Forestal Santa Lucía SpA

**Versión:** 1.8  
**Fecha:** 2026-01-27  
**Stack:** Next.js 14 (App Router) + TypeScript + Prisma + Auth.js + shadcn/ui + Formik + jsPDF + AWS S3 (producción)  
**Duración Total Estimada:** 7-9 semanas (MVP completo)  
**Estado Actual:** Fases 0-7 completadas (~90% MVP), Nuevas entidades agregadas al modelo  
**Storage:** Mocks (desarrollo) → Amazon S3 (producción)

**Actualización v1.8:**
- ✅ Agregadas entidades `Empresa`, `Evento` y `Entrega` al modelo de dominio
- ✅ Actualizado DATABASE-SCHEMA v1.6 con nuevas tablas y relaciones
- ✅ Actualizado SDD v3.3 con nuevas entidades
- ✅ Actualizado UI-SPEC v1.5 con vistas y componentes para nuevas entidades
- ⏳ Pendiente: Migración de base de datos para nuevas entidades
- ⏳ Pendiente: Implementación de APIs y UI para Empresas, Eventos y Entregas

**Actualización v1.7:**
- ✅ Una operación puede tener 1 o más proveedores (relación N:M)
- ✅ Tabla intermedia `operacion_proveedor` implementada
- ✅ Migración de base de datos ejecutada
- ✅ UI actualizada con selector múltiple de proveedores
- ✅ Documentación actualizada (DATABASE-SCHEMA v1.5, SDD v3.2)
- ✅ APIs y validaciones actualizadas

---

## 📋 Tabla de Contenidos

1. [Fase 0: Setup y Configuración Inicial](#fase-0-setup-y-configuración-inicial)
2. [Fase 1: Autenticación y Base de Datos](#fase-1-autenticación-y-base-de-datos)
3. [Fase 2: Módulo de Contactos](#fase-2-módulo-de-contactos)
4. [Fase UI Mock: Visuales para Presentación](#fase-ui-mock-visuales-para-presentación)
5. [Fase 3: Módulo de Operaciones (Core)](#fase-3-módulo-de-operaciones-core)
6. [Fase 4: Módulo de Órdenes de Compra](#fase-4-módulo-de-órdenes-de-compra)
7. [Fase 5: Módulo de Documentos](#fase-5-módulo-de-documentos)
8. [Fase 6: Módulo de Pagos](#fase-6-módulo-de-pagos)
9. [Fase 7: Dashboard y Alertas](#fase-7-dashboard-y-alertas)
10. [Fase 8: Reportes y Mejoras](#fase-8-reportes-y-mejoras)
11. [Fase 9: Módulo de Empresas, Eventos y Entregas](#fase-9-módulo-de-empresas-eventos-y-entregas)

---

## 🎯 Estrategia de Desarrollo

### Principios
- **Desarrollo incremental**: Cada fase entrega valor funcional
- **Testeo continuo**: Probar cada módulo antes de avanzar
- **Código limpio**: Seguir convenciones del proyecto
- **Documentación**: Comentar código complejo

### Tecnologías Clave
- **Next.js 14**: App Router, Server Components, API Routes
- **TypeScript**: Tipado estricto
- **Prisma**: ORM para PostgreSQL
- **Auth.js (NextAuth.js v5)**: Autenticación con Credentials Provider
- **bcrypt**: Hash de contraseñas (salt rounds: 10)
- **shadcn/ui**: Componentes UI
- **Tailwind CSS**: Estilos
- **React Query (TanStack Query)**: Gestión de estado del servidor
- **Formik + Yup**: Formularios y validación (para UI mock)
- **PDFKit o react-pdf**: Generación de PDFs para OCs

---

## Fase 0: Setup y Configuración Inicial
**Duración:** 1-2 días  
**Prioridad:** 🔴 Crítica  
**Estado:** ✅ Completada

### Objetivos
- Completar configuración del proyecto Next.js existente
- Estructura de carpetas según arquitectura del proyecto
- Configurar herramientas de desarrollo y dependencias faltantes

### Tareas

#### 0.1 Verificar Configuración Existente ✅
- [x] Proyecto Next.js creado (Next.js 16.1.4)
- [x] TypeScript configurado con strict mode
- [x] ESLint configurado
- [x] Paths aliases configurados (`@/*` → `./src/*`)
- [x] Tailwind CSS v4 instalado
- [x] Configurar Prettier ✅
- [x] Verificar configuración de TypeScript (strict mode activo) ✅

#### 0.2 Configurar Estructura de Carpetas ✅
- [x] Crear estructura de carpetas `src/app/(auth)/` ✅
- [x] Crear estructura de carpetas `src/app/(dashboard)/` ✅
- [x] Crear estructura de carpetas `src/app/api/` ✅
- [x] Crear carpeta `components/` en raíz ✅
- [x] Crear carpeta `lib/` en raíz (ubicada en `src/lib/`) ✅
- [x] Crear carpeta `types/` en raíz ✅
- [x] Crear carpeta `prisma/` en raíz ✅

#### 0.3 Instalar Dependencias Faltantes ✅
- [x] Instalar dependencias de base de datos (Prisma) ✅
- [x] Instalar dependencias de autenticación (Auth.js, bcrypt) ✅
- [x] Instalar dependencias de validación (Zod, React Hook Form) ✅
- [x] Instalar dependencias de UI (CVA, clsx, tailwind-merge, lucide-react) ✅
- [x] Instalar dependencias de PDF (PDFKit) ✅
- [x] Instalar utilidades (date-fns, uuid) ✅
- [x] Configurar Prettier ✅

#### 0.4 Configurar shadcn/ui ✅
- [x] Inicializar shadcn/ui: `npx shadcn@latest init` ✅
  - Configurado: `src/components/ui` como carpeta de componentes
  - Configurado: `@/components/ui` como alias
  - Configurado: Tailwind CSS v4
- [x] Instalar componentes base esenciales: ✅
  - button, input, card, table, dialog, form, label, select, badge, sonner, dropdown-menu, tabs, textarea, radio-group
- [x] Verificar que los componentes funcionen con Tailwind v4 ✅
- [x] Crear archivo `lib/utils.ts` con función `cn()` ✅

#### 0.5 Configurar Variables de Entorno ✅
- [x] Crear archivo `.env.local` en la raíz de `ops-platform/` ✅
- [x] Agregar variables necesarias: ✅
  - DATABASE_URL configurado
  - NEXTAUTH_SECRET configurado
  - NEXTAUTH_URL configurado
- [x] Generar `NEXTAUTH_SECRET` seguro ✅
- [x] Agregar `.env.local` a `.gitignore` ✅
- [x] Crear `.env.example` con estructura sin valores sensibles ✅

#### 0.6 Configurar Prettier (Opcional pero Recomendado) ✅
- [x] Crear `.prettierrc` ✅
- [x] Crear `.prettierignore` ✅
- [x] Agregar script en `package.json`: `"format": "prettier --write ."` ✅

#### 0.7 Verificar Configuración de TypeScript ✅
- [x] Verificar que `strict: true` esté activo en `tsconfig.json` ✅
- [x] Agregar reglas adicionales: ✅
  - strictNullChecks: true
  - strictFunctionTypes: true
  - noUnusedLocals: true
  - noUnusedParameters: true

**Entregables:**
- ✅ Proyecto Next.js configurado y verificado
- ✅ Estructura de carpetas creada según arquitectura
- ✅ Dependencias faltantes instaladas
- ✅ shadcn/ui configurado (14 componentes instalados)
- ✅ Variables de entorno configuradas (.env.local y .env.example)
- ✅ Prettier configurado
- ✅ TypeScript con strict mode y reglas adicionales
- ✅ Configuración base lista para Fase 1

**Estado:** ✅ Fase 0 completada al 100%

---

## Fase 1: Autenticación y Base de Datos
**Duración:** 3-4 días  
**Prioridad:** 🔴 Crítica  
**Dependencias:** Fase 0  
**Estado:** ✅ Completada

### Objetivos
- Configurar Prisma y base de datos
- Implementar autenticación con Auth.js
- Crear usuario admin inicial

### Tareas

#### 1.1 Configurar Prisma ✅
- [x] Crear `schema.prisma` basado en DATABASE-SCHEMA.md
- [x] Definir todos los modelos (Usuario, Operacion, OperacionLinea, etc.)
- [x] Definir ENUMs (TipoOperacion, EstadoDocumental, etc.)
- [x] Configurar relaciones y foreign keys
- [x] Generar Prisma Client: `npx prisma generate`

#### 1.2 Configurar Base de Datos ✅
- [x] Crear base de datos PostgreSQL (local o Supabase/Railway)
- [x] Ejecutar migración inicial: `npx prisma migrate dev --name init`
- [x] Crear funciones SQL para números secuenciales (OP-YYYY-NNNNN, OC-YYYY-NNNNN) - Archivo creado en `prisma/migrations/20260126020742_initial/functions.sql`
- [x] Crear triggers para `updated_at` - Incluido en functions.sql
- [x] Crear vistas útiles (v_operaciones_pendientes, etc.) - Incluido en functions.sql
- [x] Ejecutar funciones SQL en base de datos ✅
- [ ] **Pendiente Fase 9:** Migración para nuevas entidades (Empresa, Evento, Entrega)

#### 1.3 Seed Data Inicial ✅
- [x] Crear script de seed (`prisma/seed.js`)
- [x] Insertar tipos de pallet (PV, PR, PC)
- [x] Crear usuario admin con hash bcrypt
- [x] Insertar proveedor y cliente de ejemplo
- [x] Ejecutar seed: `npm run db:seed` ✅

#### 1.4 Configurar Auth.js ✅
- [x] Crear `lib/auth.ts` con configuración de Auth.js
- [x] Configurar Credentials Provider
- [x] Implementar función de verificación con bcrypt (salt rounds: 10)
- [x] Crear `app/api/auth/[...nextauth]/route.ts`
- [x] Configurar middleware de autenticación

#### 1.5 Páginas de Autenticación ✅
- [x] Crear página de login (`app/(auth)/login/page.tsx`)
- [x] Formulario con React Hook Form + Zod
- [x] Validación de email y contraseña
- [x] Manejo de errores
- [x] Redirección después de login
- [ ] Página de logout (opcional - se puede usar `signOut` directamente)

#### 1.6 Middleware de Protección ✅
- [x] Crear `middleware.ts` para proteger rutas
- [x] Redirigir no autenticados a login
- [x] Proteger todas las rutas excepto `/login`

**Entregables:**
- ✅ Base de datos configurada y migrada
- ✅ Autenticación funcionando
- ✅ Usuario admin creado (email: admin@forestalsantalucia.cl, password: admin123)
- ✅ Rutas protegidas
- ✅ Funciones SQL, triggers y vistas creadas y ejecutadas en BD ✅
- ✅ Seed ejecutado exitosamente

**Funciones SQL Ejecutadas:**
- ✅ `generar_numero_operacion()` - Genera números secuenciales OP-YYYY-NNNNN
- ✅ `generar_numero_orden_compra()` - Genera números secuenciales OC-YYYY-NNNNN
- ✅ `update_updated_at_column()` - Función genérica para triggers de updated_at
- ✅ Triggers de `updated_at` para: operacion, proveedor, cliente, orden_compra
- ✅ Vista `v_operaciones_pendientes` - Operaciones con documentos faltantes
- ✅ Vista `v_operaciones_margenes` - Operaciones con márgenes calculados
- ✅ Vista `v_dashboard_resumen` - Resumen para dashboard

**Notas:**
- Todas las funciones SQL, triggers y vistas fueron ejecutadas exitosamente
- El seed creó: 3 tipos de pallet, 1 usuario admin, 1 proveedor, 1 cliente

---

## Fase 2: Módulo de Contactos
**Duración:** 2-3 días  
**Prioridad:** 🟡 Alta  
**Dependencias:** Fase 1  
**Estado:** ✅ Completada

### Objetivos
- CRUD de Proveedores y Clientes
- Validación de RUT chileno
- Listado con filtros

### Tareas

#### 2.1 Modelos y Validaciones ✅
- [x] Crear schema Zod para Proveedor (`lib/validations/contacto.ts`)
- [x] Crear schema Zod para Cliente (`lib/validations/contacto.ts`)
- [x] Función de validación de RUT chileno (`lib/validations/rut.ts`)
- [x] Validar dígito verificador
- [x] Normalizar RUT (eliminar puntos, mantener guión). Almacenar sin puntos (ej: `77442030-4`)

#### 2.2 API Routes - Proveedores ✅
- [x] `GET /api/proveedores` - Listar con filtros y paginación
- [x] `GET /api/proveedores/[id]` - Obtener por ID con estadísticas
- [x] `POST /api/proveedores` - Crear
- [x] `PUT /api/proveedores/[id]` - Actualizar
- [x] `PATCH /api/proveedores/[id]/activar` - Activar/desactivar

#### 2.3 API Routes - Clientes ✅
- [x] `GET /api/clientes` - Listar con filtros y paginación
- [x] `GET /api/clientes/[id]` - Obtener por ID con estadísticas
- [x] `POST /api/clientes` - Crear
- [x] `PUT /api/clientes/[id]` - Actualizar
- [x] `PATCH /api/clientes/[id]/activar` - Activar/desactivar

#### 2.4 Componentes UI ✅
- [x] `ContactosList` - Lista unificada de proveedores/clientes con tabs
- [x] `ContactoForm` - Formulario crear/editar con validación
- [x] `ContactoCard` - Tarjeta de contacto
- [x] `RutInput` - Input con validación de RUT en tiempo real

#### 2.5 Páginas ✅
- [x] `app/(dashboard)/contactos/page.tsx` - Listado
- [x] `app/(dashboard)/contactos/nuevo/page.tsx` - Crear
- [x] `app/(dashboard)/contactos/[id]/page.tsx` - Detalle/Editar

#### 2.6 Configuración Adicional ✅
- [x] Configurar React Query Provider (`lib/providers.tsx`)
- [x] Instalar componente Tabs de shadcn/ui

**Entregables:**
- ✅ CRUD completo de contactos
- ✅ Validación de RUT funcionando con formato y dígito verificador
- ✅ Listado con filtros, búsqueda y paginación
- ✅ Formularios con validación en tiempo real
- ✅ Componentes reutilizables y bien estructurados

**Archivos Creados:**
- `src/lib/validations/rut.ts` - Utilidades de validación de RUT
- `src/lib/validations/contacto.ts` - Schemas Zod para Proveedor y Cliente
- `src/lib/providers.tsx` - React Query Provider
- `src/components/contactos/RutInput.tsx` - Input con validación de RUT
- `src/components/contactos/ContactoCard.tsx` - Tarjeta de contacto
- `src/components/contactos/ContactoForm.tsx` - Formulario crear/editar
- `src/components/contactos/ContactosList.tsx` - Lista con tabs
- `src/app/api/proveedores/route.ts` - API Proveedores (GET, POST)
- `src/app/api/proveedores/[id]/route.ts` - API Proveedor individual (GET, PUT)
- `src/app/api/proveedores/[id]/activar/route.ts` - API Activar/Desactivar
- `src/app/api/clientes/route.ts` - API Clientes (GET, POST)
- `src/app/api/clientes/[id]/route.ts` - API Cliente individual (GET, PUT)
- `src/app/api/clientes/[id]/activar/route.ts` - API Activar/Desactivar
- `src/app/(dashboard)/contactos/page.tsx` - Página listado
- `src/app/(dashboard)/contactos/nuevo/page.tsx` - Página crear
- `src/app/(dashboard)/contactos/[id]/page.tsx` - Página detalle/editar

---

## Fase UI Mock: Visuales para Presentación
**Duración:** 2-3 días  
**Prioridad:** 🟡 Alta  
**Dependencias:** Fase 2  
**Estado:** ✅ Completada

### Objetivos
- Crear todas las visuales UI con mocks para presentación al cliente
- Implementar formularios con Formik y Yup
- No crear APIs reales, solo servicios mock

### Tareas

#### UI.1 Layout Principal ✅
- [x] Crear `Header` component con logo y menú de usuario
- [x] Crear `Navbar` component con navegación principal
- [x] Actualizar `layout.tsx` del dashboard para incluir Header y Navbar

#### UI.2 Dashboard ✅
- [x] Crear página Dashboard (`/dashboard`) con mocks
- [x] Acciones rápidas (Nueva Compra, Nueva Venta, Venta con Comisión)
- [x] Sección "Requieren Atención" con documentos faltantes y pagos pendientes
- [x] Resumen con estadísticas
- [x] Actividad reciente

#### UI.3 Páginas de Operaciones ✅
- [x] Listado de operaciones (`/operaciones`) con filtros y búsqueda
- [x] Crear operación (`/operaciones/nueva`) con Formik y validación Yup
  - Selector de tipo de operación (Radio Group visual)
  - Información general (fecha, cliente, proveedor, dirección, OC)
  - Tabla de productos dinámica
  - Cálculo automático de márgenes para ventas
  - Resumen financiero
- [x] Detalle de operación (`/operaciones/[id]`) con tabs
  - Tab Documentos (lista de documentos, faltantes resaltados)
  - Tab Pagos (lista de pagos registrados)
  - Tab Factoring (solo para ventas)
  - Observaciones
  - Botón cerrar operación

#### UI.4 Páginas de Órdenes de Compra ✅
- [x] Listado de OC (`/ordenes-compra`) con filtros
- [x] Crear OC (`/ordenes-compra/nueva`) con Formik y validación Yup
  - Información general (proveedor, fechas, dirección)
  - Tabla de productos dinámica
  - Observaciones
  - Botones: Guardar Borrador, Generar PDF
- [x] Detalle de OC (`/ordenes-compra/[id]`)
  - Información completa
  - Tabla de productos
  - Sección PDF (descargar)
  - Acciones (marcar recibida, cancelar)

#### UI.5 Página de Reportes ✅
- [x] Página de reportes (`/reportes`) con cards de opciones
  - Operaciones por Período
  - Pendientes
  - Historial por Contacto
  - Exportar Datos

#### UI.6 Servicios Mock ✅
- [x] Crear `lib/mocks/index.ts` con datos mock
- [x] Funciones mock para simular llamadas API
- [x] Mock de operaciones, órdenes de compra, contactos, dashboard

#### UI.7 Componentes Adicionales ✅
- [x] Instalar Formik y Yup
- [x] Instalar componentes shadcn/ui faltantes (textarea, radio-group)
- [x] Configurar FormikProvider en formularios

**Entregables:**
- ✅ Layout completo con Header y Navbar
- ✅ Dashboard funcional con mocks
- ✅ Todas las páginas principales creadas con visuales completas
- ✅ Formularios con Formik y validación Yup
- ✅ Servicios mock para todas las funcionalidades
- ✅ Navegación completa entre páginas
- ✅ Componentes reutilizables

**Archivos Creados:**
- `src/lib/mocks/index.ts` - Servicios mock y datos de prueba
- `src/components/shared/Header.tsx` - Header principal
- `src/components/shared/Navbar.tsx` - Barra de navegación
- `src/app/(dashboard)/layout.tsx` - Layout del dashboard actualizado
- `src/app/(dashboard)/dashboard/page.tsx` - Dashboard con mocks
- `src/app/(dashboard)/operaciones/page.tsx` - Listado de operaciones
- `src/app/(dashboard)/operaciones/nueva/page.tsx` - Crear operación (Formik)
- `src/app/(dashboard)/operaciones/[id]/page.tsx` - Detalle de operación
- `src/app/(dashboard)/ordenes-compra/page.tsx` - Listado de OC
- `src/app/(dashboard)/ordenes-compra/nueva/page.tsx` - Crear OC (Formik)
- `src/app/(dashboard)/ordenes-compra/[id]/page.tsx` - Detalle de OC
- `src/app/(dashboard)/reportes/page.tsx` - Página de reportes

**Notas:**
- Todas las páginas usan servicios mock (`mockApi`) en lugar de APIs reales
- Los formularios usan Formik con `useFormik` y `FormikProvider` como solicitado
- Las validaciones se realizan con Yup
- Los datos mock están en `src/lib/mocks/index.ts`
- Todas las visuales están listas para presentación al cliente

---

## Fase 3: Módulo de Operaciones (Core) ✅
**Duración:** 5-7 días  
**Prioridad:** 🔴 Crítica  
**Dependencias:** Fase 2, Fase UI Mock  
**Estado:** ✅ COMPLETADA

### Objetivos
- ✅ CRUD de operaciones unificadas
- ✅ Cálculo automático de márgenes
- ✅ Estados documental y financiero

### Tareas

#### 3.1 Modelos y Validaciones ✅
- [x] Crear schema Zod para Operacion
- [x] Crear schema Zod para OperacionLinea
- [x] Validar operación unificada (cliente + proveedor para VENTA_*)
- [x] Validar precios (margen no negativo)
- [x] Función para generar número secuencial (OP-YYYY-NNNNN)

#### 3.2 API Routes - Operaciones ✅
- [x] `GET /api/operaciones` - Listar con filtros y paginación
- [x] `GET /api/operaciones/[id]` - Obtener por ID con relaciones
- [x] `POST /api/operaciones` - Crear operación
- [x] `PUT /api/operaciones/[id]` - Actualizar
- [x] `PATCH /api/operaciones/[id]/estado-documental` - Actualizar estado
- [x] `PATCH /api/operaciones/[id]/estado-financiero` - Actualizar estado
- [x] `PATCH /api/operaciones/[id]/cerrar` - Cerrar operación
- [ ] **Pendiente Fase 9:** Agregar soporte para `evento_id` (opcional)
- [ ] **Pendiente Fase 9:** `GET /api/operaciones/[id]/evento` - Obtener evento asociado

#### 3.3 Funciones de Negocio ✅
- [x] Calcular total venta (Σ cantidad × precio_venta_unitario)
- [x] Calcular total compra (Σ cantidad × precio_compra_unitario)
- [x] Calcular margen bruto y porcentual
- [x] Detectar documentos faltantes
- [x] Actualizar estado documental automáticamente

#### 3.4 Componentes UI ✅
- [x] `OperacionesList` - Lista con filtros y búsqueda ✅ (UI Mock)
- [x] `OperacionCard` - Tarjeta de operación ✅ (UI Mock)
- [x] `OperacionForm` - Formulario crear/editar (complejo) ✅ (UI Mock con Formik)
- [x] `OperacionLineaForm` - Formulario de líneas de productos ✅ (UI Mock)
- [x] `OperacionDetalle` - Vista detalle completa ✅ (UI Mock)
- [x] `ResumenFinanciero` - Componente de márgenes ✅ (UI Mock)
- [x] `EstadoBadge` - Badge de estados ✅ (UI Mock)
- [ ] **Pendiente Fase 9:** Agregar selector de evento en `OperacionForm`
- [ ] **Pendiente Fase 9:** Agregar tab "Evento" en `OperacionDetalle`

#### 3.5 Páginas ✅
- [x] `app/(dashboard)/operaciones/page.tsx` - Listado ✅ (UI Mock)
- [x] `app/(dashboard)/operaciones/nueva/page.tsx` - Crear ✅ (UI Mock con Formik)
- [x] `app/(dashboard)/operaciones/[id]/page.tsx` - Detalle/Editar ✅ (UI Mock)

**Entregables:**
- ✅ CRUD completo de operaciones (APIs funcionales)
- ✅ Cálculo automático de márgenes 
- ✅ Estados funcionando (documental y financiero)
- ✅ Validaciones de negocio completas

**Archivos Creados:**
- `src/lib/validations/operacion.ts` - Schemas Zod para validación completa
- `src/lib/operaciones/calculos.ts` - Funciones de cálculo de totales y márgenes
- `src/lib/operaciones/documentos.ts` - Detección de documentos obligatorios y estado documental
- `src/app/api/operaciones/route.ts` - API para listar y crear operaciones
- `src/app/api/operaciones/[id]/route.ts` - API para CRUD de operación individual
- `src/app/api/operaciones/[id]/estado-documental/route.ts` - Actualizar estado documental
- `src/app/api/operaciones/[id]/estado-financiero/route.ts` - Actualizar estado financiero
- `src/app/api/operaciones/[id]/cerrar/route.ts` - Cerrar operación con observación obligatoria

**Funcionalidades Implementadas:**
- ✅ Validación completa con Zod incluyendo reglas de negocio complejas
- ✅ Cálculo automático de márgenes para operaciones de venta (unificadas)
- ✅ Generación de número secuencial (OP-YYYY-NNNNN) por año
- ✅ Soporte para operaciones unificadas (venta con compra asociada)
- ✅ Validación de margen no negativo (precio venta >= precio compra)
- ✅ Gestión de estados documental (INCOMPLETA/COMPLETA) y financiero (PENDIENTE/FACTURADA/PAGADA/CERRADA)
- ✅ Cierre de operación con observación obligatoria (mínimo 10 caracteres)
- ✅ Detección automática de documentos faltantes según tipo de operación
- ✅ Soporte para productos con certificación (NIMF-15 obligatorio)

---

## Fase 4: Módulo de Órdenes de Compra ✅
**Duración:** 4-5 días  
**Prioridad:** 🔴 Crítica  
**Dependencias:** Fase 3  
**Estado:** ✅ COMPLETADA

### Objetivos
- ✅ CRUD de órdenes de compra
- ✅ Generación de PDF profesional
- ✅ Asociación con operaciones

### Tareas

#### 4.1 Modelos y Validaciones ✅
- [x] Crear schema Zod para OrdenCompra
- [x] Crear schema Zod para OrdenCompraLinea
- [x] Función para generar número secuencial (OC-YYYY-NNNNN)
- [x] Validar que OC tenga al menos una línea antes de generar PDF

#### 4.2 API Routes - Órdenes de Compra ✅
- [x] `GET /api/ordenes-compra` - Listar con filtros
- [x] `GET /api/ordenes-compra/[id]` - Obtener por ID
- [x] `POST /api/ordenes-compra` - Crear
- [x] `PUT /api/ordenes-compra/[id]` - Actualizar (solo BORRADOR)
- [x] `POST /api/ordenes-compra/[id]/generar-pdf` - Generar PDF
- [x] `PATCH /api/ordenes-compra/[id]/estado` - Cambiar estado
- [x] `DELETE /api/ordenes-compra/[id]` - Eliminar (solo BORRADOR)

#### 4.3 Generación de PDF ✅
- [x] Crear template de OC en PDF con jsPDF
- [x] Incluir datos del proveedor
- [x] Incluir líneas de productos
- [x] Formato profesional con encabezado y pie de página
- [x] Cálculo automático de totales
- [x] Formateo de RUT con puntos
- [x] Actualizar `pdf_url` y `pdf_generado` en BD

#### 4.4 Componentes UI ✅
- [x] `OrdenesCompraList` - Lista con filtros ✅ (UI Mock)
- [x] `OrdenCompraCard` - Tarjeta de OC ✅ (UI Mock)
- [x] `OrdenCompraForm` - Formulario crear/editar ✅ (UI Mock con Formik)
- [x] `OrdenCompraLineaForm` - Formulario de líneas ✅ (UI Mock)
- [x] `OrdenCompraDetalle` - Vista detalle ✅ (UI Mock)

#### 4.5 Páginas ✅
- [x] `app/(dashboard)/ordenes-compra/page.tsx` - Listado ✅ (UI Mock)
- [x] `app/(dashboard)/ordenes-compra/nueva/page.tsx` - Crear ✅ (UI Mock con Formik)
- [x] `app/(dashboard)/ordenes-compra/[id]/page.tsx` - Detalle ✅ (UI Mock)

**Entregables:**
- ✅ CRUD completo de OCs (APIs funcionales)
- ✅ Generación de PDF con jsPDF
- ✅ Asociación con operaciones
- ✅ Estados de OC (BORRADOR, ENVIADA, RECIBIDA, CANCELADA)

**Archivos Creados:**
- `src/lib/validations/orden-compra.ts` - Schemas Zod para validación
- `src/lib/ordenes-compra/numero.ts` - Generación de número secuencial (OC-YYYY-NNNNN)
- `src/lib/ordenes-compra/pdf.ts` - Generación de PDF con jsPDF (template profesional)
- `src/app/api/ordenes-compra/route.ts` - API para listar y crear OCs
- `src/app/api/ordenes-compra/[id]/route.ts` - API para CRUD de OC individual
- `src/app/api/ordenes-compra/[id]/generar-pdf/route.ts` - API para generar PDF y cambiar estado
- `src/app/api/ordenes-compra/[id]/estado/route.ts` - API para cambiar estado de OC

**Funcionalidades Implementadas:**
- ✅ Validación completa con Zod incluyendo reglas específicas
- ✅ Generación de número secuencial (OC-YYYY-NNNNN) por año
- ✅ Generación de PDF profesional con:
  - Encabezado con datos de la empresa (FSL)
  - Datos completos del proveedor
  - Tabla de productos con cantidades, precios y subtotales
  - Total general calculado automáticamente
  - Formateo de RUT con puntos para mejor legibilidad
  - Observaciones
  - Dirección de entrega
  - Pie de página con número de página
- ✅ Estados de OC con validación de transiciones
- ✅ Solo editable/eliminable en estado BORRADOR
- ✅ Al generar PDF, cambia automáticamente a ENVIADA
- ✅ Asociación opcional con operaciones

---

## Fase 5: Módulo de Documentos
**Duración:** 3-4 días  
**Prioridad:** 🔴 Crítica  
**Dependencias:** Fase 3  
**Estado:** ✅ Completada  
**Infraestructura:** Mocks (desarrollo) → Amazon S3 (producción)

### Objetivos
- Subida de documentos (PDF, imágenes) con mocks inicialmente
- Asociación a operaciones
- Detección automática de documentos faltantes
- Preparar arquitectura para migración a S3

### Tareas

#### 5.1 Configuración de Storage ✅
- [x] **Fase Desarrollo:** Implementar capa de storage con mocks ✅
  - [x] Crear interfaz `IStorageProvider` (abstracción) ✅
  - [x] Implementar `MockStorageProvider` (desarrollo) ✅
  - [x] Simular upload con delays y retornar URLs mock ✅
- [x] **Fase Producción:** Preparar integración S3 (documentado, no implementar aún) ✅
  - [x] Documentar configuración AWS S3 ✅
  - [x] Documentar estructura de buckets ✅
  - [x] Crear `S3StorageProvider` (placeholder) ✅
- [x] Validar tipos de archivo (PDF, JPG, PNG) ✅
- [x] Validar tamaño máximo (10 MB) ✅

#### 5.2 API Routes - Documentos ✅
- [x] `GET /api/documentos?operacionId=...` - Listar por operación ✅
- [x] `GET /api/documentos/[id]` - Obtener por ID ✅
- [x] `POST /api/documentos` - Subir documento (multipart/form-data) ✅
- [x] `PUT /api/documentos/[id]` - Actualizar metadata ✅
- [x] `DELETE /api/documentos/[id]` - Eliminar ✅
- [x] `POST /api/documentos/detectar-faltantes` - Detectar faltantes (batch/single) ✅
- [x] `GET /api/documentos/detectar-faltantes?operacionId=xxx` - Obtener faltantes (read-only) ✅

#### 5.3 Funciones de Negocio ✅
- [x] Detectar documentos obligatorios según tipo de operación ✅
- [x] Detectar si hay productos que requieren certificación NIMF-15 ✅
- [x] Actualizar `estado_documental` automáticamente ✅
- [x] Marcar documentos como obligatorios según reglas ✅
- [x] Función para obtener documentos faltantes ✅
- [x] Validación de tipos de archivo permitidos ✅

#### 5.4 Componentes UI
- [x] `DocumentosList` - Lista de documentos de operación ✅ (UI Mock en detalle de operación)
- [ ] `DocumentoCard` - Tarjeta de documento (pendiente para siguiente fase)
- [ ] `DocumentoUpload` - Modal/formulario de subida (pendiente para siguiente fase)
- [ ] `DocumentoViewer` - Visualizador de PDF/imágenes (pendiente para siguiente fase)
- [x] `DocumentosFaltantes` - Alerta de documentos faltantes ✅ (UI Mock)

#### 5.5 Integración en Operaciones ✅
- [x] Agregar sección de documentos en detalle de operación ✅ (UI Mock)
- [x] Botón "Subir Documento" ✅ (UI Mock)
- [x] Lista de documentos con preview ✅ (UI Mock)
- [x] Indicador de documentos faltantes ✅ (UI Mock)

### Archivos Creados
**Capa de Storage:**
- `src/lib/storage/types.ts` - Interfaces y tipos
- `src/lib/storage/mock.ts` - MockStorageProvider
- `src/lib/storage/s3.ts` - S3StorageProvider (placeholder)
- `src/lib/storage/index.ts` - Factory y exports

**Validaciones:**
- `src/lib/validations/documento.ts` - Schemas Zod

**API Routes:**
- `src/app/api/documentos/route.ts` - GET (list), POST (upload)
- `src/app/api/documentos/[id]/route.ts` - GET, PUT, DELETE
- `src/app/api/documentos/detectar-faltantes/route.ts` - POST, GET

**Migración Prisma:**
- `prisma/migrations/20260127180900_add_orden_compra_cliente_enum/` - Agregar `ORDEN_COMPRA_CLIENTE` al enum `TipoDocumento`

### Notas
- ✅ **Storage con Mocks:** Funcional para desarrollo sin infraestructura S3
- ✅ **Capa de Abstracción:** Permite cambiar a S3 sin modificar lógica de negocio
- ✅ **Detección Automática:** Endpoint para actualizar estados documentales
- 📝 **UI Real:** Pendiente para siguiente fase (solo mocks por ahora)
- 📚 **Documentación:** `docs/ARQUITECTURA-STORAGE.md` creado

**Entregables:**
- ⏳ Subida de documentos funcionando (con mocks)
- ✅ Detección automática de faltantes (UI lista)
- ⏳ Visualización de documentos
- ⏳ Arquitectura preparada para migración a S3

**Notas:**
- **Desarrollo:** Se usarán mocks para simular el storage. Los documentos no se guardarán realmente.
- **Producción:** Cuando se requiera, se activará Amazon S3 cambiando una variable de entorno (`USE_MOCK_STORAGE=false`).
- **Migración:** El cambio será transparente, sin modificar código de APIs ni frontend.
- **Documentación:** Ver `ARQUITECTURA-STORAGE.md` para detalles completos de la estrategia.

---

## Fase 6: Módulo de Pagos
**Duración:** 3-4 días  
**Prioridad:** 🟡 Alta  
**Dependencias:** Fase 3  
**Estado:** ✅ Completada

### Objetivos
- Registrar pagos y cobros
- Asociación a operaciones
- Cálculo automático de totales

### Tareas

#### 6.1 API Routes - Pagos ✅
- [x] `GET /api/pagos?operacionId=...` - Listar por operación ✅
- [x] `GET /api/pagos/[id]` - Obtener por ID ✅
- [x] `POST /api/pagos` - Crear pago ✅
- [x] `PUT /api/pagos/[id]` - Actualizar ✅
- [x] `DELETE /api/pagos/[id]` - Eliminar ✅
- [x] `GET /api/pagos/resumen?operacionId=xxx` - Resumen financiero completo ✅
- [x] `PATCH /api/operaciones/[id]/actualizar-estado-financiero` - Recalcular estado ✅

#### 6.2 Funciones de Negocio ✅
- [x] Calcular total pagado/cobrado por operación ✅
- [x] Actualizar estado financiero automáticamente ✅
- [x] Validar coherencia de pago con tipo de operación ✅
- [x] Validar montos máximos (no exceder totales de operación) ✅
- [x] Calcular saldos pendientes por tipo de pago ✅
- [x] Calcular margen neto (considerando fletes y comisiones) ✅
- [x] Determinar estado sugerido según pagos ✅

#### 6.3 Componentes UI
- [x] `PagosList` - Lista de pagos de operación ✅ (UI Mock en detalle de operación)
- [ ] `PagoForm` - Modal/formulario de registro (pendiente para siguiente fase)
- [ ] `ResumenPagos` - Total pagado vs total operación (pendiente para siguiente fase)

#### 6.4 Integración en Operaciones ✅
- [x] Agregar tab de pagos en detalle de operación ✅ (UI Mock)
- [x] Botón "Registrar Pago" ✅ (UI Mock)
- [x] Lista de pagos con detalles ✅ (UI Mock)

### Archivos Creados
**Validaciones:**
- `src/lib/validations/pago.ts` - Schemas Zod para pagos

**Lógica de Negocio:**
- `src/lib/pagos/calculos.ts` - Funciones de cálculo financiero:
  - `calcularResumenFinanciero()` - Totales y saldos
  - `determinarEstadoFinanciero()` - Estado automático
  - `validarPagoParaOperacion()` - Validaciones de negocio
  - `calcularMontoMaximo()` - Límites por tipo de pago

**API Routes:**
- `src/app/api/pagos/route.ts` - GET (list), POST (create)
- `src/app/api/pagos/[id]/route.ts` - GET, PUT, DELETE
- `src/app/api/pagos/resumen/route.ts` - GET resumen financiero completo
- `src/app/api/operaciones/[id]/actualizar-estado-financiero/route.ts` - PATCH

**Ajustes:**
- `src/lib/operaciones/calculos.ts` - Soporte para Decimal de Prisma, interface unificada

**Entregables:**
- ✅ Registro de pagos funcionando
- ✅ Visualización de pagos (UI Mock)
- ✅ Cálculo automático de totales y estados
- ✅ Validaciones de negocio completas
- ✅ Resumen financiero detallado

**Nota:** APIs completas y funcionales. UI real de formularios pendiente para siguiente fase (actualmente solo UI Mock).

---

## Fase 7: Dashboard y Alertas
**Duración:** 3-4 días  
**Prioridad:** 🔴 Crítica  
**Dependencias:** Fases 3, 5, 6  
**Estado:** ✅ Completada (APIs y lógica)

### Objetivos
- Dashboard con pendientes y alertas
- Acciones rápidas
- Resumen de operaciones

### Tareas

#### 7.1 Dashboard - APIs ✅
- [x] Crear página Dashboard ✅ (UI Mock)
- [x] Acciones rápidas ✅ (UI Mock)
- [x] Sección "Requieren Atención" ✅ (UI Mock)
- [x] Resumen con estadísticas ✅ (UI Mock)
- [x] Actividad reciente ✅ (UI Mock)
- [x] `GET /api/dashboard/estadisticas` - Estadísticas generales ✅
- [x] `GET /api/dashboard/alertas` - Sistema de alertas completo ✅
- [x] `GET /api/dashboard/actividad-reciente` - Timeline de actividad ✅

#### 7.2 Alertas y Pendientes ✅
- [x] Detectar documentos faltantes ✅
- [x] Detectar pagos pendientes ✅
- [x] Detectar operaciones facturadas sin pagar ✅
- [x] Detectar operaciones antiguas sin cerrar ✅
- [x] Priorización de alertas (ALTA, MEDIA, BAJA) ✅
- [x] Agrupación por tipo y prioridad ✅
- [ ] Conectar UI Mock con APIs (pendiente para siguiente iteración)
- [ ] Notificaciones toast en UI (pendiente para siguiente iteración)

#### 7.3 Estadísticas Implementadas ✅
- [x] Estadísticas de operaciones (total, por tipo, por estado) ✅
- [x] Métricas financieras (ingresos, costos, márgenes) ✅
- [x] Operaciones pendientes (documentos, pagos, facturadas) ✅
- [x] Filtros por período (mes, trimestre, año, todo) ✅

### Archivos Creados
**Lógica de Negocio:**
- `src/lib/dashboard/estadisticas.ts` - Cálculo de estadísticas
  - `calcularEstadisticasOperaciones()`
  - `calcularMetricasFinancieras()`
  - `obtenerOperacionesPendientes()`
- `src/lib/dashboard/alertas.ts` - Sistema de alertas
  - `generarAlertasDocumentosIncompletos()`
  - `generarAlertasPagosPendientes()`
  - `generarAlertasFacturadasSinPagar()`
  - `generarAlertasOperacionesAntiguas()`
  - `generarTodasLasAlertas()`

**API Routes:**
- `src/app/api/dashboard/estadisticas/route.ts` - GET estadísticas por período
- `src/app/api/dashboard/alertas/route.ts` - GET alertas con priorización
- `src/app/api/dashboard/actividad-reciente/route.ts` - GET timeline de actividad

### Tipos de Alertas
- 🔴 **DOCUMENTOS_INCOMPLETOS** - Operaciones con documentos faltantes
- 💰 **PAGO_PENDIENTE** - Pagos pendientes en operaciones completas
- 💳 **FACTURADA_SIN_PAGAR** - Cliente pagó pero falta pagar proveedor
- ⏰ **OPERACION_ANTIGUA** - Operaciones > 60 días sin cerrar

### Prioridades de Alertas
- **ALTA**: Documentos > 15 días, Pagos > 30 días, Operaciones > 60 días
- **MEDIA**: Documentos > 7 días, Pagos pendientes, Facturadas sin pagar > 20 días
- **BAJA**: Documentos recientes

**Entregables:**
- ✅ APIs de dashboard completas y funcionales
- ✅ Sistema de alertas robusto con priorización
- ✅ Estadísticas en tiempo real
- ✅ Actividad reciente unificada
- 📱 UI Mock lista (conexión con APIs pendiente)

**Nota:** Toda la lógica de backend está implementada. La UI Mock existe pero falta conectarla con las APIs reales (tarea de integración frontend pendiente).

---

## Fase 8: Reportes y Mejoras
**Duración:** 2-3 días  
**Prioridad:** 🟢 Media  
**Dependencias:** Fases anteriores

### Objetivos
- Reportes básicos
- Exportación de datos
- Mejoras de UX

### Tareas

#### 8.1 Reportes
- [x] Página de reportes ✅ (UI Mock)
- [ ] Generar reporte de operaciones por período
- [ ] Generar reporte de pendientes
- [ ] Generar historial por contacto

#### 8.2 Exportación
- [ ] Exportar operaciones a Excel/CSV
- [ ] Exportar contactos
- [ ] Exportar órdenes de compra

#### 8.3 Mejoras UX
- [ ] Loading states mejorados
- [ ] Empty states
- [ ] Error handling
- [ ] Responsive ajustes

**Entregables:**
- ✅ Página de reportes con visuales ✅ (UI Mock)
- ⏳ Reportes funcionando
- ⏳ Exportación funcionando

---

## Fase 9: Módulo de Empresas, Eventos y Entregas
**Duración:** 4-5 días  
**Prioridad:** 🟡 Alta  
**Dependencias:** Fase 1, Fase 3  
**Estado:** ⏳ Pendiente

### Objetivos
- CRUD de Empresas (unificación de proveedores, clientes, transportistas)
- CRUD de Eventos (eventos logísticos/operativos)
- CRUD de Entregas (dentro de eventos)
- Asociación de eventos a operaciones
- Migración de base de datos para nuevas entidades

### Tareas

#### 9.1 Migración de Base de Datos ⏳
- [ ] Actualizar `schema.prisma` con modelos `Empresa`, `Evento`, `Entrega`
- [ ] Agregar ENUMs: `TipoEmpresa`, `EstadoEmpresa`, `TipoEvento`, `EstadoEvento`, `TipoEntrega`, `EstadoEntrega`
- [ ] Agregar campo `evento_id` (opcional) a `Operacion`
- [ ] Agregar campo `empresa_id` (opcional) a `Proveedor` y `Cliente` para compatibilidad
- [ ] Crear migración: `npx prisma migrate dev --name add_empresa_evento_entrega`
- [ ] Ejecutar funciones SQL para triggers `updated_at` en nuevas tablas
- [ ] Actualizar seed para incluir empresas de ejemplo

#### 9.2 Modelos y Validaciones ⏳
- [ ] Crear schema Zod para `Empresa`
- [ ] Crear schema Zod para `Evento`
- [ ] Crear schema Zod para `Entrega`
- [ ] Validar RUT de empresa (reutilizar validación existente)
- [ ] Validar relaciones (evento_id requerido en Entrega)
- [ ] Validar fechas (fecha_fin >= fecha_inicio en Evento)

#### 9.3 API Routes - Empresas ⏳
- [ ] `GET /api/empresas` - Listar con filtros (tipo, estado, búsqueda)
- [ ] `GET /api/empresas/[id]` - Obtener por ID con estadísticas
- [ ] `POST /api/empresas` - Crear empresa
- [ ] `PUT /api/empresas/[id]` - Actualizar
- [ ] `PATCH /api/empresas/[id]/activar` - Activar/desactivar
- [ ] `GET /api/empresas/[id]/operaciones` - Operaciones asociadas

#### 9.4 API Routes - Eventos ⏳
- [ ] `GET /api/eventos` - Listar con filtros (tipo, estado, operacion_id, fechas)
- [ ] `GET /api/eventos/[id]` - Obtener por ID con entregas
- [ ] `POST /api/eventos` - Crear evento
- [ ] `PUT /api/eventos/[id]` - Actualizar (solo si no está COMPLETADO)
- [ ] `PATCH /api/eventos/[id]/estado` - Cambiar estado
- [ ] `DELETE /api/eventos/[id]` - Eliminar (solo si no tiene entregas)
- [ ] `GET /api/eventos/[id]/entregas` - Listar entregas del evento

#### 9.5 API Routes - Entregas ⏳
- [ ] `GET /api/entregas?eventoId=...` - Listar por evento
- [ ] `GET /api/entregas/[id]` - Obtener por ID
- [ ] `POST /api/entregas` - Crear entrega
- [ ] `PUT /api/entregas/[id]` - Actualizar
- [ ] `DELETE /api/entregas/[id]` - Eliminar
- [ ] `PATCH /api/entregas/[id]/estado` - Cambiar estado

#### 9.6 Actualizar API de Operaciones ⏳
- [ ] Agregar campo `evento_id` (opcional) en creación/actualización
- [ ] Incluir información de evento en respuesta de detalle
- [ ] Endpoint `GET /api/operaciones/[id]/evento` - Obtener evento asociado

#### 9.7 Componentes UI - Empresas ⏳
- [ ] `EmpresasList` - Lista con filtros (tipo, estado, búsqueda)
- [ ] `EmpresaCard` - Tarjeta de empresa
- [ ] `EmpresaForm` - Formulario crear/editar
- [ ] `EmpresaCombobox` - Selector de empresa (reutilizable)
- [ ] `TipoEmpresaBadge` - Badge de tipo de empresa

#### 9.8 Componentes UI - Eventos ⏳
- [ ] `EventosList` - Lista con filtros
- [ ] `EventoCard` - Tarjeta de evento
- [ ] `EventoForm` - Formulario crear/editar
- [ ] `EventoDetalle` - Vista detalle con entregas
- [ ] `EstadoEventoBadge` - Badge de estado

#### 9.9 Componentes UI - Entregas ⏳
- [ ] `EntregasList` - Lista de entregas de un evento
- [ ] `EntregaCard` - Tarjeta de entrega
- [ ] `EntregaForm` - Modal/formulario crear/editar
- [ ] `EstadoEntregaBadge` - Badge de estado

#### 9.10 Páginas ⏳
- [ ] `app/(dashboard)/empresas/page.tsx` - Listado de empresas
- [ ] `app/(dashboard)/empresas/nueva/page.tsx` - Crear empresa
- [ ] `app/(dashboard)/empresas/[id]/page.tsx` - Detalle/editar empresa
- [ ] `app/(dashboard)/eventos/page.tsx` - Listado de eventos
- [ ] `app/(dashboard)/eventos/nueva/page.tsx` - Crear evento
- [ ] `app/(dashboard)/eventos/[id]/page.tsx` - Detalle de evento con entregas
- [ ] Actualizar `app/(dashboard)/operaciones/nueva/page.tsx` - Agregar selector de evento
- [ ] Actualizar `app/(dashboard)/operaciones/[id]/page.tsx` - Agregar tab de evento

#### 9.11 Integración con Operaciones ⏳
- [ ] Agregar selector de evento en formulario de operación
- [ ] Mostrar información de evento en detalle de operación
- [ ] Agregar tab "Evento" en detalle de operación (si tiene evento asociado)
- [ ] Link desde operación a evento completo

### Archivos a Crear

**Validaciones:**
- `src/lib/validations/empresa.ts` - Schemas Zod para Empresa
- `src/lib/validations/evento.ts` - Schemas Zod para Evento
- `src/lib/validations/entrega.ts` - Schemas Zod para Entrega

**API Routes:**
- `src/app/api/empresas/route.ts` - GET (list), POST (create)
- `src/app/api/empresas/[id]/route.ts` - GET, PUT
- `src/app/api/empresas/[id]/activar/route.ts` - PATCH
- `src/app/api/empresas/[id]/operaciones/route.ts` - GET
- `src/app/api/eventos/route.ts` - GET (list), POST (create)
- `src/app/api/eventos/[id]/route.ts` - GET, PUT, DELETE
- `src/app/api/eventos/[id]/estado/route.ts` - PATCH
- `src/app/api/eventos/[id]/entregas/route.ts` - GET
- `src/app/api/entregas/route.ts` - GET (list), POST (create)
- `src/app/api/entregas/[id]/route.ts` - GET, PUT, DELETE
- `src/app/api/entregas/[id]/estado/route.ts` - PATCH
- `src/app/api/operaciones/[id]/evento/route.ts` - GET

**Componentes:**
- `src/components/empresas/EmpresasList.tsx`
- `src/components/empresas/EmpresaCard.tsx`
- `src/components/empresas/EmpresaForm.tsx`
- `src/components/empresas/EmpresaCombobox.tsx`
- `src/components/eventos/EventosList.tsx`
- `src/components/eventos/EventoCard.tsx`
- `src/components/eventos/EventoForm.tsx`
- `src/components/eventos/EventoDetalle.tsx`
- `src/components/entregas/EntregasList.tsx`
- `src/components/entregas/EntregaCard.tsx`
- `src/components/entregas/EntregaForm.tsx`

**Páginas:**
- `src/app/(dashboard)/empresas/page.tsx`
- `src/app/(dashboard)/empresas/nueva/page.tsx`
- `src/app/(dashboard)/empresas/[id]/page.tsx`
- `src/app/(dashboard)/eventos/page.tsx`
- `src/app/(dashboard)/eventos/nueva/page.tsx`
- `src/app/(dashboard)/eventos/[id]/page.tsx`

**Entregables:**
- ⏳ Migración de base de datos ejecutada
- ⏳ CRUD completo de empresas
- ⏳ CRUD completo de eventos
- ⏳ CRUD completo de entregas
- ⏳ Integración con operaciones
- ⏳ UI completa para todas las nuevas entidades

**Notas:**
- Las empresas unifican la representación de organizaciones (proveedores, clientes, transportistas)
- Los eventos permiten agrupar entregas relacionadas
- Las entregas siempre deben estar asociadas a un evento
- Los eventos pueden estar asociados opcionalmente a operaciones
- La UI debe permitir crear empresas desde cualquier contexto (operaciones, eventos, etc.)

---

## 📊 Resumen de Progreso

| Fase | Estado | Progreso |
|------|--------|----------|
| Fase 0: Setup | ✅ Completada | 100% |
| Fase 1: Auth y BD | ✅ Completada | 100% |
| Fase 2: Contactos | ✅ Completada | 100% |
| **Fase UI Mock** | ✅ **Completada** | **100%** |
| Fase 3: Operaciones | ✅ Completada | 100% (APIs funcionales) |
| Fase 4: Órdenes de Compra | ✅ Completada | 100% (APIs funcionales) |
| Fase 5: Documentos | ✅ Completada | 80% (APIs funcionales, UI mock) |
| Fase 6: Pagos | ✅ Completada | 80% (APIs funcionales, UI mock) |
| Fase 7: Dashboard | ✅ Completada | 90% (APIs funcionales, UI mock) |
| Fase 8: Reportes | ⏳ Pendiente | 30% (UI lista, funcionalidad pendiente) |
| **Fase 9: Empresas, Eventos, Entregas** | ⏳ **Pendiente** | **0%** (Documentación lista) |

**Progreso General:** ~85% del MVP (sin contar Fase 9)

---

## 🎯 Próximos Pasos

### Prioridad Alta
1. **Fase 9: Implementar Empresas, Eventos y Entregas**
   - Migración de base de datos para nuevas entidades
   - APIs completas para CRUD de empresas, eventos y entregas
   - UI completa según UI-SPEC v1.5
   - Integración con operaciones (asociar eventos)

2. **Conectar UI Mock con APIs reales**
   - Reemplazar `mockApi` con llamadas reales en todas las páginas
   - Conectar Dashboard con APIs reales
   - Conectar formularios de operaciones con APIs
   - Conectar formularios de órdenes de compra con APIs

### Prioridad Media
3. **Completar componentes UI faltantes**
   - `DocumentoUpload` - Modal de subida de documentos
   - `DocumentoViewer` - Visualizador de PDF/imágenes
   - `PagoForm` - Modal de registro de pagos
   - `ResumenPagos` - Componente de resumen financiero

4. **Completar Fase 8: Reportes**
   - Generar reporte de operaciones por período
   - Generar reporte de pendientes
   - Generar historial por contacto
   - Exportar datos a Excel/CSV

### Prioridad Baja
5. **Mejoras UX**
   - Loading states mejorados
   - Empty states consistentes
   - Error handling robusto
   - Ajustes responsive

---

*Última actualización: 2026-01-27*
