# UI Specification Document - Forestal Santa Lucía

**Versión:** 1.5  
**Fecha:** 2026-01-27  
**Basado en:** SDD v3.3, DATABASE-SCHEMA v1.6  
**Framework objetivo:** Next.js 14 + shadcn/ui + Tailwind CSS

**Cambios v1.5:**
- ✅ Actualizado para incluir entidad `Empresa` (organizaciones: proveedores, clientes, transportistas)
- ✅ Actualizado para incluir entidad `Evento` (eventos logísticos/operativos)
- ✅ Actualizado para incluir entidad `Entrega` (entregas dentro de eventos)
- ✅ Agregada opción de asociar evento a operaciones
- ✅ Agregadas vistas para gestionar empresas, eventos y entregas  

---

## 1. Principios de Diseño

### 1.1 Filosofía UX

| Principio | Descripción | Implementación |
|-----------|-------------|----------------|
| **Simplicidad** | El usuario busca orden, no complejidad | Mínimos clicks, acciones claras |
| **Pendientes primero** | Lo más importante es saber "qué falta" | Dashboard centrado en alertas |
| **Operación como centro** | Todo gira alrededor de operaciones | Una sola entidad principal |
| **Progresión visual** | El estado debe ser obvio | Colores, íconos, badges |
| **Acción inmediata** | Ver problema → Actuar | Links directos a resolver pendientes |

### 1.2 Sistema de Colores (Estados)

```
🔴 Rojo      (#EF4444) → Incompleto / Urgente / Error
🟡 Amarillo  (#F59E0B) → En progreso / Atención / Warning  
🟢 Verde     (#10B981) → Completo / OK / Success
⚪ Gris      (#6B7280) → Pendiente / Sin iniciar
✅ Check     (#059669) → Cerrado / Finalizado
```

### 1.3 Tipografía y Espaciado

- **Font:** Inter (sistema) o Geist Sans
- **Tamaños:** 14px base, 16px destacado, 12px secundario
- **Espaciado:** Sistema de 4px (4, 8, 12, 16, 24, 32, 48)

---

## 2. Estructura de Navegación

### 2.1 Layout Principal

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                               HEADER (64px)                                  │
│  ┌──────────┐                                         ┌────────────────────┐ │
│  │   Logo   │                                         │ Usuario ▼ │ Salir  │ │
│  └──────────┘                                         └────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│                               NAVBAR (48px)                                  │
│  [Dashboard]  [Operaciones]  [Órdenes de Compra]  [Contactos]  [Reportes]  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                                                                              │
│                            CONTENT AREA                                      │
│                          (100% - 112px height)                               │
│                                                                              │
│                                                                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Mapa de Navegación

```
/login                          → Página de login
/                               → Dashboard (redirecciona si no autenticado)
│
├── /operaciones                → Lista de operaciones
│   ├── /operaciones/nueva      → Crear operación
│   └── /operaciones/[id]       → Detalle de operación
│       ├── /documentos         → Tab de documentos
│       ├── /pagos              → Tab de pagos
│       ├── /factoring          → Tab de factoring (si aplica)
│       └── /evento             → Tab de evento y entregas (si aplica)
│
├── /ordenes-compra             → Lista de órdenes de compra
│   ├── /ordenes-compra/nueva    → Crear orden de compra
│   └── /ordenes-compra/[id]     → Detalle de orden de compra
│
├── /contactos                  → Lista de contactos
│   ├── /contactos/proveedores  → Tab proveedores
│   │   ├── /nuevo              → Crear proveedor
│   │   └── /[id]               → Editar proveedor
│   └── /contactos/clientes     → Tab clientes
│       ├── /nuevo              → Crear cliente
│       └── /[id]               → Editar cliente
│
├── /empresas                   → Lista de empresas
│   ├── /empresas/nueva         → Crear empresa
│   └── /empresas/[id]          → Detalle/editar empresa
│
├── /eventos                    → Lista de eventos
│   ├── /eventos/nuevo          → Crear evento
│   └── /eventos/[id]           → Detalle de evento
│       └── /entregas           → Tab de entregas del evento
│
├── /reportes                   → Centro de reportes
│   ├── /operaciones            → Reporte de operaciones
│   ├── /pendientes             → Reporte de pendientes
│   └── /contacto/[id]          → Historial por contacto
│
└── /configuracion              → Configuración (futuro)
```

---

## 3. Páginas y Vistas

### 3.1 Login (`/login`)

**Propósito:** Autenticación del usuario único mediante Auth.js (NextAuth.js v5) con Credentials Provider

**Nota Técnica:**
- Autenticación se maneja con Auth.js
- Sesiones con cookies HTTP-only (seguras)
- Contraseñas se hashean con bcrypt (salt rounds: 10) antes de almacenar

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│                      🌲 Forestal Santa Lucía                       │
│                                                                    │
│               ┌────────────────────────────────────┐               │
│               │                                    │               │
│               │  Email                             │               │
│               │  ┌──────────────────────────────┐  │               │
│               │  │ admin@forestalsanta...       │  │               │
│               │  └──────────────────────────────┘  │               │
│               │                                    │               │
│               │  Contraseña                        │               │
│               │  ┌──────────────────────────────┐  │               │
│               │  │ ••••••••••••                 │  │               │
│               │  └──────────────────────────────┘  │               │
│               │                                    │               │
│               │  ☐ Mantener sesión iniciada        │               │
│               │                                    │               │
│               │  ┌──────────────────────────────┐  │               │
│               │  │       Iniciar Sesión         │  │               │
│               │  └──────────────────────────────┘  │               │
│               │                                    │               │
│               └────────────────────────────────────┘               │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Componentes:**
- Card centrada con logo
- Input email con validación
- Input password con toggle visibility
- Checkbox "Recordar sesión"
- Botón submit con loading state
- Mensaje de error inline

**Estados:**
- Default
- Loading (spinner en botón)
- Error (mensaje rojo bajo inputs)

---

### 3.2 Dashboard (`/`)

