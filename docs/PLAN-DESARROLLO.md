# Plan de Desarrollo - Sistema de Gestión Operativa
## Forestal Santa Lucía SpA

**Versión:** 1.1  
**Fecha:** 2026-01-26  
**Stack:** Next.js 14 (App Router) + TypeScript + Prisma + Auth.js + shadcn/ui + Formik  
**Duración Total Estimada:** 6-8 semanas (MVP completo)  
**Estado Actual:** Fases 0-2 completadas, UI Mock completada para presentación

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

## Fase 3: Módulo de Operaciones (Core)
**Duración:** 5-7 días  
**Prioridad:** 🔴 Crítica  
**Dependencias:** Fase 2, Fase UI Mock

### Objetivos
- CRUD de operaciones unificadas
- Cálculo automático de márgenes
- Estados documental y financiero

### Tareas

#### 3.1 Modelos y Validaciones
- [ ] Crear schema Zod para Operacion
- [ ] Crear schema Zod para OperacionLinea
- [ ] Validar operación unificada (cliente + proveedor para VENTA_*)
- [ ] Validar precios (margen no negativo)
- [ ] Función para generar número secuencial (OP-YYYY-NNNNN)

#### 3.2 API Routes - Operaciones
- [ ] `GET /api/operaciones` - Listar con filtros y paginación
- [ ] `GET /api/operaciones/[id]` - Obtener por ID con relaciones
- [ ] `POST /api/operaciones` - Crear operación
- [ ] `PUT /api/operaciones/[id]` - Actualizar
- [ ] `PATCH /api/operaciones/[id]/estado-documental` - Actualizar estado
- [ ] `PATCH /api/operaciones/[id]/estado-financiero` - Actualizar estado
- [ ] `PATCH /api/operaciones/[id]/cerrar` - Cerrar operación

#### 3.3 Funciones de Negocio
- [ ] Calcular total venta (Σ cantidad × precio_venta_unitario)
- [ ] Calcular total compra (Σ cantidad × precio_compra_unitario)
- [ ] Calcular margen bruto y porcentual
- [ ] Detectar documentos faltantes
- [ ] Actualizar estado documental automáticamente

#### 3.4 Componentes UI
- [x] `OperacionesList` - Lista con filtros y búsqueda ✅ (UI Mock)
- [x] `OperacionCard` - Tarjeta de operación ✅ (UI Mock)
- [x] `OperacionForm` - Formulario crear/editar (complejo) ✅ (UI Mock con Formik)
- [x] `OperacionLineaForm` - Formulario de líneas de productos ✅ (UI Mock)
- [x] `OperacionDetalle` - Vista detalle completa ✅ (UI Mock)
- [x] `ResumenFinanciero` - Componente de márgenes ✅ (UI Mock)
- [x] `EstadoBadge` - Badge de estados ✅ (UI Mock)

#### 3.5 Páginas
- [x] `app/(dashboard)/operaciones/page.tsx` - Listado ✅ (UI Mock)
- [x] `app/(dashboard)/operaciones/nueva/page.tsx` - Crear ✅ (UI Mock con Formik)
- [x] `app/(dashboard)/operaciones/[id]/page.tsx` - Detalle/Editar ✅ (UI Mock)

**Entregables:**
- ⏳ CRUD completo de operaciones (UI lista, APIs pendientes)
- ✅ Cálculo automático de márgenes (implementado en UI Mock)
- ⏳ Estados funcionando (UI lista, lógica pendiente)
- ⏳ Validaciones de negocio (UI lista, backend pendiente)

**Nota:** Las visuales UI están completas. Falta conectar con APIs reales y lógica de negocio.

---

## Fase 4: Módulo de Órdenes de Compra
**Duración:** 4-5 días  
**Prioridad:** 🔴 Crítica  
**Dependencias:** Fase 3

### Objetivos
- CRUD de órdenes de compra
- Generación de PDF profesional
- Asociación con operaciones

### Tareas

#### 4.1 Modelos y Validaciones
- [ ] Crear schema Zod para OrdenCompra
- [ ] Crear schema Zod para OrdenCompraLinea
- [ ] Función para generar número secuencial (OC-YYYY-NNNNN)
- [ ] Validar que OC tenga al menos una línea antes de generar PDF