**Propósito:** Vista principal con pendientes y acciones rápidas

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Dashboard                                            Hoy: 12 enero 2026     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  ⚡ ACCIONES RÁPIDAS                                                    │  │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐   │  │
│  │  │ + Nueva Compra  │ │ + Nueva Venta   │ │ + Venta con Comisión    │   │  │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌─────────────────────────────────────┐  ┌────────────────────────────────┐ │
│  │  🔴 REQUIEREN ATENCIÓN (8)          │  │  📊 RESUMEN                    │ │
│  │  ─────────────────────────────────  │  │  ────────────────────────────  │ │
│  │                                     │  │                                │ │
│  │  📄 Documentos faltantes (5)        │  │  Operaciones abiertas:    23   │ │
│  │  ├─ OP-2026-00123 Falta Guía       │  │  Cerradas (30 días):      18   │ │
│  │  ├─ OP-2026-00124 Falta NIMF-15    │  │  ────────────────────────────  │ │
│  │  ├─ OP-2026-00125 Falta Factura    │  │  Compras:                 12   │ │
│  │  └─ [Ver todas →]                  │  │  Ventas:                  11   │ │
│  │                                     │  │                                │ │
│  │  💰 Pagos pendientes (3)            │  │                                │ │
│  │  ├─ OP-2026-00120 $2.500.000       │  │                                │ │
│  │  ├─ OP-2026-00121 $3.200.000       │  │                                │ │
│  │  └─ [Ver todas →]                  │  │                                │ │
│  │                                     │  │                                │ │
│  └─────────────────────────────────────┘  └────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  🕐 ACTIVIDAD RECIENTE                                                 │  │
│  │  ────────────────────────────────────────────────────────────────────  │  │
│  │  • OP-2026-00130 creada hace 2 horas - Venta a Cermaq                  │  │
│  │  • OP-2026-00129 documento agregado hace 3 horas                       │  │
│  │  • OP-2026-00128 cerrada hace 5 horas                                  │  │
│  │  • OP-2026-00127 pago registrado hace 1 día                            │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Componentes:**

1. **Acciones Rápidas (Card)**
   - 3 botones grandes para crear operación por tipo
   - Íconos distintivos por tipo

2. **Requieren Atención (Card con lista)**
   - Sección colapsable por categoría
   - Items clickeables que llevan a la operación
   - Badge con contador
   - Link "Ver todas" a vista filtrada

3. **Resumen (Card con stats)**
   - Números grandes
   - Comparación implícita

4. **Actividad Reciente (Card con timeline)**
   - Últimas 5-10 acciones
   - Timestamps relativos ("hace 2 horas")
   - Links a operaciones

---

### 3.3 Lista de Operaciones (`/operaciones`)

**Propósito:** Ver, buscar y filtrar todas las operaciones

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Operaciones                                           [+ Nueva Operación]   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  🔍 Buscar: [OP-2026-00...]     Tipo: [Todas ▼]                        │  │
│  │                                                                        │  │
│  │  Estado Doc: [Todos ▼]   Estado Fin: [Todos ▼]   Desde: [__/__/__]     │  │
│  │                                                                        │  │
│  │  Contacto: [Buscar proveedor/cliente...]              [🔄 Limpiar]     │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  Mostrando 48 operaciones                                              │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │  OP-2026-00130         VENTA        12/01/2026                   │  │  │
│  │  │  Cliente: Cermaq Chile S.A.                                      │  │  │
│  │  │  500 Pallet Verde • $6.750.000                                   │  │  │
│  │  │  ┌────────────┐   ┌──────────────┐                      [Ver →]  │  │  │
│  │  │  │ 🔴 2/3 Docs │   │ 🟡 Facturada │                               │  │  │
│  │  │  └────────────┘   └──────────────┘                               │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │  OP-2026-00129         COMPRA       11/01/2026                   │  │  │
│  │  │  Proveedor: Forestal Andes Ltda.                                 │  │  │
│  │  │  1000 Pallet Certificado • $15.000.000                           │  │  │
│  │  │  ┌────────────┐  ┌────────────┐                         [Ver →]  │  │  │
│  │  │  │ 🟢 3/3 Docs │  │ 🟢 Pagada  │                                  │  │  │
│  │  │  └────────────┘  └────────────┘                                  │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  [... más operaciones ...]                                             │  │
│  │                                                                        │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │  ◀ Anterior    Página 1 de 5    Siguiente ▶         [10 ▼] por página  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Componentes:**

1. **Barra de Filtros**
   - Input búsqueda por número
   - Select tipo operación
   - Select estado documental
   - Select estado financiero
   - Date picker rango
   - Combobox contacto (búsqueda)
   - Botón limpiar filtros

2. **Lista de Operaciones (Cards)**
   - Card por operación con:
     - Número y tipo (badge color)
     - Fecha
     - Contacto principal
     - Resumen de productos
     - Badges de estado (doc + financiero)
     - Botón "Ver"

3. **Paginación**
   - Navegación de páginas
   - Selector de items por página

**Estados de Cards:**
- Normal (borde gris)
- Con pendientes (borde naranja sutil)
- Cerrada (borde verde, fondo sutil)

---

### 3.4 Crear Operación (`/operaciones/nueva`)

**Propósito:** Formulario para crear nueva operación

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Volver                            Nueva Operación                         │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  TIPO DE OPERACIÓN                                                     │  │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐   │  │
│  │  │ ◉ Compra        │ │ ○ Venta Directa │ │ ○ Venta con Comisión    │   │  │
│  │  │   📦             │ │   💰             │ │   🤝                    │   │  │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  INFORMACIÓN GENERAL                                                   │  │
│  │                                                                        │  │
│  │  Fecha *                                                               │  │
│  │  ┌───────────────────┐                                                 │  │
│  │  │ 📅 12/01/2026     │                                                 │  │
│  │  └───────────────────┘                                                 │  │
│  │                                                                        │  │
│  │  Cliente * (obligatorio para ventas)                                  │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │ 🔍 Buscar cliente...                                              │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  │  [+ Crear nuevo cliente]                                               │  │
│  │                                                                        │  │
│  │  Proveedor * (obligatorio para ventas - proveedor del cual FSL compra)│  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │ 🔍 Buscar proveedor...                                           │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  │  [+ Crear nuevo proveedor]                                             │  │
│  │                                                                        │  │
│  │  Dirección de entrega                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Puerto Montt, Av. Principal 123                                 │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  OC del Cliente (solo para ventas) - Número de OC que el cliente      │  │
│  │  emitió a FSL                                                          │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Ej: OC-12345                                                     │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  Evento asociado (opcional) - Evento logístico/operativo relacionado  │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │ 🔍 Buscar evento...                                              │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  │  [+ Crear nuevo evento]                                                │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  PRODUCTOS                                                             │  │
│  │                                                                        │  │
│  │  Para operaciones de VENTA (unificadas):                              │  │
│  │  │ Tipo Pallet * │ Cant. * │ Precio Venta │ Precio Compra │ Margen │  │  │
│  │  ├───────────────┼─────────┼──────────────┼───────────────┼────────┤  │  │
│  │  │ [PV ▼]        │ [1000 ] │ [$13.500   ] │ [$10.000    ] │ $3.500 │  │  │
│  │  │ [PC ▼]        │ [200  ] │ [$18.000   ] │ [$14.000    ] │ $4.000 │  │  │
│  │  └───────────────┴─────────┴──────────────┴───────────────┴────────┘  │  │
│  │                                                                        │  │
│  │  Para operaciones de COMPRA:                                          │  │
│  │  │ Tipo Pallet * │ Cantidad * │ Precio Unit. │ Subtotal  │         │  │  │
│  │  ├───────────────┼────────────┼──────────────┼───────────┤         │  │  │
│  │  │ [PV ▼]        │ [500     ] │ [$10.000   ] │$5.000.000 │ [🗑]    │  │  │
│  │  └───────────────┴────────────┴──────────────┴───────────┘         │  │  │
│  │                                                                        │  │
│  │  [+ Agregar producto]                                                 │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │  RESUMEN FINANCIERO (solo para ventas)                          │  │  │
│  │  │  Total Venta:     $17.100.000                                    │  │  │
│  │  │  Total Compra:    $12.800.000                                    │  │  │
│  │  │  Margen Bruto:    $4.300.000  (25.1%)                            │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  OBSERVACIONES                                                         │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Notas adicionales sobre esta operación...                        │  │  │
│  │  │                                                                  │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                                      [Cancelar]  [Crear Operación]     │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Componentes:**

1. **Selector de Tipo (Radio Group visual)**
   - Cards grandes clickeables
   - Ícono + label
   - Selección visual clara

2. **Sección Información General**
   - Date picker para fecha
   - Combobox proveedor (con búsqueda)
   - Combobox cliente (con búsqueda)
   - Links para crear nuevo contacto inline
   - Input dirección de entrega
   - Input OC referencia

3. **Tabla de Productos**
   - Select tipo pallet
   - Input cantidad (numérico)
   - Input precio (currency)
   - Cálculo automático subtotal
   - Botón eliminar línea
   - Botón agregar línea
   - Total calculado

4. **Textarea Observaciones**
   - Opcional, multilinea

5. **Acciones**
   - Cancelar (vuelve a lista)
   - Crear (submit con validación)

**Validaciones:**
- Tipo requerido
- Fecha requerida
- Proveedor requerido si COMPRA o VENTA_* (obligatorio en operaciones unificadas)
- Cliente requerido si VENTA_*
- OC del Cliente: opcional pero recomendado para operaciones de venta
- Al menos 1 producto
- Cantidad > 0
- Para VENTA_*: precio_venta_unitario y precio_compra_unitario requeridos
- Para VENTA_*: precio_venta_unitario >= precio_compra_unitario (margen no negativo)
- Para COMPRA: precio_unitario requerido

---

### 3.5 Detalle de Operación (`/operaciones/[id]`)

**Propósito:** Vista completa de una operación con todas sus relaciones

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Operaciones               OP-2026-00130                    [✏️ Editar]    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │  VENTA DIRECTA                          Fecha: 12/01/2026        │  │  │
│  │  │  ────────────────────────────────────────────────────────────────│  │  │
│  │  │  Cliente: Cermaq Chile S.A. (76.123.456-7)                       │  │  │
│  │  │  Proveedor: Forestal Andes Ltda. (77.442.030-4)                  │  │  │
│  │  │  Dirección: Puerto Montt, Av. Principal 123                      │  │  │
│  │  │  OC Cliente: OC-36                                               │  │  │
│  │  │  OC Generada: OC-2026-00015 [📄 Ver PDF]                        │  │  │
│  │  │  Evento: EV-2026-00005 - Entrega Puerto Montt [Ver →]          │  │  │
│  │  │                                                                  │  │  │
│  │  │  ┌───────────────┐    ┌───────────────┐                          │  │  │
│  │  │  │ 🔴 Docs: 2/3  │    │ 🟡 Facturada  │                          │  │  │
│  │  │  │  INCOMPLETA   │    │               │                          │  │  │
│  │  │  └───────────────┘    └───────────────┘                          │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  PRODUCTOS                                                             │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Producto      │ Cant. │ Recibido │ Dañados │ Precio Venta │ Precio Compra │ Margen │  │  │
│  │  ├───────────────┼───────┼──────────┼─────────┼─────────────┼──────────────┼────────┤  │  │
│  │  │ Pallet Verde  │ 1000  │ 990 ✓    │ 10 ⚠️   │ $13.500     │ $10.000     │ $3.500 │  │  │
│  │  │ Pallet Certif.│ 200   │ 200 ✓    │ 0       │ $18.000     │ $14.000     │ $4.000 │  │  │
│  │  └───────────────┴───────┴──────────┴─────────┴─────────────┴──────────────┴────────┘  │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │  RESUMEN FINANCIERO                                              │  │  │
│  │  │  ────────────────────────────────────────────────────────────────│  │  │
│  │  │  Total Venta:     $17.100.000                                    │  │  │
│  │  │  Total Compra:    $12.800.000                                    │  │  │
│  │  │  Margen Bruto:    $4.300.000  (25.1%)                            │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  [📄 Documentos]  [💰 Pagos]  [🏦 Factoring]  [📦 Evento]              │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                        │  │
│  │  📄 DOCUMENTOS (2/3)                               [+ Adjuntar]        │  │
│  │  ────────────────────────────────────────────────────────────────────  │  │
│  │                                                                        │  │
│  │  ✅ Guía de Despacho                                                   │  │
│  │     N° 95519 • 12/01/2026 • Chofer: Joel Manque • JHZW23               │  │
│  │     [👁 Ver] [🗑 Eliminar]                                              │  │
│  │                                                                        │  │
│  │  ✅ Factura                                                            │  │
│  │     N° F-00234 • 12/01/2026                                            │  │
│  │     [👁 Ver] [🗑 Eliminar]                                              │  │
│  │                                                                        │  │
│  │  ❌ Certificado NIMF-15  ← ¡FALTANTE!                                  │  │
│  │     Requerido para Pallet Certificado                                  │  │
│  │     [📤 Subir ahora]                                                   │  │
│  │                                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  💬 OBSERVACIONES                                                      │  │
│  │  Entregar antes de las 14:00. Contactar a Juan Pérez en planta.       │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                         [🔒 Cerrar Operación]                          │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Componentes:**

1. **Header con Info General**
   - Tipo (badge color)
   - Fecha
   - Contacto principal (link)
   - Dirección
   - OC referencia
   - Estados visuales (2 badges grandes)

2. **Tabla de Productos**
   - Readonly (editar va a otra vista)
   - Muestra entregado vs cantidad
   - Totales calculados

3. **Tabs de Contenido**
   - Documentos (default activo)
   - Pagos
   - Factoring (solo si es venta)

4. **Tab Documentos**
   - Lista de documentos subidos
   - Indicadores ✅/❌ de presencia
   - Documentos faltantes resaltados
   - Botones ver/eliminar
   - Botón subir para faltantes
   - Metadata (número, fecha, transporte)

5. **Tab Pagos**
   - Lista de pagos registrados
   - Total pagado vs total operación
   - Botón agregar pago

6. **Tab Factoring**
   - Info de factoring si existe
   - Botón registrar si no existe