#### 4.2 API Routes - Órdenes de Compra
- [ ] `GET /api/ordenes-compra` - Listar con filtros
- [ ] `GET /api/ordenes-compra/[id]` - Obtener por ID
- [ ] `POST /api/ordenes-compra` - Crear
- [ ] `PUT /api/ordenes-compra/[id]` - Actualizar (solo BORRADOR)
- [ ] `POST /api/ordenes-compra/[id]/generar-pdf` - Generar PDF
- [ ] `GET /api/ordenes-compra/[id]/pdf` - Descargar PDF
- [ ] `PATCH /api/ordenes-compra/[id]/estado` - Cambiar estado
- [ ] `POST /api/ordenes-compra/[id]/asociar-operacion` - Asociar a operación
- [ ] `DELETE /api/ordenes-compra/[id]` - Eliminar (solo BORRADOR)

#### 4.3 Generación de PDF
- [ ] Crear template de OC en PDF
- [ ] Incluir datos del proveedor
- [ ] Incluir líneas de productos
- [ ] Formato profesional con logo (si aplica)
- [ ] Guardar PDF en `/uploads/ocs/`
- [ ] Actualizar `pdf_url` y `pdf_generado` en BD

#### 4.4 Componentes UI
- [x] `OrdenesCompraList` - Lista con filtros ✅ (UI Mock)
- [x] `OrdenCompraCard` - Tarjeta de OC ✅ (UI Mock)
- [x] `OrdenCompraForm` - Formulario crear/editar ✅ (UI Mock con Formik)
- [x] `OrdenCompraLineaForm` - Formulario de líneas ✅ (UI Mock)
- [x] `OrdenCompraDetalle` - Vista detalle ✅ (UI Mock)
- [ ] `PDFViewer` - Visualizador de PDF
- [ ] `PDFGenerator` - Botón generar PDF

#### 4.5 Páginas
- [x] `app/(dashboard)/ordenes-compra/page.tsx` - Listado ✅ (UI Mock)
- [x] `app/(dashboard)/ordenes-compra/nueva/page.tsx` - Crear ✅ (UI Mock con Formik)
- [x] `app/(dashboard)/ordenes-compra/[id]/page.tsx` - Detalle ✅ (UI Mock)

**Entregables:**
- ⏳ CRUD completo de OCs (UI lista, APIs pendientes)
- ⏳ Generación de PDF funcionando
- ⏳ Asociación con operaciones

**Nota:** Las visuales UI están completas. Falta conectar con APIs reales y generar PDFs.

---

## Fase 5: Módulo de Documentos
**Duración:** 3-4 días  
**Prioridad:** 🔴 Crítica  
**Dependencias:** Fase 3

### Objetivos
- Subida de documentos (PDF, imágenes)
- Asociación a operaciones
- Detección automática de documentos faltantes

### Tareas

#### 5.1 Configuración de Storage
- [ ] Configurar almacenamiento (local o Supabase Storage/S3)
- [ ] Crear estructura de carpetas (`/uploads/documentos/`)
- [ ] Validar tipos de archivo (PDF, JPG, PNG)
- [ ] Validar tamaño máximo (10 MB)

#### 5.2 API Routes - Documentos
- [ ] `GET /api/documentos?operacionId=...` - Listar por operación
- [ ] `GET /api/documentos/[id]` - Obtener por ID
- [ ] `POST /api/documentos` - Subir documento (multipart/form-data)
- [ ] `GET /api/documentos/[id]/archivo` - Descargar archivo
- [ ] `DELETE /api/documentos/[id]` - Eliminar

#### 5.3 Funciones de Negocio
- [ ] Detectar documentos obligatorios según tipo de operación
- [ ] Detectar si hay productos que requieren certificación NIMF-15
- [ ] Actualizar `estado_documental` automáticamente
- [ ] Marcar documentos como obligatorios según reglas

#### 5.4 Componentes UI
- [x] `DocumentosList` - Lista de documentos de operación ✅ (UI Mock en detalle de operación)
- [ ] `DocumentoCard` - Tarjeta de documento
- [ ] `DocumentoUpload` - Modal/formulario de subida (con Formik)
- [ ] `DocumentoViewer` - Visualizador de PDF/imágenes
- [x] `DocumentosFaltantes` - Alerta de documentos faltantes ✅ (UI Mock)

#### 5.5 Integración en Operaciones
- [x] Agregar sección de documentos en detalle de operación ✅ (UI Mock)
- [x] Botón "Subir Documento" ✅ (UI Mock)
- [x] Lista de documentos con preview ✅ (UI Mock)
- [x] Indicador de documentos faltantes ✅ (UI Mock)

**Entregables:**
- ⏳ Subida de documentos funcionando
- ✅ Detección automática de faltantes (UI lista)
- ⏳ Visualización de documentos

**Nota:** Las visuales UI están completas en el detalle de operación. Falta implementar el modal de subida y las APIs.