7. **Tab Evento** (solo si operación tiene evento asociado)
   - Información del evento (tipo, fechas, ubicación, estado)
   - Lista de entregas asociadas al evento
   - Botón agregar entrega
   - Detalles de cada entrega (empresa, cantidad, estado)
   - Link a detalle completo del evento

8. **Observaciones**
   - Texto readonly

9. **Acción Cerrar**
   - Botón prominente
   - Solo visible si operación no está cerrada
   - Abre modal de cierre

---

### 3.6 Modal: Subir Documento

```
┌────────────────────────────────────────────────────────────────────┐
│  Adjuntar Documento                                         [✕]    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Tipo de Documento *                                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ [Seleccionar tipo...                                     ▼]  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  │     📁                                                       │  │
│  │     Arrastra un archivo aquí                                 │  │
│  │     o                                                        │  │
│  │     [Seleccionar archivo]                                    │  │
│  │                                                              │  │
│  │     PDF, JPG, PNG • Máximo 10 MB                             │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ── Datos del documento (opcional) ──────────────────────────────  │
│                                                                    │
│  Número/Folio               Fecha del documento                    │
│  ┌────────────────────┐     ┌────────────────────┐                 │
│  │ 95519              │     │ 📅 12/01/2026      │                 │
│  └────────────────────┘     └────────────────────┘                 │
│                                                                    │
│  ── Datos de transporte (solo guías) ────────────────────────────  │
│                                                                    │
│  Chofer                     RUT                   Patente          │
│  ┌────────────────────┐     ┌──────────────┐      ┌─────────────┐  │
│  │ Joel Manque        │     │ 12.345.678-9 │      │ JHZW23      │  │
│  └────────────────────┘     └──────────────┘      └─────────────┘  │
│                                                                    │
│  Cant. Declarada            Cant. Dañada                           │
│  ┌────────────────────┐     ┌────────────────────┐                 │
│  │ 1000               │     │ 10                 │                 │
│  └────────────────────┘     └────────────────────┘                 │
│                                                                    │
│  Transportista                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Transportes Curacalco                                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  Observaciones                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                               [Cancelar]  [Subir Documento]        │
└────────────────────────────────────────────────────────────────────┘
```

**Comportamiento:**
- Select tipo documento (GUIA_DESPACHO, FACTURA, etc.)
- Dropzone para archivo
- Preview del archivo seleccionado
- Campos adicionales se muestran según tipo
- Campos de transporte solo si tipo es GUIA_*
- Validación de tipo y tamaño de archivo
- Progress bar durante upload

---

### 3.7 Modal: Registrar Pago

```
┌────────────────────────────────────────────────────────────────────┐
│  Registrar Pago                                             [✕]   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Tipo de Pago *                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ◉ Cobro a Cliente                                            │  │
│  │ ○ Pago de Flete                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  Monto *                        Fecha del pago *                   │
│  ┌────────────────────────┐     ┌────────────────────────┐         │
│  │ $ 6.750.000            │     │ 📅 12/01/2026          │         │
│  └────────────────────────┘     └────────────────────────┘         │
│                                                                    │
│  Método de pago                 Banco                              │
│  ┌────────────────────────┐     ┌────────────────────────┐         │
│  │ [Transferencia    ▼]   │     │ Banco Estado           │         │
│  └────────────────────────┘     └────────────────────────┘         │
│                                                                    │
│  N° Referencia (transferencia, cheque, etc.)                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ TRF-123456789                                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  Observaciones                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                 [Cancelar]  [Registrar Pago]       │
└────────────────────────────────────────────────────────────────────┘
```

---

### 3.8 Modal: Cerrar Operación

```
┌────────────────────────────────────────────────────────────────────┐
│  🔒 Cerrar Operación                                        [✕]   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ⚠️ Esta acción es irreversible                                    │
│                                                                    │
│  Una vez cerrada, la operación no podrá ser editada.              │
│  Se bloquearán:                                                    │
│  • Agregar/eliminar documentos                                     │
│  • Agregar/eliminar pagos                                          │
│  • Modificar datos de la operación                                 │
│                                                                    │
│  ────────────────────────────────────────────────────────────────  │
│                                                                    │
│  Observación de Cierre *                                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Ej: Operación completada satisfactoriamente. Cliente        │  │
│  │ confirmó recepción de mercadería.                           │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  Este campo es obligatorio para cerrar la operación.               │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                           [Cancelar]  [🔒 Cerrar Definitivamente]  │
└────────────────────────────────────────────────────────────────────┘
```

---

### 3.9 Lista de Contactos (`/contactos`)

**Propósito:** Gestionar proveedores y clientes

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Contactos                                                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────┬───────────────────────────────┐           │
│  │       [Proveedores (12)]      │        [Clientes (28)]        │           │
│  └───────────────────────────────┴───────────────────────────────┘           │
│                                                                              │
│  🔍 [Buscar por nombre o RUT...]                     [+ Nuevo Proveedor]     │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Forestal Andes Ltda.                             🟢 Activo      │  │  │
│  │  │  RUT: 77.442.030-4                                               │  │  │
│  │  │  📍 Freire, Temuco • 📞 45-2378200                               │  │  │
│  │  │  📧 administracion@forestalandes.cl                              │  │  │
│  │  │  ────────────────────────────────────────────────────────────    │  │  │
│  │  │  15 operaciones (última: hace 2 días)       [Editar] [Ver →]     │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Proveedor XYZ S.A.                               🟢 Activo      │  │  │
│  │  │  RUT: 76.xxx.xxx-x                                               │  │  │
│  │  │  📍 Santiago • 📞 2-12345678                                     │  │  │
│  │  │  ────────────────────────────────────────────────────────────    │  │  │
│  │  │  3 operaciones (última: hace 1 mes)         [Editar] [Ver →]     │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Componentes:**

1. **Tabs Proveedor/Cliente**
   - Contador en cada tab
   - Cambia lista y botón "Nuevo"

2. **Barra de búsqueda**
   - Búsqueda por nombre o RUT
   - Filtro inline

3. **Cards de Contacto**
   - Nombre y badge activo/inactivo
   - RUT
   - Datos de contacto
   - Contador de operaciones
   - Acciones: Editar, Ver historial

---

### 3.10 Formulario Contacto (`/contactos/[tipo]/nuevo`)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Contactos                             Nuevo Proveedor                     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  DATOS PRINCIPALES                                                     │  │
│  │                                                                        │  │
│  │  RUT *                             Razón Social *                      │  │
│  │  ┌─────────────────────────┐       ┌─────────────────────────────────┐ │  │
│  │  │ 77.442.030-4            │       │ FORESTAL ANDES LIMITADA         │ │  │
│  │  └─────────────────────────┘       └─────────────────────────────────┘ │  │
│  │  ✓ RUT válido                                                          │  │
│  │                                                                        │  │
│  │  Nombre Fantasía                                                       │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Forestal Andes                                                   │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  UBICACIÓN                                                             │  │
│  │                                                                        │  │
│  │  Dirección                                                             │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Camino Freire a Barros Arana KM.2                                │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  Comuna                            Ciudad                              │  │
│  │  ┌─────────────────────────┐       ┌─────────────────────────────────┐ │  │
│  │  │ Freire                  │       │ Temuco                          │ │  │
│  │  └─────────────────────────┘       └─────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  CONTACTO                                                              │  │
│  │                                                                        │  │
│  │  Teléfono                          Email                               │  │
│  │  ┌─────────────────────────┐       ┌─────────────────────────────────┐ │  │
│  │  │ 45-2378200              │       │ administracion@forestal...      │ │  │
│  │  └─────────────────────────┘       └─────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                                         [Cancelar]  [Guardar]          │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Validaciones:**
- RUT: formato válido (se almacena sin puntos, solo con guión, ej: `77442030-4`), dígito verificador, único. En la UI se puede mostrar con puntos para legibilidad: `77.442.030-4`
- Razón social: requerido
- Email: formato válido (si se ingresa)

---

### 3.11 Lista de Empresas (`/empresas`)

**Propósito:** Gestionar empresas (proveedores, clientes, transportistas, etc.)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Empresas                                              [+ Nueva Empresa]     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  🔍 Buscar: [Nombre o RUT...]     Tipo: [Todos ▼]                        │  │
│  │                                                                        │  │
│  │  Estado: [Todos ▼]                                    [🔄 Limpiar]     │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  Mostrando 25 empresas                                                 │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Forestal Andes Ltda.                        🟢 Activa            │  │  │
│  │  │  RUT: 77.442.030-4 • Tipo: PROVEEDOR                             │  │  │
│  │  │  📍 Freire, Temuco • 📞 45-2378200                               │  │  │
│  │  │  📧 administracion@forestalandes.cl                                │  │  │
│  │  │  ────────────────────────────────────────────────────────────    │  │  │
│  │  │  15 operaciones asociadas                    [Editar] [Ver →]      │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Componentes:**
1. **Barra de Filtros**
   - Input búsqueda por nombre o RUT
   - Select tipo empresa (PROVEEDOR, CLIENTE, TRANSPORTISTA, OTRO)
   - Select estado (ACTIVA, INACTIVA)
   - Botón limpiar filtros

2. **Lista de Empresas (Cards)**
   - Card por empresa con:
     - Nombre y badge de estado
     - RUT y tipo de empresa
     - Datos de contacto
     - Contador de operaciones asociadas
     - Acciones: Editar, Ver detalle

---

### 3.12 Formulario Empresa (`/empresas/nueva` o `/empresas/[id]`)

**Propósito:** Crear o editar empresa

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Empresas                              Nueva Empresa                       │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  DATOS PRINCIPALES                                                     │  │
│  │                                                                        │  │
│  │  RUT *                             Nombre *                            │  │
│  │  ┌─────────────────────────┐       ┌─────────────────────────────────┐ │  │
│  │  │ 77.442.030-4            │       │ FORESTAL ANDES LIMITADA         │ │  │
│  │  └─────────────────────────┘       └─────────────────────────────────┘ │  │
│  │  ✓ RUT válido                                                          │  │
│  │                                                                        │  │
│  │  Tipo de Empresa *                                                     │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │ [PROVEEDOR ▼]                                                    │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  Estado *                                                              │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │ ◉ Activa    ○ Inactiva                                          │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  CONTACTO                                                              │  │
│  │                                                                        │  │
│  │  Contacto Principal                    Teléfono                        │  │
│  │  ┌─────────────────────────┐       ┌─────────────────────────────────┐ │  │
│  │  │ Juan Pérez              │       │ 45-2378200                       │ │  │
│  │  └─────────────────────────┘       └─────────────────────────────────┘ │  │
│  │                                                                        │  │
│  │  Email                                                                │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │ administracion@forestalandes.cl                                  │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  UBICACIÓN                                                             │  │
│  │                                                                        │  │
│  │  Dirección                                                             │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Camino Freire a Barros Arana KM.2                                │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                                         [Cancelar]  [Guardar]          │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Validaciones:**
- RUT: formato válido, único
- Nombre: requerido
- Tipo de empresa: requerido
- Estado: requerido
- Email: formato válido (si se ingresa)

---

### 3.13 Lista de Eventos (`/eventos`)

**Propósito:** Ver, buscar y filtrar eventos logísticos/operativos

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Eventos                                               [+ Nuevo Evento]      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  🔍 Buscar: [EV-2026-00...]     Tipo: [Todos ▼]                        │  │
│  │                                                                        │  │
│  │  Estado: [Todos ▼]   Desde: [__/__/__]   Hasta: [__/__/__]            │  │
│  │                                                                        │  │
│  │  Operación: [Buscar operación...]                    [🔄 Limpiar]     │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  Mostrando 12 eventos                                                 │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │  EV-2026-00005         ENTREGA        12/01/2026 - 15/01/2026   │  │  │
│  │  │  Ubicación: Puerto Montt, Av. Principal 123                      │  │  │
│  │  │  Operación: OP-2026-00130                                        │  │  │
│  │  │  3 entregas registradas                                           │  │  │
│  │  │  ┌──────────────┐                                    [Ver →]      │  │  │
│  │  │  │ 🟡 EN_CURSO  │                                                 │  │  │
│  │  │  └──────────────┘                                                 │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Componentes:**
1. **Barra de Filtros**
   - Input búsqueda por número
   - Select tipo evento (ENTREGA, RECEPCION, TRASLADO, OTRO)
   - Select estado (PLANIFICADO, EN_CURSO, COMPLETADO, CANCELADO)
   - Date picker rango
   - Combobox operación asociada
   - Botón limpiar

2. **Lista de Eventos (Cards)**
   - Card por evento con:
     - Número y tipo
     - Rango de fechas
     - Ubicación
     - Operación asociada (si aplica)
     - Contador de entregas
     - Badge de estado
     - Botón "Ver"

---

### 3.14 Crear/Editar Evento (`/eventos/nueva` o `/eventos/[id]`)