---

## Fase 6: Módulo de Pagos
**Duración:** 3-4 días  
**Prioridad:** 🟡 Alta  
**Dependencias:** Fase 3

### Objetivos
- Registrar pagos y cobros
- Asociación a operaciones
- Cálculo automático de totales

### Tareas

#### 6.1 API Routes - Pagos
- [ ] `GET /api/pagos?operacionId=...` - Listar por operación
- [ ] `GET /api/pagos/[id]` - Obtener por ID
- [ ] `POST /api/pagos` - Crear pago
- [ ] `PUT /api/pagos/[id]` - Actualizar
- [ ] `DELETE /api/pagos/[id]` - Eliminar

#### 6.2 Funciones de Negocio
- [ ] Calcular total pagado/cobrado por operación
- [ ] Actualizar estado financiero automáticamente
- [ ] Validar que no se elimine pago si operación está cerrada

#### 6.3 Componentes UI
- [x] `PagosList` - Lista de pagos de operación ✅ (UI Mock en detalle de operación)
- [ ] `PagoForm` - Modal/formulario de registro (con Formik)
- [ ] `ResumenPagos` - Total pagado vs total operación

#### 6.4 Integración en Operaciones
- [x] Agregar tab de pagos en detalle de operación ✅ (UI Mock)
- [x] Botón "Registrar Pago" ✅ (UI Mock)
- [x] Lista de pagos con detalles ✅ (UI Mock)

**Entregables:**
- ⏳ Registro de pagos funcionando
- ✅ Visualización de pagos (UI lista)
- ⏳ Cálculo automático de totales

**Nota:** Las visuales UI están completas en el detalle de operación. Falta implementar el modal de registro y las APIs.

---

## Fase 7: Dashboard y Alertas
**Duración:** 3-4 días  
**Prioridad:** 🔴 Crítica  
**Dependencias:** Fases 3, 5, 6

### Objetivos
- Dashboard con pendientes y alertas
- Acciones rápidas
- Resumen de operaciones

### Tareas

#### 7.1 Dashboard
- [x] Crear página Dashboard ✅ (UI Mock)
- [x] Acciones rápidas ✅ (UI Mock)
- [x] Sección "Requieren Atención" ✅ (UI Mock)
- [x] Resumen con estadísticas ✅ (UI Mock)
- [x] Actividad reciente ✅ (UI Mock)
- [ ] Conectar con APIs reales
- [ ] Actualizar en tiempo real

#### 7.2 Alertas y Pendientes
- [x] Detectar documentos faltantes ✅ (UI Mock)
- [x] Detectar pagos pendientes ✅ (UI Mock)
- [ ] Alertas en tiempo real
- [ ] Notificaciones toast

**Entregables:**
- ✅ Dashboard funcional con visuales completas (UI Mock)
- ⏳ Alertas funcionando (pendiente conectar con APIs)

**Nota:** Las visuales UI están completas. Falta conectar con APIs reales.

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

## 📊 Resumen de Progreso

| Fase | Estado | Progreso |
|------|--------|----------|
| Fase 0: Setup | ✅ Completada | 100% |
| Fase 1: Auth y BD | ✅ Completada | 100% |
| Fase 2: Contactos | ✅ Completada | 100% |
| **Fase UI Mock** | ✅ **Completada** | **100%** |
| Fase 3: Operaciones | ⏳ En progreso | 60% (UI lista, APIs pendientes) |
| Fase 4: Órdenes de Compra | ⏳ En progreso | 60% (UI lista, APIs pendientes) |
| Fase 5: Documentos | ⏳ Pendiente | 40% (UI lista, APIs pendientes) |
| Fase 6: Pagos | ⏳ Pendiente | 40% (UI lista, APIs pendientes) |
| Fase 7: Dashboard | ⏳ En progreso | 80% (UI lista, APIs pendientes) |
| Fase 8: Reportes | ⏳ Pendiente | 30% (UI lista, funcionalidad pendiente) |

**Progreso General:** ~65% del MVP

---

## 🎯 Próximos Pasos

1. **Conectar UI Mock con APIs reales** - Reemplazar `mockApi` con llamadas reales
2. **Completar Fase 3** - Implementar APIs de operaciones y lógica de negocio
3. **Completar Fase 4** - Implementar generación de PDFs
4. **Completar Fase 5** - Implementar subida de documentos
5. **Completar Fase 6** - Implementar registro de pagos
6. **Completar Fase 7** - Conectar dashboard con datos reales
7. **Completar Fase 8** - Implementar reportes y exportación

---

*Última actualización: 2026-01-26*