**Propósito:** Formulario para crear o editar evento

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Eventos                              Nuevo Evento                         │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  INFORMACIÓN GENERAL                                                   │  │
│  │                                                                        │  │
│  │  Tipo de Evento *                    Fecha Inicio *                   │  │
│  │  ┌─────────────────────────┐       ┌───────────────────┐               │  │
│  │  │ [ENTREGA ▼]              │       │ 📅 12/01/2026     │               │  │
│  │  └─────────────────────────┘       └───────────────────┘               │  │
│  │                                                                        │  │
│  │  Fecha Fin (opcional)                 Ubicación                         │  │
│  │  ┌───────────────────┐             ┌───────────────────────────────┐   │  │
│  │  │ 📅 15/01/2026     │             │ Puerto Montt, Av. Principal 123 │   │  │
│  │  └───────────────────┘             └───────────────────────────────┘   │  │
│  │                                                                        │  │
│  │  Estado *                                                               │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │ [PLANIFICADO ▼]                                                   │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  Asociar a Operación (opcional)                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │ 🔍 Buscar operación...                                           │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  Descripción                                                           │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Evento de entrega de pallets en Puerto Montt...                  │  │  │
│  │  │                                                                  │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                    [Cancelar]  [Guardar]                               │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Validaciones:**
- Tipo: requerido
- Fecha inicio: requerida
- Fecha fin: debe ser >= fecha inicio (si se ingresa)
- Estado: requerido

---

### 3.15 Detalle de Evento (`/eventos/[id]`)

**Propósito:** Vista completa de un evento con sus entregas

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Eventos               EV-2026-00005                      [✏️ Editar]    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │  EVENTO ENTREGA                          Fecha: 12/01 - 15/01/2026│  │  │
│  │  │  ────────────────────────────────────────────────────────────────│  │  │
│  │  │  Ubicación: Puerto Montt, Av. Principal 123                      │  │  │
│  │  │  Operación: OP-2026-00130 [Ver →]                                │  │  │
│  │  │                                                                  │  │  │
│  │  │  ┌───────────────┐                                                │  │  │
│  │  │  │ 🟡 EN_CURSO   │                                                │  │  │
│  │  │  └───────────────┘                                                │  │  │
│  │  │                                                                  │  │  │
│  │  │  Descripción: Evento de entrega de pallets en Puerto Montt...  │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  ENTREGAS (3)                                        [+ Nueva Entrega]  │  │
│  │  ────────────────────────────────────────────────────────────────────  │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Entrega #1                                                       │  │  │
│  │  │  Empresa: Forestal Andes Ltda.                                     │  │  │
│  │  │  Receptora: Cermaq Chile S.A.                                     │  │  │
│  │  │  Fecha/Hora: 12/01/2026 14:30                                     │  │  │
│  │  │  Tipo: COMPLETA • Cantidad: 500 pallets                           │  │  │
│  │  │  ┌──────────────┐                                    [Ver →]      │  │  │
│  │  │  │ 🟢 COMPLETADA│                                                 │  │  │
│  │  │  └──────────────┘                                                 │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  [... más entregas ...]                                                │  │
│  │                                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Componentes:**
1. **Header con Info General**
   - Tipo y número de evento
   - Rango de fechas
   - Ubicación
   - Operación asociada (link)
   - Badge de estado
   - Descripción

2. **Lista de Entregas**
   - Card por entrega con:
     - Empresa que realiza la entrega
     - Empresa receptora (si aplica)
     - Fecha y hora
     - Tipo y cantidad
     - Badge de estado
     - Botón "Ver" o "Editar"

3. **Acciones**
   - Agregar nueva entrega
   - Editar evento

---

### 3.16 Modal: Nueva Entrega

```
┌────────────────────────────────────────────────────────────────────┐
│  Nueva Entrega                                             [✕]   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Empresa que realiza la entrega *                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🔍 Buscar empresa...                                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  Empresa receptora (opcional)                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🔍 Buscar empresa...                                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  Fecha y Hora *                    Tipo de Entrega *              │
│  ┌────────────────────────┐       ┌────────────────────────┐     │
│  │ 📅 12/01/2026 14:30    │       │ [COMPLETA ▼]           │     │
│  └────────────────────────┘       └────────────────────────┘     │
│                                                                    │
│  Cantidad *                        Unidad *                       │
│  ┌────────────────────────┐       ┌────────────────────────┐     │
│  │ 500                     │       │ [pallets ▼]            │     │
│  └────────────────────────┘       └────────────────────────┘     │
│                                                                    │
│  Estado *                                                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ [PENDIENTE ▼]                                                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  Descripción                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  Observaciones                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                           [Cancelar]  [Guardar]                    │
└────────────────────────────────────────────────────────────────────┘
```

**Validaciones:**
- Empresa que realiza: requerida
- Fecha y hora: requerida
- Tipo de entrega: requerido
- Cantidad: requerida, > 0
- Unidad: requerida
- Estado: requerido

---

### 3.17 Reportes (`/reportes`)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Reportes                                                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                        │  │
│  │  ┌───────────────────────────────┐  ┌───────────────────────────────┐  │  │
│  │  │  📊                           │  │  ⚠️                            │  │  │
│  │  │  Operaciones                  │  │  Pendientes                    │  │  │
│  │  │  por Período                  │  │                                │  │  │
│  │  │                               │  │  Documentos y pagos            │  │  │
│  │  │  Compras y ventas             │  │  que faltan                    │  │  │
│  │  │  filtradas por fecha          │  │                                │  │  │
│  │  │                               │  │                                │  │  │
│  │  │  [Generar →]                  │  │  [Generar →]                   │  │  │
│  │  └───────────────────────────────┘  └───────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  ┌───────────────────────────────┐  ┌───────────────────────────────┐  │  │
│  │  │  👤                           │  │  📥                            │  │  │
│  │  │  Historial                    │  │  Exportar                      │  │  │
│  │  │  por Contacto                 │  │  Datos                         │  │  │
│  │  │                               │  │                                │  │  │
│  │  │  Operaciones con un           │  │  Descargar operaciones         │  │  │
│  │  │  proveedor o cliente          │  │  en Excel/CSV                  │  │  │
│  │  │                               │  │                                │  │  │
│  │  │  [Generar →]                  │  │  [Exportar →]                  │  │  │
│  │  └───────────────────────────────┘  └───────────────────────────────┘  │  │
│  │                                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### 3.18 Lista de Órdenes de Compra (`/ordenes-compra`)

**Propósito:** Ver, buscar y filtrar todas las órdenes de compra generadas

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Órdenes de Compra                                      [+ Nueva OC]         │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  🔍 Buscar: [OC-2026-00...]     Proveedor: [Todos ▼]                  │  │
│  │                                                                        │  │
│  │  Estado: [Todos ▼]   Desde: [__/__/__]   Hasta: [__/__/__]            │  │
│  │                                                                        │  │
│  │  [🔄 Limpiar]                                                          │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  Mostrando 12 órdenes de compra                                        │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │  OC-2026-00015         Forestal Andes        12/01/2026          │  │  │
│  │  │  1000 Pallet Verde • $13.500.000                                  │  │  │
│  │  │  ┌──────────────┐                                    [Ver →]      │  │  │
│  │  │  │ 🟡 ENVIADA   │                                    [📄 PDF]     │  │  │
│  │  │  └──────────────┘                                                 │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │  OC-2026-00014         Proveedor XYZ        11/01/2026           │  │  │
│  │  │  500 Pallet Certificado • $9.000.000                             │  │  │
│  │  │  ┌──────────────┐                                    [Ver →]      │  │  │
│  │  │  │ 🟢 RECIBIDA  │                                    [📄 PDF]     │  │  │
│  │  │  └──────────────┘                                                 │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │  ◀ Anterior    Página 1 de 2    Siguiente ▶         [10 ▼] por página  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Componentes:**
1. **Barra de Filtros**
   - Input búsqueda por número
   - Select proveedor
   - Select estado
   - Date picker rango
   - Botón limpiar

2. **Lista de OC (Cards)**
   - Card por OC con:
     - Número y fecha
     - Proveedor
     - Resumen de productos
     - Badge de estado
     - Botones "Ver" y "PDF"

---

### 3.19 Crear Orden de Compra (`/ordenes-compra/nueva`)

**Propósito:** Formulario para crear nueva orden de compra

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Volver                            Nueva Orden de Compra                   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  INFORMACIÓN GENERAL                                                   │  │
│  │                                                                        │  │
│  │  Proveedor *                    Fecha *                               │  │
│  │  ┌─────────────────────────┐   ┌───────────────────┐                   │  │
│  │  │ 🔍 Buscar proveedor...  │   │ 📅 12/01/2026     │                   │  │
│  │  └─────────────────────────┘   └───────────────────┘                   │  │
│  │  [+ Crear nuevo proveedor]                                             │  │
│  │                                                                        │  │
│  │  Fecha Entrega Esperada         Dirección de entrega                   │  │
│  │  ┌───────────────────┐         ┌───────────────────────────────────┐   │  │
│  │  │ 📅 20/01/2026     │         │ Puerto Montt, Av. Principal 123   │   │  │
│  │  └───────────────────┘         └───────────────────────────────────┘   │  │
│  │                                                                        │  │
│  │  Asociar a Operación (opcional)                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │ 🔍 Buscar operación...                                           │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  PRODUCTOS                                                             │  │
│  │                                                                        │  │
│  │  │ Tipo Pallet *      │ Cantidad * │ Precio Unit. │ Subtotal  │       │  │
│  │  ├────────────────────┼────────────┼──────────────┼───────────┤       │  │
│  │  │ [Pallet Verde ▼]   │ [1000    ] │ [$13.500   ] │$13.500.000│ [🗑]  │  │
│  │  │ [Pallet Certif. ▼] │ [200     ] │ [$18.000   ] │$3.600.000 │ [🗑]  │  │
│  │  └────────────────────┴────────────┴──────────────┴───────────┘       │  │
│  │                                                                        │  │
│  │  [+ Agregar producto]                           Total: $17.100.000     │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  OBSERVACIONES                                                         │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Notas adicionales sobre esta orden de compra...                │  │  │
│  │  │                                                                  │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                    [Cancelar]  [Guardar Borrador]  [Generar PDF]      │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Comportamiento:**
- Al presionar "Guardar Borrador": Guarda sin generar PDF, estado BORRADOR
- Al presionar "Generar PDF": Valida, genera número secuencial, crea PDF, estado ENVIADA
- El PDF se genera automáticamente y se puede descargar inmediatamente

---

### 3.20 Detalle de Orden de Compra (`/ordenes-compra/[id]`)

**Propósito:** Vista completa de una orden de compra con opción de descargar PDF

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Órdenes de Compra         OC-2026-00015              [✏️ Editar] [🗑]    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │  ORDEN DE COMPRA OC-2026-00015        Fecha: 12/01/2026         │  │  │
│  │  │  ────────────────────────────────────────────────────────────────│  │  │
│  │  │  Proveedor: Forestal Andes Ltda. (77.442.030-4)                 │  │  │
│  │  │  Fecha Entrega: 20/01/2026                                       │  │  │
│  │  │  Dirección: Puerto Montt, Av. Principal 123                     │  │  │
│  │  │                                                                  │  │  │
│  │  │  ┌───────────────┐                                                │  │  │
│  │  │  │ 🟡 ENVIADA   │                                                │  │  │
│  │  │  └───────────────┘                                                │  │  │
│  │  └──────────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  PRODUCTOS                                                             │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Producto            │ Cantidad │ Precio Unit. │ Subtotal  │     │  │  │
│  │  ├─────────────────────┼──────────┼──────────────┼───────────┤     │  │  │
│  │  │ Pallet Verde        │ 1000     │ $13.500      │ $13.5M    │     │  │  │
│  │  │ Pallet Certificado  │ 200      │ $18.000      │ $3.6M     │     │  │  │
│  │  ├─────────────────────┴──────────┴──────────────┼───────────┤     │  │  │
│  │  │                                       TOTAL   │ $17.1M    │     │  │  │
│  │  └───────────────────────────────────────────────────────┴───────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  💬 OBSERVACIONES                                                      │  │
│  │  Entregar antes de las 14:00. Contactar a Juan Pérez en planta.       │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  📄 PDF GENERADO                                                       │  │
│  │  ────────────────────────────────────────────────────────────────────  │  │
│  │  ✅ PDF generado el 12/01/2026 a las 10:30                            │  │
│  │  [📥 Descargar PDF]                                                    │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  ACCIONES                                                               │  │
│  │  [🔄 Marcar como Recibida]  [❌ Cancelar OC]                            │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Componentes:**
1. **Header con Info General**
   - Número de OC
   - Proveedor (link)
   - Fechas
   - Dirección
   - Badge de estado

2. **Tabla de Productos**
   - Readonly (editar va a otra vista)
   - Totales calculados

3. **Sección PDF**
   - Indicador de PDF generado
   - Botón descargar PDF
   - Fecha de generación

4. **Acciones**
   - Cambiar estado
   - Cancelar (solo si no está recibida)

---

## 4. Componentes Reutilizables

### 4.1 Catálogo de Componentes

| Componente | Uso | Variantes |
|------------|-----|-----------|
| `<OperacionCard>` | Lista y dashboard | compact, expanded |
| `<OrdenCompraCard>` | Lista de OC | compact, expanded |
| `<EstadoBadge>` | Estados visuales | documental, financiero, OC |
| `<ContactoCombobox>` | Selector de contacto | proveedor, cliente |
| `<DocumentoItem>` | Lista de documentos | presente, faltante |
| `<PagoItem>` | Lista de pagos | - |
| `<ProductoRow>` | Tabla de productos | editable, readonly |
| `<DropzoneUpload>` | Subida de archivos | - |
| `<RutInput>` | Input con validación RUT | - |
| `<CurrencyInput>` | Input de moneda | - |
| `<DatePicker>` | Selector de fecha | single, range |
| `<EmptyState>` | Estados vacíos | varios íconos |
| `<ConfirmModal>` | Confirmaciones | warning, danger |
| `<StatsCard>` | Métricas numéricas | - |
| `<Timeline>` | Actividad reciente | - |
| `<PDFViewer>` | Visualizador de PDF | - |
| `<PDFGenerator>` | Generador de PDF | OC, facturas |

### 4.2 EstadoBadge

```
Estado Documental:
┌─────────────┐   ┌─────────────┐
│ 🔴 2/3 Docs │   │ 🟢 3/3 Docs │
│ INCOMPLETA  │   │  COMPLETA   │
└─────────────┘   └─────────────┘

Estado Financiero:
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ ⚪ Pendiente│   │ 🟡 Facturada│   │ 🟢 Pagada   │   │ ✅ Cerrada  │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

### 4.3 Tipo Badge (Operación)

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ 📦 COMPRA   │   │ 💰 VENTA    │   │ 🤝 COMISIÓN │
│   (azul)    │   │   (verde)   │   │  (morado)   │
└─────────────┘   └─────────────┘   └─────────────┘
```

### 4.4 Estado Badge (Orden de Compra)

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ ⚪ BORRADOR │   │ 🟡 ENVIADA  │   │ 🟢 RECIBIDA │   │ 🔴 CANCELADA│
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

### 4.5 Estado Badge (Evento)

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ ⚪ PLANIFICADO│ │ 🟡 EN_CURSO │   │ 🟢 COMPLETADO│   │ 🔴 CANCELADO│
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

### 4.6 Estado Badge (Entrega)

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ ⚪ PENDIENTE│   │ 🟡 EN_TRANSITO│ │ 🟢 COMPLETADA│   │ 🔴 RECHAZADA│
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

### 4.7 Tipo Badge (Empresa)

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ 📦 PROVEEDOR│   │ 💰 CLIENTE  │   │ 🚚 TRANSPORTISTA│ │ ⚙️ OTRO    │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

---

## 5. Flujos de Usuario

### 5.1 Flujo: Crear Operación Completa

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Dashboard  │────►│   Nueva     │────►│  Detalle    │────►│   Subir     │
│  Click      │     │  Operación  │     │  Operación  │     │  Documento  │
│  "Nueva"    │     │  (Form)     │     │  (Ver)      │     │  (Modal)    │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                    │
┌─────────────┐     ┌─────────────┐     ┌─────────────┐             │
│  Operación  │◄────│  Registrar  │◄────│  Tab Pagos  │◄────────────┘
│  Cerrada    │     │  Pago       │     │  Click +    │
│  (Final)    │     │  (Modal)    │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 5.2 Flujo: Resolver Pendiente desde Dashboard

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Dashboard  │────►│  Detalle    │────►│   Modal     │────►│  Dashboard  │
│  Ver alerta │     │  Operación  │     │   Subir Doc │     │  Alerta     │
│  "Falta X"  │     │  Tab Docs   │     │   o Pago    │     │  resuelta   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### 5.3 Flujo: Buscar Operación

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Navbar     │────►│   Lista     │────►│  Detalle    │
│  Click      │     │  Filtrar/   │     │  Operación  │
│  Operaciones│     │  Buscar     │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## 6. Estados de Carga y Error

### 6.1 Loading States

```
Lista cargando:            Card cargando:
┌────────────────────┐     ┌────────────────────┐
│ ░░░░░░░░░░░░░░░░░░ │     │ ▓▓▓▓▓▓▓▓▓▓▓▓       │
│ ░░░░░░░░░░░░░░░░░░ │     │ ░░░░░░░░░░░░       │
│ ░░░░░░░░░░░░░░░░░░ │     │ ░░░░░░░░░░░░       │
└────────────────────┘     └────────────────────┘
 (Skeleton con shimmer)     (Skeleton en card)
```

### 6.2 Empty States

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│                         📭                            │
│                                                       │
│            No hay operaciones aún                     │
│                                                       │
│     Crea tu primera operación para comenzar           │
│                                                       │
│               [+ Nueva Operación]                     │
│                                                       │
└───────────────────────────────────────────────────────┘
```

### 6.3 Error States

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│                         ⚠️                            │
│                                                       │
│            Error al cargar operaciones                │
│                                                       │
│     No pudimos conectar con el servidor.              │
│     Verifica tu conexión e intenta nuevamente.        │
│                                                       │
│                   [Reintentar]                        │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## 7. Responsive Breakpoints

| Breakpoint | Ancho | Comportamiento |
|------------|-------|----------------|
| Mobile | < 640px | Stack vertical, nav hamburger |
| Tablet | 640-1024px | 2 columnas en dashboard |
| Desktop | > 1024px | Layout completo |

**Nota:** El diseño es **desktop-first** según requisitos del cliente. Mobile es funcional pero no prioritario.

---

## 8. Accesibilidad

- Todos los inputs con `label` asociado
- Colores con contraste WCAG AA
- Navegación por teclado en modales
- Focus visible en elementos interactivos
- Mensajes de error anunciados a screen readers
- Botones con texto descriptivo (no solo íconos)

---

## 9. Notificaciones (Toast)

```
Éxito:                     Error:                     Info:
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ ✅ Operación     │       │ ❌ Error al      │       │ ℹ️ Documento     │
│    creada        │       │    guardar       │       │    subido        │
└──────────────────┘       └──────────────────┘       └──────────────────┘
 (Verde, 3 seg)             (Rojo, 5 seg)             (Azul, 3 seg)
```

---

## 10. Checklist de Implementación

### Fase 1: Core
- [ ] Layout principal (header, nav, content)
- [ ] Página de login
- [ ] Dashboard con pendientes
- [ ] Lista de operaciones con filtros
- [ ] Crear operación
- [ ] Detalle de operación
- [ ] Subir documento (modal)

### Fase 2: Completar Operaciones
- [ ] Registrar pago (modal)
- [ ] Cerrar operación (modal)
- [ ] Tab de pagos en detalle
- [ ] Tab de factoring en detalle

### Fase 3: Empresas, Eventos y Entregas
- [ ] Lista de empresas
- [ ] Crear/editar empresa
- [ ] Lista de eventos
- [ ] Crear/editar evento
- [ ] Gestión de entregas dentro de eventos
- [ ] Asociar evento a operaciones

### Fase 4: Contactos y Reportes
- [ ] Lista de contactos (tabs)
- [ ] Crear/editar contacto
- [ ] Reportes básicos
- [ ] Exportar a Excel

### Fase 5: Polish
- [ ] Loading states
- [ ] Empty states
- [ ] Error handling
- [ ] Responsive ajustes
- [ ] Accesibilidad audit

---

*Documento listo para desarrollo frontend*

