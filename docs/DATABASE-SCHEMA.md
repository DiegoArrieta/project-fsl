# Schema de Base de Datos - Forestal Santa Lucía

**Versión:** 1.6  
**Fecha:** 2026-01-27  
**Base de datos:** PostgreSQL 14+  
**ORM objetivo:** Prisma  
**Basado en:** SDD v3.3, API-SPEC v1.4, UI-SPEC v1.4  
**Autenticación:** Auth.js (NextAuth.js v5) con bcrypt (salt rounds: 10)  

**Cambios v1.6:**
- ✅ Agregada tabla `empresa` para representar organizaciones (proveedores, clientes, transportistas, etc.)
- ✅ Agregada tabla `evento` para representar eventos logísticos u operativos
- ✅ Agregada tabla `entrega` con relación a `evento` (1:N) y `empresa` (N:1)
- ✅ Las entregas ocurren dentro de eventos (`evento_id` obligatorio)
- ✅ Las entregas referencian empresas mediante `empresa_id` y opcionalmente `empresa_receptora_id`

**Cambios v1.5:**
- ✅ Una operación puede tener 1 o más proveedores (relación N:M)
- ✅ Tabla intermedia `operacion_proveedor` para relación muchos a muchos
- ✅ Eliminado campo `proveedor_id` de `operacion`  

---

## 1. Diagrama Entidad-Relación

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              MODELO DE DATOS v1.6                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   ┌──────────────┐                                    ┌──────────────┐              │
│   │   Usuario    │                                    │  TipoPallet  │              │
│   └──────────────┘                                    └──────┬───────┘              │
│                                                              │                      │
│   ┌──────────────┐         ┌──────────────────┐      ┌───────┴────────┐             │
│   │  Proveedor   │────┐    │  OperacionProveedor │    │ OperacionLinea │             │
│   │ (empresa_id) │    │    │  (tabla intermedia) │    └────────────────┘             │
│   └──────────────┘    │    │  - operacion_id    │◄───┘                               │
│                       └───►│  - proveedor_id    │                                    │
│   ┌──────────────┐    ┌───►└──────────────────┘                                    │
│   │   Cliente    │────┘                │                                            │
│   │ (empresa_id) │                     │                                            │
│   └──────────────┘                     │                                            │
│                                        │                                            │
│                          ┌─────────────┴────────┐                                   │
│                          │   Operacion          │                                   │
│                          ├──────────────────────┤                                   │
│                          │ - cliente_id         │                                   │
│                          └──────────┬───────────┘                                   │
│                                     │                                                │
│                                     │ (N:1)                                          │
│                                     ▼                                                │
│                          ┌──────────────────────┐                                  │
│                          │      Evento           │                                  │
│                          ├──────────────────────┤                                  │
│                          │ - tipo                │                                  │
│                          │ - fecha_inicio        │                                  │
│                          │ - estado              │                                  │
│                          └──────────┬────────────┘                                  │
│                                     │                                                │
│                                     │ (1:N)                                          │
│                                     ▼                                                │
│                          ┌──────────────────────┐                                  │
│                          │     Entrega           │                                  │
│                          ├──────────────────────┤                                  │
│                          │ - empresa_id         │                                  │
│                          │ - empresa_receptora_id│                                  │
│                          │ - cantidad           │                                  │
│                          │ - tipo_entrega        │                                  │
│                          └──────────┬────────────┘                                  │
│                                     │                                                │
│                                     │ (N:1)                                          │
│                                     ▼                                                │
│                          ┌──────────────────────┐                                  │
│                          │     Empresa          │                                  │
│                          ├──────────────────────┤                                  │
│                          │ - nombre             │                                  │
│                          │ - rut                │                                  │
│                          │ - tipo_empresa       │                                  │
│                          │ - estado             │                                  │
│                          └──────────────────────┘                                  │
│                                                                                     │
│              ┌────────────────────┼────────────────────┐                           │
│              │                    │                    │                           │
│              ▼                    ▼                    ▼                           │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                      │
│   │  Documento   │     │     Pago     │     │  Factoring   │                      │
│   └──────────────┘     └──────────────┘     └──────────────┘                      │
│                                                                                     │
│   ┌──────────────┐                                                                 │
│   │  Proveedor   │                                                                 │
│   │ (empresa_id) │                                                                 │
│   └──────┬───────┘                                                                 │
│          │ (N:1)                                                                   │
│          │                                                                         │
│          ▼                                                                         │
│   ┌──────────────────────┐                                                         │
│   │   OrdenCompra        │                                                         │
│   ├──────────────────────┤                                                         │
│   │ - numero (OC-YYYY-N) │                                                         │
│   │ - estado             │                                                         │
│   │ - pdf_generado       │                                                         │
│   └──────┬───────────────┘                                                         │
│          │ (1:N)                                                                   │
│          │                                                                         │
│          ▼                                                                         │
│   ┌──────────────────────┐                                                         │
│   │ OrdenCompraLinea     │                                                         │
│   └──────────────────────┘                                                         │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

RELACIONES:
  Proveedor    N ──────── M  Operacion (a través de OperacionProveedor)
  Cliente      1 ──────── N  Operacion (como cliente)
  Operacion    1 ──────── N  OperacionProveedor (tabla intermedia)
  Operacion    1 ──────── N  OperacionLinea
  Operacion    1 ──────── N  Documento
  Operacion    1 ──────── N  Pago
  Operacion    1 ──────── 1  Factoring (opcional)
  Operacion    1 ──────── N  OrdenCompra (opcional, asociación)
  Operacion    N ──────── 1  Evento (opcional, asociación)
  Evento       1 ──────── N  Entrega (las entregas ocurren dentro de eventos)
  Entrega      N ──────── 1  Empresa (empresa que realiza la entrega)
  Entrega      N ──────── 1  Empresa (empresa que recibe, opcional)
  TipoPallet   1 ──────── N  OperacionLinea
  Proveedor    1 ──────── N  OrdenCompra
  OrdenCompra  1 ──────── N  OrdenCompraLinea
  TipoPallet   1 ──────── N  OrdenCompraLinea
  Proveedor    N ──────── 1  Empresa (opcional, referencia a empresa)
  Cliente      N ──────── 1  Empresa (opcional, referencia a empresa)
```

---

## 2. Enumeraciones (Enums)

### Creación de ENUMs en PostgreSQL
```sql
-- Crear todos los ENUMs necesarios antes de crear las tablas
CREATE TYPE tipo_operacion AS ENUM ('COMPRA', 'VENTA_DIRECTA', 'VENTA_COMISION');
CREATE TYPE estado_documental AS ENUM ('INCOMPLETA', 'COMPLETA');
CREATE TYPE estado_financiero AS ENUM ('PENDIENTE', 'FACTURADA', 'PAGADA', 'CERRADA');
CREATE TYPE tipo_documento AS ENUM ('ORDEN_COMPRA', 'ORDEN_COMPRA_CLIENTE', 'GUIA_DESPACHO', 'GUIA_RECEPCION', 'FACTURA', 'CERTIFICADO_NIMF15', 'OTRO');
CREATE TYPE tipo_pago AS ENUM ('PAGO_PROVEEDOR', 'COBRO_CLIENTE', 'PAGO_FLETE', 'PAGO_COMISION');
CREATE TYPE estado_oc AS ENUM ('BORRADOR', 'ENVIADA', 'RECIBIDA', 'CANCELADA');
CREATE TYPE tipo_empresa AS ENUM ('PROVEEDOR', 'CLIENTE', 'TRANSPORTISTA', 'OTRO');
CREATE TYPE estado_empresa AS ENUM ('ACTIVA', 'INACTIVA');
CREATE TYPE tipo_evento AS ENUM ('ENTREGA', 'RECEPCION', 'TRASLADO', 'OTRO');
CREATE TYPE estado_evento AS ENUM ('PLANIFICADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO');
CREATE TYPE tipo_entrega AS ENUM ('COMPLETA', 'PARCIAL', 'DEVOLUCION', 'OTRO');
CREATE TYPE estado_entrega AS ENUM ('PENDIENTE', 'EN_TRANSITO', 'COMPLETADA', 'RECHAZADA');
```

### TipoOperacion
```
COMPRA           -- Compra a proveedor
VENTA_DIRECTA    -- Venta directa a cliente
VENTA_COMISION   -- Venta por comisión (intermediación)
```

### EstadoDocumental
```
INCOMPLETA       -- Faltan documentos obligatorios
COMPLETA         -- Todos los documentos obligatorios presentes
```

### EstadoFinanciero
```
PENDIENTE        -- Sin factura ni pagos
FACTURADA        -- Factura emitida, pago pendiente
PAGADA           -- Pagos registrados
CERRADA          -- Operación finalizada (requiere observación)
```

### TipoDocumento
```
ORDEN_COMPRA        -- OC de FSL al proveedor
GUIA_DESPACHO       -- Guía de despacho (proveedor → cliente)
GUIA_RECEPCION      -- Guía de recepción/traslado
FACTURA             -- Factura de compra o venta
CERTIFICADO_NIMF15  -- Certificado fitosanitario
OTRO                -- Otros documentos
```

### TipoPago
```
PAGO_PROVEEDOR   -- Pago a proveedor por compra
COBRO_CLIENTE    -- Cobro a cliente por venta
PAGO_FLETE       -- Pago de transporte
PAGO_COMISION    -- Pago/cobro de comisión
```

### EstadoOC
```
BORRADOR     -- OC en creación, no enviada
ENVIADA      -- OC generada y enviada al proveedor
RECIBIDA     -- Proveedor confirmó recepción
CANCELADA    -- OC cancelada
```

### TipoEmpresa
```
PROVEEDOR      -- Empresa que provee productos
CLIENTE        -- Empresa que compra productos
TRANSPORTISTA  -- Empresa de transporte/logística
OTRO           -- Otro tipo de empresa
```

### EstadoEmpresa
```
ACTIVA      -- Empresa activa y disponible
INACTIVA    -- Empresa inactiva (no disponible)
```

### TipoEvento
```
ENTREGA     -- Evento de entrega de productos
RECEPCION   -- Evento de recepción de productos
TRASLADO    -- Evento de traslado/transporte
OTRO        -- Otro tipo de evento
```

### EstadoEvento
```
PLANIFICADO   -- Evento planificado, no iniciado
EN_CURSO      -- Evento en ejecución
COMPLETADO    -- Evento finalizado exitosamente
CANCELADO     -- Evento cancelado
```

### TipoEntrega
```
COMPLETA     -- Entrega completa según lo solicitado
PARCIAL      -- Entrega parcial
DEVOLUCION   -- Devolución de productos
OTRO         -- Otro tipo de entrega
```

### EstadoEntrega
```
PENDIENTE     -- Entrega pendiente de realizar
EN_TRANSITO   -- Entrega en tránsito
COMPLETADA    -- Entrega completada exitosamente
RECHAZADA     -- Entrega rechazada
```

---

## 3. Tablas

### 3.1 Usuario

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid_generate_v4() | PK |
| `email` | VARCHAR(255) | NO | - | Único, login |
| `nombre` | VARCHAR(255) | NO | - | Nombre completo |
| `password_hash` | VARCHAR(255) | NO | - | Bcrypt hash (salt rounds: 10, generado con Node.js crypto) |
| `activo` | BOOLEAN | NO | true | Puede acceder |
| `ultimo_acceso` | TIMESTAMP | YES | NULL | Último login |
| `created_at` | TIMESTAMP | NO | NOW() | Fecha creación |
| `updated_at` | TIMESTAMP | NO | NOW() | Última modificación |

**Índices:**
- `usuario_email_unique` UNIQUE (email)
- `usuario_activo_idx` (activo) WHERE activo = true

**Comentarios:**
- `password_hash`: Hash generado con bcrypt.hash(password, 10), formato $2b$10$...
- Nunca almacenar contraseñas en texto plano
- Verificar contraseñas con bcrypt.compare(password, password_hash)

---

### 3.2 Proveedor

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid_generate_v4() | PK |
| `rut` | VARCHAR(12) | NO | - | RUT único, almacenado sin puntos (ej: 77442030-4) |
| `razon_social` | VARCHAR(255) | NO | - | Nombre legal |
| `nombre_fantasia` | VARCHAR(255) | YES | NULL | Nombre comercial |
| `direccion` | VARCHAR(500) | YES | NULL | Dirección fiscal |
| `comuna` | VARCHAR(100) | YES | NULL | Comuna |
| `ciudad` | VARCHAR(100) | YES | NULL | Ciudad |
| `telefono` | VARCHAR(20) | YES | NULL | Teléfono contacto |
| `email` | VARCHAR(255) | YES | NULL | Email contacto |
| `activo` | BOOLEAN | NO | true | Disponible para operar |
| `created_at` | TIMESTAMP | NO | NOW() | Fecha creación |
| `updated_at` | TIMESTAMP | NO | NOW() | Última modificación |

**Índices:**
- `proveedor_rut_unique` UNIQUE (rut)
- `proveedor_activo_idx` (activo)

---

### 3.3 Cliente

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid_generate_v4() | PK |
| `rut` | VARCHAR(12) | NO | - | RUT único, almacenado sin puntos (ej: 76123456-7) |
| `razon_social` | VARCHAR(255) | NO | - | Nombre legal |
| `nombre_fantasia` | VARCHAR(255) | YES | NULL | Nombre comercial |
| `direccion` | VARCHAR(500) | YES | NULL | Dirección por defecto |
| `comuna` | VARCHAR(100) | YES | NULL | Comuna |
| `ciudad` | VARCHAR(100) | YES | NULL | Ciudad |
| `telefono` | VARCHAR(20) | YES | NULL | Teléfono contacto |
| `email` | VARCHAR(255) | YES | NULL | Email contacto |
| `activo` | BOOLEAN | NO | true | Disponible para operar |
| `created_at` | TIMESTAMP | NO | NOW() | Fecha creación |
| `updated_at` | TIMESTAMP | NO | NOW() | Última modificación |

**Índices:**
- `cliente_rut_unique` UNIQUE (rut)
- `cliente_activo_idx` (activo)

---

### 3.4 Empresa

Tabla que representa organizaciones que interactúan con el sistema (proveedores, clientes, transportistas, etc.). Permite reutilización y unificación de información de empresas.

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid_generate_v4() | PK |
| `nombre` | VARCHAR(255) | NO | - | Nombre de la empresa |
| `rut` | VARCHAR(12) | NO | - | RUT o identificador legal, almacenado sin puntos (ej: 77442030-4) |
| `tipo_empresa` | ENUM TipoEmpresa | NO | - | Tipo de empresa |
| `contacto` | VARCHAR(255) | YES | NULL | Información de contacto principal |
| `direccion` | VARCHAR(500) | YES | NULL | Dirección física |
| `telefono` | VARCHAR(20) | YES | NULL | Teléfono de contacto |
| `email` | VARCHAR(255) | YES | NULL | Email de contacto |
| `estado` | ENUM EstadoEmpresa | NO | 'ACTIVA' | Estado de la empresa |
| `created_at` | TIMESTAMP | NO | NOW() | Fecha creación |
| `updated_at` | TIMESTAMP | NO | NOW() | Última modificación |

**Índices:**
- `empresa_rut_unique` UNIQUE (rut)
- `empresa_tipo_idx` (tipo_empresa)
- `empresa_estado_idx` (estado)
- `empresa_nombre_idx` (nombre) -- Para búsquedas por nombre

**Foreign Keys:**
- Ninguna (tabla independiente)

**Constraints de Check:**
```sql
-- Validar formato de RUT (básico, validación completa en aplicación)
ALTER TABLE empresa ADD CONSTRAINT chk_rut_formato 
  CHECK (rut ~ '^[0-9]{7,8}-[0-9Kk]$');
```

**Notas:**
- La entidad `Empresa` unifica la representación de organizaciones
- Las entidades `Proveedor` y `Cliente` pueden referenciar a `Empresa` mediante `empresa_id` (opcional, para mantener compatibilidad)
- El RUT se almacena sin puntos, solo con guión antes del dígito verificador

---

### 3.5 Evento

Tabla que representa eventos logísticos u operativos dentro del sistema. Los eventos pueden contener múltiples entregas.

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid_generate_v4() | PK |
| `numero` | VARCHAR(50) | NO | - | Número identificador del evento |
| `tipo` | ENUM TipoEvento | NO | - | Tipo de evento |
| `fecha_inicio` | DATE | NO | - | Fecha de inicio del evento |
| `fecha_fin` | DATE | YES | NULL | Fecha de finalización del evento |
| `ubicacion` | VARCHAR(500) | YES | NULL | Ubicación donde ocurre el evento |
| `descripcion` | TEXT | YES | NULL | Descripción del evento |
| `estado` | ENUM EstadoEvento | NO | 'PLANIFICADO' | Estado del evento |
| `operacion_id` | UUID | YES | NULL | FK → Operacion (si está asociado) |
| `created_at` | TIMESTAMP | NO | NOW() | Fecha creación |
| `updated_at` | TIMESTAMP | NO | NOW() | Última modificación |

**Índices:**
- `evento_numero_idx` (numero)
- `evento_tipo_idx` (tipo)
- `evento_fecha_inicio_idx` (fecha_inicio DESC)
- `evento_estado_idx` (estado)
- `evento_operacion_idx` (operacion_id) WHERE operacion_id IS NOT NULL

**Foreign Keys:**
- `operacion_id` → `operacion(id)` ON DELETE SET NULL

**Constraints de Check:**
```sql
-- Validar que fecha_fin no sea anterior a fecha_inicio
ALTER TABLE evento ADD CONSTRAINT chk_fecha_fin_valida 
  CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio);

-- Validar que fecha_inicio no sea futura (opcional, puede ser planificado)
-- ALTER TABLE evento ADD CONSTRAINT chk_fecha_inicio_no_futura 
--   CHECK (fecha_inicio <= CURRENT_DATE + INTERVAL '30 days');
```

**Notas:**
- Los eventos permiten agrupar entregas relacionadas
- Un evento puede estar asociado a una operación (opcional)
- El estado del evento puede cambiar durante su ciclo de vida

---

### 3.6 Entrega

Tabla que representa el acto de entrega de productos o recursos dentro del sistema. Las entregas ocurren dentro de eventos.

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid_generate_v4() | PK |
| `evento_id` | UUID | NO | - | FK → Evento (obligatorio) |
| `empresa_id` | UUID | NO | - | FK → Empresa (empresa que realiza la entrega) |
| `empresa_receptora_id` | UUID | YES | NULL | FK → Empresa (empresa que recibe, si aplica) |
| `fecha_hora` | TIMESTAMP | NO | - | Fecha y hora de la entrega |
| `tipo_entrega` | ENUM TipoEntrega | NO | - | Tipo de entrega |
| `descripcion` | TEXT | YES | NULL | Descripción de la entrega |
| `cantidad` | DECIMAL(12,2) | NO | - | Cantidad entregada |
| `unidad` | VARCHAR(20) | NO | 'unidades' | Unidad de medida (ej: "unidades", "pallets", "kg") |
| `estado` | ENUM EstadoEntrega | NO | 'PENDIENTE' | Estado de la entrega |
| `observaciones` | TEXT | YES | NULL | Notas adicionales sobre la entrega |
| `created_at` | TIMESTAMP | NO | NOW() | Fecha creación |
| `updated_at` | TIMESTAMP | NO | NOW() | Última modificación |

**Índices:**
- `entrega_evento_idx` (evento_id)
- `entrega_empresa_idx` (empresa_id)
- `entrega_empresa_receptora_idx` (empresa_receptora_id) WHERE empresa_receptora_id IS NOT NULL
- `entrega_fecha_hora_idx` (fecha_hora DESC)
- `entrega_tipo_idx` (tipo_entrega)
- `entrega_estado_idx` (estado)

**Foreign Keys:**
- `evento_id` → `evento(id)` ON DELETE CASCADE
- `empresa_id` → `empresa(id)` ON DELETE RESTRICT
- `empresa_receptora_id` → `empresa(id)` ON DELETE SET NULL

**Constraints de Check:**
```sql
-- Validar cantidad positiva
ALTER TABLE entrega ADD CONSTRAINT chk_cantidad_positiva 
  CHECK (cantidad > 0);

-- Validar que fecha_hora no sea futura (opcional, puede ser planificada)
-- ALTER TABLE entrega ADD CONSTRAINT chk_fecha_hora_no_futura 
--   CHECK (fecha_hora <= CURRENT_TIMESTAMP + INTERVAL '7 days');

-- Validar unidad no vacía
ALTER TABLE entrega ADD CONSTRAINT chk_unidad_no_vacia 
  CHECK (LENGTH(TRIM(unidad)) > 0);
```

**Notas:**
- Cada entrega debe estar asociada a un evento (`evento_id` obligatorio)
- La relación `Evento 1 ── N Entregas` permite agrupar múltiples entregas en el mismo contexto operativo
- `empresa_id` es obligatorio (quién realiza la entrega)
- `empresa_receptora_id` es opcional (quién recibe, si aplica)
- La cantidad puede ser decimal para permitir fracciones si es necesario

---

### 3.7 TipoPallet

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid_generate_v4() | PK |
| `codigo` | VARCHAR(10) | NO | - | Código corto (PV, PR, PC) |
| `nombre` | VARCHAR(100) | NO | - | Nombre descriptivo |
| `descripcion` | TEXT | YES | NULL | Descripción adicional |
| `requiere_certificacion` | BOOLEAN | NO | false | Necesita NIMF-15 |
| `activo` | BOOLEAN | NO | true | Disponible para usar |
| `created_at` | TIMESTAMP | NO | NOW() | Fecha creación |

**Índices:**
- `tipo_pallet_codigo_unique` UNIQUE (codigo)

**Datos Semilla:**
```sql
INSERT INTO tipo_pallet (codigo, nombre, descripcion, requiere_certificacion) VALUES
('PV', 'Pallet Verde', 'Pallet de madera sin tratamiento', false),
('PR', 'Pallet Rústico', 'Pallet de madera con acabado básico', false),
('PC', 'Pallet Certificado', 'Pallet con tratamiento fitosanitario NIMF-15', true);
```

---

### 3.8 Operacion

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid_generate_v4() | PK |
| `numero` | VARCHAR(20) | NO | - | Correlativo (OP-2026-00001) |
| `tipo` | ENUM TipoOperacion | NO | - | Tipo de operación |
| `fecha` | DATE | NO | - | Fecha de la operación |
| `cliente_id` | UUID | YES | NULL | FK → Cliente |
| `estado_documental` | ENUM EstadoDocumental | NO | 'INCOMPLETA' | Estado de documentos |
| `estado_financiero` | ENUM EstadoFinanciero | NO | 'PENDIENTE' | Estado financiero |
| `direccion_entrega` | VARCHAR(500) | YES | NULL | Dirección de entrega |
| `orden_compra_cliente` | VARCHAR(50) | YES | NULL | OC del cliente (referencia) |
| `orden_compra_generada_id` | UUID | YES | NULL | FK → OrdenCompra (OC generada por FSL al proveedor) |
| `observaciones` | TEXT | YES | NULL | Notas generales |
| `observacion_cierre` | TEXT | YES | NULL | Obligatoria al cerrar |
| `fecha_cierre` | TIMESTAMP | YES | NULL | Cuándo se cerró |
| `created_at` | TIMESTAMP | NO | NOW() | Fecha creación |
| `updated_at` | TIMESTAMP | NO | NOW() | Última modificación |
| `evento_id` | UUID | YES | NULL | FK → Evento (evento asociado, opcional) |

**Índices:**
- `operacion_numero_unique` UNIQUE (numero)
- `operacion_tipo_idx` (tipo)
- `operacion_fecha_idx` (fecha DESC)
- `operacion_cliente_idx` (cliente_id) WHERE cliente_id IS NOT NULL
- `operacion_estado_doc_idx` (estado_documental)
- `operacion_estado_fin_idx` (estado_financiero)
- `operacion_oc_generada_idx` (orden_compra_generada_id) WHERE orden_compra_generada_id IS NOT NULL
- `operacion_created_idx` (created_at DESC) -- Para ordenar por más recientes
- `operacion_evento_idx` (evento_id) WHERE evento_id IS NOT NULL

**Foreign Keys:**
- `cliente_id` → `cliente(id)` ON DELETE RESTRICT
- `orden_compra_generada_id` → `orden_compra(id)` ON DELETE SET NULL
- `evento_id` → `evento(id)` ON DELETE SET NULL

**Constraints de Check:**
```sql
-- Validar que fecha no sea futura
ALTER TABLE operacion ADD CONSTRAINT chk_fecha_no_futura 
  CHECK (fecha <= CURRENT_DATE);

-- Validar que fecha_cierre no sea anterior a fecha
ALTER TABLE operacion ADD CONSTRAINT chk_fecha_cierre_valida 
  CHECK (fecha_cierre IS NULL OR fecha_cierre >= fecha);
```

**Validaciones de negocio (a nivel de aplicación):**
```
- Si tipo = COMPRA → debe tener al menos 1 proveedor (a través de operacion_proveedor)
- Si tipo = VENTA_DIRECTA → cliente_id es requerido Y debe tener al menos 1 proveedor
- Si tipo = VENTA_COMISION → cliente_id es requerido Y debe tener al menos 1 proveedor
- Si tipo = VENTA_* → las líneas deben tener precio_venta_unitario Y precio_compra_unitario
- Si estado_financiero = CERRADA → observacion_cierre es requerido
- orden_compra_cliente: Opcional pero recomendado para trazabilidad en operaciones de venta
- Una operación puede tener múltiples proveedores (relación N:M)
```

---

### 3.8.1 OperacionProveedor (Tabla Intermedia)

Tabla de unión para relación muchos a muchos entre Operacion y Proveedor.

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid_generate_v4() | PK |
| `operacion_id` | UUID | NO | - | FK → Operacion |
| `proveedor_id` | UUID | NO | - | FK → Proveedor |
| `created_at` | TIMESTAMP | NO | NOW() | Fecha creación |

**Índices:**
- `operacion_proveedor_operacion_idx` (operacion_id)
- `operacion_proveedor_proveedor_idx` (proveedor_id)
- `operacion_proveedor_unique` UNIQUE (operacion_id, proveedor_id) -- Evitar duplicados

**Foreign Keys:**
- `operacion_id` → `operacion(id)` ON DELETE CASCADE
- `proveedor_id` → `proveedor(id)` ON DELETE RESTRICT

**Constraints de Check:**
```sql
-- No se permiten duplicados (ya cubierto por índice único)
```

---

### 3.9 OperacionLinea

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid_generate_v4() | PK |
| `operacion_id` | UUID | NO | - | FK → Operacion |
| `tipo_pallet_id` | UUID | NO | - | FK → TipoPallet |
| `cantidad` | INTEGER | NO | - | Cantidad solicitada original |
| `cantidad_entregada` | INTEGER | NO | 0 | Cantidad efectivamente recibida conforme |
| `cantidad_danada` | INTEGER | NO | 0 | Cantidad de pallets dañados/rechazados |
| `precio_unitario` | DECIMAL(12,2) | YES | NULL | Precio por unidad (para COMPRA) |
| `precio_venta_unitario` | DECIMAL(12,2) | YES | NULL | Precio de venta por unidad (para VENTA_*) |
| `precio_compra_unitario` | DECIMAL(12,2) | YES | NULL | Precio de compra por unidad (para VENTA_*) |
| `descripcion_producto` | VARCHAR(255) | YES | NULL | Descripción adicional del producto |
| `created_at` | TIMESTAMP | NO | NOW() | Fecha creación |

**Índices:**
- `operacion_linea_operacion_idx` (operacion_id)
- `operacion_linea_tipo_pallet_idx` (tipo_pallet_id)
- `operacion_linea_compuesto_idx` (operacion_id, tipo_pallet_id) -- Para búsquedas combinadas

**Foreign Keys:**
- `operacion_id` → `operacion(id)` ON DELETE CASCADE
- `tipo_pallet_id` → `tipo_pallet(id)` ON DELETE RESTRICT

**Constraints de Check:**
```sql
-- Validar cantidades
ALTER TABLE operacion_linea ADD CONSTRAINT chk_cantidad_positiva 
  CHECK (cantidad > 0);
ALTER TABLE operacion_linea ADD CONSTRAINT chk_cantidad_entregada_valida 
  CHECK (cantidad_entregada >= 0);
ALTER TABLE operacion_linea ADD CONSTRAINT chk_cantidad_danada_valida 
  CHECK (cantidad_danada >= 0);
ALTER TABLE operacion_linea ADD CONSTRAINT chk_cantidades_coherentes 
  CHECK (cantidad_entregada + cantidad_danada <= cantidad);

-- Validar precios según tipo de operación (a nivel de aplicación, pero constraint para márgenes)
ALTER TABLE operacion_linea ADD CONSTRAINT chk_margen_no_negativo 
  CHECK (
    (precio_venta_unitario IS NULL AND precio_compra_unitario IS NULL) OR
    (precio_venta_unitario IS NOT NULL AND precio_compra_unitario IS NOT NULL AND precio_venta_unitario >= precio_compra_unitario)
  );
```

**Validaciones adicionales (a nivel de aplicación):**
```
- Para operaciones COMPRA: precio_unitario > 0 (requerido)
- Para operaciones VENTA_*: precio_venta_unitario > 0 Y precio_compra_unitario > 0 (ambos requeridos)
- precio_unitario solo se usa en COMPRA
- precio_venta_unitario y precio_compra_unitario solo se usan en VENTA_*
```

---

### 3.10 Documento

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid_generate_v4() | PK |
| `operacion_id` | UUID | NO | - | FK → Operacion |
| `tipo` | ENUM TipoDocumento | NO | - | Tipo de documento |
| `numero_documento` | VARCHAR(50) | YES | NULL | Folio/número (ej: 95519) |
| `fecha_documento` | DATE | YES | NULL | Fecha del documento |
| `archivo_url` | VARCHAR(500) | NO | - | Ruta del archivo |
| `archivo_nombre` | VARCHAR(255) | NO | - | Nombre original del archivo |
| `archivo_tipo` | VARCHAR(50) | NO | - | MIME type (application/pdf, image/jpeg) |
| `archivo_size` | INTEGER | NO | - | Tamaño en bytes |
| `es_obligatorio` | BOOLEAN | NO | false | Si es obligatorio para completitud |
| `observaciones` | TEXT | YES | NULL | Notas adicionales |
| `chofer_nombre` | VARCHAR(100) | YES | NULL | Solo para guías |
| `chofer_rut` | VARCHAR(12) | YES | NULL | Solo para guías |
| `vehiculo_patente` | VARCHAR(10) | YES | NULL | Solo para guías |
| `transportista` | VARCHAR(255) | YES | NULL | Empresa de transporte |
| `cantidad_documento` | INTEGER | YES | NULL | Cantidad total declarada en el documento |
| `cantidad_danada` | INTEGER | YES | NULL | Cantidad de pallets dañados informados |
| `uploaded_at` | TIMESTAMP | NO | NOW() | Fecha de subida |

**Índices:**
- `documento_operacion_idx` (operacion_id)
- `documento_tipo_idx` (tipo)
- `documento_numero_idx` (numero_documento) WHERE numero_documento IS NOT NULL
- `documento_obligatorio_idx` (operacion_id, es_obligatorio) WHERE es_obligatorio = true
- `documento_uploaded_idx` (uploaded_at DESC) -- Para ordenar por más recientes

**Foreign Keys:**
- `operacion_id` → `operacion(id)` ON DELETE CASCADE

**Constraints de Check:**
```sql
-- Validar tamaño máximo de archivo (10 MB)
ALTER TABLE documento ADD CONSTRAINT chk_archivo_size 
  CHECK (archivo_size > 0 AND archivo_size <= 10485760);

-- Validar tipo de archivo
ALTER TABLE documento ADD CONSTRAINT chk_archivo_tipo 
  CHECK (archivo_tipo IN ('application/pdf', 'image/jpeg', 'image/png', 'image/webp'));
```

**Validaciones adicionales (a nivel de aplicación):**
```
- archivo_url debe ser una ruta válida
- archivo_nombre debe incluir extensión
- Para guías: chofer_nombre, chofer_rut, vehiculo_patente son opcionales pero recomendados
```

---

### 3.11 Pago

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid_generate_v4() | PK |
| `operacion_id` | UUID | NO | - | FK → Operacion |
| `tipo` | ENUM TipoPago | NO | - | Tipo de pago |
| `monto` | DECIMAL(12,2) | NO | - | Monto del pago |
| `fecha_pago` | DATE | NO | - | Fecha efectiva del pago |
| `metodo_pago` | VARCHAR(50) | YES | NULL | Transferencia, cheque, etc. |
| `referencia` | VARCHAR(100) | YES | NULL | N° transferencia, N° cheque |
| `banco` | VARCHAR(100) | YES | NULL | Banco origen/destino |
| `observaciones` | TEXT | YES | NULL | Notas adicionales |
| `created_at` | TIMESTAMP | NO | NOW() | Fecha registro |

**Índices:**
- `pago_operacion_idx` (operacion_id)
- `pago_tipo_idx` (tipo)
- `pago_fecha_idx` (fecha_pago DESC)
- `pago_operacion_tipo_idx` (operacion_id, tipo) -- Para búsquedas combinadas

**Foreign Keys:**
- `operacion_id` → `operacion(id)` ON DELETE CASCADE

**Constraints de Check:**
```sql
-- Validar monto positivo
ALTER TABLE pago ADD CONSTRAINT chk_monto_positivo 
  CHECK (monto > 0);

-- Validar fecha no futura
ALTER TABLE pago ADD CONSTRAINT chk_fecha_pago_no_futura 
  CHECK (fecha_pago <= CURRENT_DATE);
```

**Validaciones adicionales (a nivel de aplicación):**
```
- Para operaciones de venta: Debe haber al menos un COBRO_CLIENTE y un PAGO_PROVEEDOR
- Suma de pagos no debe exceder el total de la operación (validar en aplicación)
```

---

### 3.12 Factoring

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid_generate_v4() | PK |
| `operacion_id` | UUID | NO | - | FK → Operacion (UNIQUE) |
| `empresa_factoring` | VARCHAR(255) | NO | - | Nombre empresa factoring |
| `fecha_factoring` | DATE | NO | - | Fecha de la operación |
| `monto_factura` | DECIMAL(12,2) | NO | - | Monto total de la factura |
| `monto_adelantado` | DECIMAL(12,2) | NO | - | Monto recibido adelantado |
| `comision_factoring` | DECIMAL(12,2) | YES | NULL | Comisión cobrada |
| `fecha_vencimiento` | DATE | YES | NULL | Vencimiento de la factura |
| `observaciones` | TEXT | YES | NULL | Notas adicionales |
| `created_at` | TIMESTAMP | NO | NOW() | Fecha registro |

**Índices:**
- `factoring_operacion_unique` UNIQUE (operacion_id)
- `factoring_empresa_idx` (empresa_factoring)
- `factoring_vencimiento_idx` (fecha_vencimiento)

**Foreign Keys:**
- `operacion_id` → `operacion(id)` ON DELETE CASCADE

**Constraints de Check:**
```sql
-- Validar montos de factoring
ALTER TABLE factoring ADD CONSTRAINT chk_monto_factura_positivo 
  CHECK (monto_factura > 0);
ALTER TABLE factoring ADD CONSTRAINT chk_monto_adelantado_positivo 
  CHECK (monto_adelantado > 0);
ALTER TABLE factoring ADD CONSTRAINT chk_adelanto_no_excede_factura 
  CHECK (monto_adelantado <= monto_factura);
```

**Validaciones adicionales (a nivel de aplicación):**
```
- Solo operaciones tipo VENTA_* pueden tener factoring
- Operación debe tener factura antes de factorizar
- Una operación solo puede tener un registro de factoring
```

---

### 3.13 OrdenCompra

Tabla para almacenar las órdenes de compra generadas por FSL dirigidas a proveedores.

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid_generate_v4() | PK |
| `numero` | VARCHAR(20) | NO | - | Correlativo (OC-2026-00001) |
| `proveedor_id` | UUID | NO | - | FK → Proveedor |
| `fecha` | DATE | NO | - | Fecha de la orden |
| `fecha_entrega` | DATE | YES | NULL | Fecha esperada de entrega |
| `direccion_entrega` | VARCHAR(500) | YES | NULL | Dirección de entrega |
| `observaciones` | TEXT | YES | NULL | Notas generales |
| `operacion_id` | UUID | YES | NULL | FK → Operacion (si está asociada) |
| `estado` | ENUM EstadoOC | NO | 'BORRADOR' | Estado de la OC |
| `pdf_generado` | BOOLEAN | NO | false | Si se ha generado el PDF |
| `pdf_url` | VARCHAR(500) | YES | NULL | Ruta del PDF generado |
| `created_at` | TIMESTAMP | NO | NOW() | Fecha creación |
| `updated_at` | TIMESTAMP | NO | NOW() | Última modificación |

**Índices:**
- `orden_compra_numero_unique` UNIQUE (numero)
- `orden_compra_proveedor_idx` (proveedor_id)
- `orden_compra_fecha_idx` (fecha)
- `orden_compra_operacion_idx` (operacion_id)
- `orden_compra_estado_idx` (estado)

**Foreign Keys:**
- `proveedor_id` → `proveedor(id)` ON DELETE RESTRICT
- `operacion_id` → `operacion(id)` ON DELETE SET NULL

**Enums:**
```
EstadoOC:
BORRADOR     -- OC en creación, no enviada
ENVIADA      -- OC generada y enviada al proveedor
RECIBIDA     -- Proveedor confirmó recepción
CANCELADA    -- OC cancelada
```

---

### 3.14 OrdenCompraLinea

Líneas de productos de una orden de compra.

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid_generate_v4() | PK |
| `orden_compra_id` | UUID | NO | - | FK → OrdenCompra |
| `tipo_pallet_id` | UUID | NO | - | FK → TipoPallet |
| `cantidad` | INTEGER | NO | - | Cantidad solicitada |
| `precio_unitario` | DECIMAL(12,2) | YES | NULL | Precio por unidad (opcional) |
| `descripcion` | VARCHAR(255) | YES | NULL | Descripción adicional |
| `created_at` | TIMESTAMP | NO | NOW() | Fecha creación |

**Índices:**
- `orden_compra_linea_oc_idx` (orden_compra_id)
- `orden_compra_linea_tipo_pallet_idx` (tipo_pallet_id)

**Foreign Keys:**
- `orden_compra_id` → `orden_compra(id)` ON DELETE CASCADE
- `tipo_pallet_id` → `tipo_pallet(id)` ON DELETE RESTRICT

**Constraints de Check:**
```sql
-- Validar cantidad positiva
ALTER TABLE orden_compra_linea ADD CONSTRAINT chk_cantidad_oc_positiva 
  CHECK (cantidad > 0);
```

**Validaciones adicionales (a nivel de aplicación):**
```
- OC debe tener al menos una línea antes de generar PDF
- precio_unitario es opcional pero recomendado
```

---

## 4. Secuencias

### Correlativo de Operaciones
```sql
-- Función para generar número de operación
CREATE OR REPLACE FUNCTION generar_numero_operacion()
RETURNS VARCHAR(20) AS $$
DECLARE
    anio VARCHAR(4);
    siguiente INTEGER;
    nuevo_numero VARCHAR(20);
BEGIN
    anio := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(numero FROM 9 FOR 5) AS INTEGER)
    ), 0) + 1
    INTO siguiente
    FROM operacion
    WHERE numero LIKE 'OP-' || anio || '-%';
    
    nuevo_numero := 'OP-' || anio || '-' || LPAD(siguiente::TEXT, 5, '0');
    
    RETURN nuevo_numero;
END;
$$ LANGUAGE plpgsql;
```

**Formato:** `OP-YYYY-NNNNN`
- Ejemplo: `OP-2026-00001`, `OP-2026-00002`, ...

### Correlativo de Órdenes de Compra
```sql
-- Función para generar número de orden de compra
CREATE OR REPLACE FUNCTION generar_numero_orden_compra()
RETURNS VARCHAR(20) AS $$
DECLARE
    anio VARCHAR(4);
    siguiente INTEGER;
    nuevo_numero VARCHAR(20);
BEGIN
    anio := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(numero FROM 4 FOR 5) AS INTEGER)
    ), 0) + 1
    INTO siguiente
    FROM orden_compra
    WHERE numero LIKE 'OC-' || anio || '-%';
    
    nuevo_numero := 'OC-' || anio || '-' || LPAD(siguiente::TEXT, 5, '0');
    
    RETURN nuevo_numero;
END;
$$ LANGUAGE plpgsql;
```

**Formato:** `OC-YYYY-NNNNN`
- Ejemplo: `OC-2026-00001`, `OC-2026-00002`, ...

---

## 5. Vistas Útiles

### Vista: Operaciones con Pendientes
```sql
CREATE VIEW v_operaciones_pendientes AS
SELECT 
    o.id,
    o.numero,
    o.tipo,
    o.fecha,
    o.estado_documental,
    o.estado_financiero,
    p.razon_social AS proveedor,
    c.razon_social AS cliente,
    (SELECT COUNT(*) FROM documento d WHERE d.operacion_id = o.id AND d.es_obligatorio = true) AS docs_obligatorios,
    (SELECT COUNT(*) FROM documento d WHERE d.operacion_id = o.id) AS docs_presentes,
    (SELECT COALESCE(SUM(monto), 0) FROM pago pg WHERE pg.operacion_id = o.id) AS total_pagado
FROM operacion o
LEFT JOIN proveedor p ON o.proveedor_id = p.id
LEFT JOIN cliente c ON o.cliente_id = c.id
WHERE o.estado_financiero != 'CERRADA';
```

### Vista: Resumen Dashboard
```sql
CREATE VIEW v_dashboard_resumen AS
SELECT
    (SELECT COUNT(*) FROM operacion WHERE estado_documental = 'INCOMPLETA') AS docs_faltantes,
    (SELECT COUNT(*) FROM operacion WHERE estado_financiero = 'FACTURADA') AS pagos_pendientes,
    (SELECT COUNT(*) FROM operacion WHERE estado_financiero NOT IN ('CERRADA')) AS operaciones_abiertas,
    (SELECT COUNT(*) FROM operacion WHERE estado_financiero = 'CERRADA' AND fecha_cierre >= CURRENT_DATE - INTERVAL '30 days') AS cerradas_30dias,
    (SELECT COUNT(*) FROM orden_compra WHERE estado = 'BORRADOR') AS oc_borrador,
    (SELECT COUNT(*) FROM orden_compra WHERE estado = 'ENVIADA') AS oc_enviadas;
```

### Vista: Operaciones con Márgenes Calculados
```sql
CREATE VIEW v_operaciones_margenes AS
SELECT 
    o.id,
    o.numero,
    o.tipo,
    o.fecha,
    o.cliente_id,
    o.proveedor_id,
    -- Totales de venta (solo para VENTA_*)
    COALESCE(SUM(
        CASE WHEN o.tipo IN ('VENTA_DIRECTA', 'VENTA_COMISION') 
        THEN ol.cantidad * ol.precio_venta_unitario 
        ELSE 0 END
    ), 0) AS total_venta,
    -- Totales de compra
    COALESCE(SUM(
        CASE WHEN o.tipo IN ('VENTA_DIRECTA', 'VENTA_COMISION') 
        THEN ol.cantidad * ol.precio_compra_unitario
        WHEN o.tipo = 'COMPRA'
        THEN ol.cantidad * ol.precio_unitario
        ELSE 0 END
    ), 0) AS total_compra,
    -- Margen bruto (solo para VENTA_*)
    COALESCE(SUM(
        CASE WHEN o.tipo IN ('VENTA_DIRECTA', 'VENTA_COMISION') 
        THEN ol.cantidad * (ol.precio_venta_unitario - ol.precio_compra_unitario)
        ELSE 0 END
    ), 0) AS margen_bruto
FROM operacion o
LEFT JOIN operacion_linea ol ON ol.operacion_id = o.id
GROUP BY o.id, o.numero, o.tipo, o.fecha, o.cliente_id, o.proveedor_id;
```

### Vista: Documentos Faltantes por Operación
```sql
CREATE VIEW v_documentos_faltantes AS
SELECT 
    o.id AS operacion_id,
    o.numero AS operacion_numero,
    o.tipo AS operacion_tipo,
    COUNT(DISTINCT d.id) FILTER (WHERE d.es_obligatorio = true) AS docs_obligatorios_presentes,
    -- Lógica de documentos obligatorios según tipo de operación
    CASE 
        WHEN o.tipo = 'COMPRA' THEN 2 -- OC de FSL, Guía Recepción
        WHEN o.tipo IN ('VENTA_DIRECTA', 'VENTA_COMISION') THEN 
            CASE 
                WHEN EXISTS (
                    SELECT 1 FROM operacion_linea ol 
                    JOIN tipo_pallet tp ON ol.tipo_pallet_id = tp.id 
                    WHERE ol.operacion_id = o.id AND tp.requiere_certificacion = true
                ) THEN 5 -- OC Cliente, OC FSL, Guía, Factura, NIMF-15
                ELSE 4 -- OC Cliente, OC FSL, Guía, Factura
            END
    END AS docs_obligatorios_requeridos
FROM operacion o
LEFT JOIN documento d ON d.operacion_id = o.id AND d.es_obligatorio = true
WHERE o.estado_documental = 'INCOMPLETA'
GROUP BY o.id, o.numero, o.tipo;
```

---

## 6. Datos Semilla (Seed)

### Usuario Admin Inicial
```sql
-- Nota: El password_hash debe generarse con bcrypt.hash(password, 10)
-- Ejemplo de generación en Node.js:
-- const bcrypt = require('bcrypt');
-- const hash = await bcrypt.hash('password123', 10);
-- INSERT INTO usuario (email, nombre, password_hash, activo) VALUES
-- ('admin@forestalsantalucia.cl', 'Administrador', hash, true);
```

**Generación de Hash:**
- Usar `bcrypt.hash(password, 10)` para generar hash
- Salt rounds: 10 (configuración estándar de seguridad)
- El hash generado tiene formato: `$2b$10$...` (bcrypt con 10 rounds)

### Tipos de Pallet
```sql
INSERT INTO tipo_pallet (codigo, nombre, descripcion, requiere_certificacion, activo) VALUES
('PV', 'Pallet Verde', 'Pallet de madera sin tratamiento', false, true),
('PR', 'Pallet Rústico', 'Pallet de madera con acabado básico', false, true),
('PC', 'Pallet Certificado', 'Pallet con tratamiento fitosanitario NIMF-15', true, true);
```

### Proveedor de Ejemplo (Forestal Andes)
```sql
INSERT INTO proveedor (rut, razon_social, nombre_fantasia, direccion, comuna, ciudad, telefono, email, activo) VALUES
('77442030-4', 'FORESTAL ANDES LIMITADA', 'Forestal Andes', 'Camino Freire a Barros Arana KM.2', 'Freire', 'Temuco', '45-2378200', 'administracion@forestalandes.cl', true);
```

### Cliente de Ejemplo
```sql
INSERT INTO cliente (rut, razon_social, nombre_fantasia, direccion, comuna, ciudad, activo) VALUES
('76123456-7', 'CERMAQ CHILE S.A.', 'Cermaq', 'Puerto Montt', 'Puerto Montt', 'Puerto Montt', true);
```

**Nota sobre formato de RUT:**
- El RUT se almacena **sin puntos**, solo con guión antes del dígito verificador
- Formato de almacenamiento: `12345678-9` (sin puntos)
- El sistema debe normalizar el RUT al ingresarlo (eliminar puntos, mantener guión)
- En la UI se puede mostrar con puntos para mejor legibilidad: `12.345.678-9`

---

## 7. Reglas de Documentos Obligatorios

Matriz de documentos obligatorios según tipo de operación y producto:

| Tipo Operación | Documento | Obligatorio | Condición |
|----------------|-----------|-------------|-----------|
| COMPRA | ORDEN_COMPRA | ✅ Sí | OC de FSL al proveedor |
| COMPRA | GUIA_RECEPCION | ✅ Sí | Siempre |
| VENTA_DIRECTA | ORDEN_COMPRA | ✅ Sí | OC del Cliente (que el cliente emitió a FSL) |
| VENTA_DIRECTA | ORDEN_COMPRA | ✅ Sí | OC de FSL (generada por FSL al proveedor) |
| VENTA_DIRECTA | GUIA_DESPACHO | ✅ Sí | Siempre |
| VENTA_DIRECTA | FACTURA | ✅ Sí | Factura de FSL al cliente |
| VENTA_DIRECTA | CERTIFICADO_NIMF15 | ⚠️ Condicional | Si producto requiere_certificacion |
| VENTA_COMISION | ORDEN_COMPRA | ✅ Sí | OC del Cliente (que el cliente emitió a FSL) |
| VENTA_COMISION | ORDEN_COMPRA | ✅ Sí | OC de FSL (generada por FSL al proveedor) |
| VENTA_COMISION | GUIA_DESPACHO | ✅ Sí | Siempre |
| VENTA_COMISION | FACTURA | ✅ Sí | Factura del proveedor al cliente |
| VENTA_COMISION | CERTIFICADO_NIMF15 | ⚠️ Condicional | Si producto requiere_certificacion |

**Nota:** Para operaciones de VENTA_*, se requieren DOS documentos de tipo ORDEN_COMPRA:
1. La OC del Cliente (registrada como documento, número en `orden_compra_cliente`)
2. La OC de FSL (generada, asociada mediante `orden_compra_generada_id`)

---

## 8. Triggers y Funciones

### Trigger: Actualizar updated_at automáticamente
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas las tablas con updated_at
CREATE TRIGGER update_operacion_updated_at 
    BEFORE UPDATE ON operacion 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proveedor_updated_at 
    BEFORE UPDATE ON proveedor 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cliente_updated_at 
    BEFORE UPDATE ON cliente 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orden_compra_updated_at 
    BEFORE UPDATE ON orden_compra 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empresa_updated_at 
    BEFORE UPDATE ON empresa 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evento_updated_at 
    BEFORE UPDATE ON evento 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entrega_updated_at 
    BEFORE UPDATE ON entrega 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Trigger: Actualizar ultimo_acceso en login
```sql
CREATE OR REPLACE FUNCTION update_ultimo_acceso()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE usuario 
    SET ultimo_acceso = NOW() 
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Nota: Este trigger se ejecuta desde la aplicación al autenticar con Auth.js
```

---

## 9. Consideraciones de Implementación

### Prisma Schema
```prisma
// Ejemplo completo de modelos principales

enum TipoOperacion {
  COMPRA
  VENTA_DIRECTA
  VENTA_COMISION
}

enum EstadoDocumental {
  INCOMPLETA
  COMPLETA
}

enum EstadoFinanciero {
  PENDIENTE
  FACTURADA
  PAGADA
  CERRADA
}

enum EstadoOC {
  BORRADOR
  ENVIADA
  RECIBIDA
  CANCELADA
}

enum TipoEmpresa {
  PROVEEDOR
  CLIENTE
  TRANSPORTISTA
  OTRO
}

enum EstadoEmpresa {
  ACTIVA
  INACTIVA
}

enum TipoEvento {
  ENTREGA
  RECEPCION
  TRASLADO
  OTRO
}

enum EstadoEvento {
  PLANIFICADO
  EN_CURSO
  COMPLETADO
  CANCELADO
}

enum TipoEntrega {
  COMPLETA
  PARCIAL
  DEVOLUCION
  OTRO
}

enum EstadoEntrega {
  PENDIENTE
  EN_TRANSITO
  COMPLETADA
  RECHAZADA
}

model Usuario {
  id           String    @id @default(uuid())
  email        String    @unique @db.VarChar(255)
  nombre       String    @db.VarChar(255)
  passwordHash String    @map("password_hash") @db.VarChar(255) // bcrypt hash, salt rounds: 10
  activo       Boolean   @default(true)
  ultimoAcceso DateTime? @map("ultimo_acceso") @db.Timestamp
  
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  
  @@index([activo])
  @@map("usuario")
}

model Empresa {
  id          String      @id @default(uuid())
  nombre      String      @db.VarChar(255)
  rut         String      @unique @db.VarChar(12)
  tipoEmpresa TipoEmpresa @map("tipo_empresa")
  contacto    String?     @db.VarChar(255)
  direccion   String?     @db.VarChar(500)
  telefono    String?     @db.VarChar(20)
  email       String?     @db.VarChar(255)
  estado      EstadoEmpresa @default(ACTIVA)
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")
  
  entregas            Entrega[] @relation("EmpresaEntrega")
  entregasReceptoras  Entrega[] @relation("EmpresaReceptora")
  
  @@index([tipoEmpresa])
  @@index([estado])
  @@index([nombre])
  @@map("empresa")
}

model Evento {
  id          String      @id @default(uuid())
  numero      String      @db.VarChar(50)
  tipo        TipoEvento
  fechaInicio DateTime    @map("fecha_inicio") @db.Date
  fechaFin    DateTime?   @map("fecha_fin") @db.Date
  ubicacion   String?     @db.VarChar(500)
  descripcion String?     @db.Text
  estado      EstadoEvento @default(PLANIFICADO)
  operacionId String?     @map("operacion_id") @db.Uuid
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")
  
  operacion   Operacion?  @relation(fields: [operacionId], references: [id], onDelete: SetNull)
  entregas    Entrega[]
  
  @@index([numero])
  @@index([tipo])
  @@index([fechaInicio(sort: Desc)])
  @@index([estado])
  @@index([operacionId])
  @@map("evento")
}

model Entrega {
  id                String        @id @default(uuid())
  eventoId          String        @map("evento_id") @db.Uuid
  empresaId         String        @map("empresa_id") @db.Uuid
  empresaReceptoraId String?      @map("empresa_receptora_id") @db.Uuid
  fechaHora         DateTime      @map("fecha_hora") @db.Timestamp
  tipoEntrega       TipoEntrega   @map("tipo_entrega")
  descripcion       String?       @db.Text
  cantidad          Decimal       @db.Decimal(12, 2)
  unidad            String        @default("unidades") @db.VarChar(20)
  estado            EstadoEntrega @default(PENDIENTE)
  observaciones     String?       @db.Text
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")
  
  evento            Evento        @relation(fields: [eventoId], references: [id], onDelete: Cascade)
  empresa           Empresa       @relation("EmpresaEntrega", fields: [empresaId], references: [id], onDelete: Restrict)
  empresaReceptora  Empresa?      @relation("EmpresaReceptora", fields: [empresaReceptoraId], references: [id], onDelete: SetNull)
  
  @@index([eventoId])
  @@index([empresaId])
  @@index([empresaReceptoraId])
  @@index([fechaHora(sort: Desc)])
  @@index([tipoEntrega])
  @@index([estado])
  @@map("entrega")
}

model Operacion {
  id                    String   @id @default(uuid())
  numero                String   @unique @db.VarChar(20) // OP-YYYY-NNNNN
  tipo                  TipoOperacion
  fecha                 DateTime @db.Date
  proveedorId           String?  @map("proveedor_id") @db.Uuid
  clienteId             String?  @map("cliente_id") @db.Uuid
  estadoDocumental      EstadoDocumental @default(INCOMPLETA) @map("estado_documental")
  estadoFinanciero      EstadoFinanciero @default(PENDIENTE) @map("estado_financiero")
  direccionEntrega      String?  @map("direccion_entrega") @db.VarChar(500)
  ordenCompraCliente    String?  @map("orden_compra_cliente") @db.VarChar(50) // OC del cliente a FSL
  ordenCompraGeneradaId String? @map("orden_compra_generada_id") @db.Uuid // OC generada por FSL
  observaciones         String?  @db.Text
  observacionCierre     String?  @map("observacion_cierre") @db.Text
  fechaCierre           DateTime? @map("fecha_cierre") @db.Timestamp
  eventoId              String?  @map("evento_id") @db.Uuid
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")
  
  proveedor             Proveedor? @relation(fields: [proveedorId], references: [id], onDelete: Restrict)
  cliente               Cliente? @relation(fields: [clienteId], references: [id], onDelete: Restrict)
  ordenCompraGenerada   OrdenCompra? @relation(fields: [ordenCompraGeneradaId], references: [id], onDelete: SetNull)
  evento                Evento? @relation(fields: [eventoId], references: [id], onDelete: SetNull)
  lineas                OperacionLinea[]
  documentos            Documento[]
  pagos                 Pago[]
  factoring             Factoring?
  
  @@index([tipo])
  @@index([fecha(sort: Desc)])
  @@index([proveedorId])
  @@index([clienteId])
  @@index([estadoDocumental])
  @@index([estadoFinanciero])
  @@index([ordenCompraGeneradaId])
  @@index([eventoId])
  @@index([createdAt(sort: Desc)])
  @@map("operacion")
}

model OperacionLinea {
  id                  String   @id @default(uuid())
  operacionId         String   @map("operacion_id") @db.Uuid
  tipoPalletId        String   @map("tipo_pallet_id") @db.Uuid
  cantidad            Int
  cantidadEntregada   Int      @default(0) @map("cantidad_entregada")
  cantidadDanada      Int      @default(0) @map("cantidad_danada")
  precioUnitario      Decimal? @map("precio_unitario") @db.Decimal(12, 2) // Para COMPRA
  precioVentaUnitario Decimal? @map("precio_venta_unitario") @db.Decimal(12, 2) // Para VENTA_*
  precioCompraUnitario Decimal? @map("precio_compra_unitario") @db.Decimal(12, 2) // Para VENTA_*
  descripcionProducto String?  @map("descripcion_producto") @db.VarChar(255)
  createdAt           DateTime @default(now()) @map("created_at")
  
  operacion           Operacion @relation(fields: [operacionId], references: [id], onDelete: Cascade)
  tipoPallet          TipoPallet @relation(fields: [tipoPalletId], references: [id], onDelete: Restrict)
  
  @@index([operacionId])
  @@index([tipoPalletId])
  @@index([operacionId, tipoPalletId])
  @@map("operacion_linea")
}

model OrdenCompra {
  id                String    @id @default(uuid())
  numero            String    @unique @db.VarChar(20) // OC-YYYY-NNNNN
  proveedorId       String    @map("proveedor_id") @db.Uuid
  fecha             DateTime  @db.Date
  fechaEntrega      DateTime? @map("fecha_entrega") @db.Date
  direccionEntrega  String?  @map("direccion_entrega") @db.VarChar(500)
  observaciones     String?   @db.Text
  operacionId       String?   @map("operacion_id") @db.Uuid
  estado            EstadoOC @default(BORRADOR)
  pdfGenerado       Boolean   @default(false) @map("pdf_generado")
  pdfUrl            String?   @map("pdf_url") @db.VarChar(500)
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  
  proveedor         Proveedor @relation(fields: [proveedorId], references: [id], onDelete: Restrict)
  operacion        Operacion? @relation(fields: [operacionId], references: [id], onDelete: SetNull)
  lineas           OrdenCompraLinea[]
  
  @@index([proveedorId])
  @@index([fecha(sort: Desc)])
  @@index([operacionId])
  @@index([estado])
  @@map("orden_compra")
}
```

### Migraciones
- **Orden de creación**: Usuario → TipoPallet → Empresa → Proveedor/Cliente → Evento → Entrega → Operacion → OperacionProveedor → OperacionLinea → OrdenCompra → OrdenCompraLinea → Documento → Pago → Factoring
- **Seed data**: Incluir en migración inicial o script separado
- **Constraints**: Agregar después de crear tablas
- **Nota**: `Empresa` debe crearse antes de `Entrega` ya que `Entrega` tiene FK a `Empresa`

### Performance
- **Índices**: Los definidos cubren búsquedas más comunes
- **Vistas materializadas**: Considerar si el volumen crece (>10k operaciones)
- **Particionamiento**: No necesario en MVP, considerar por fecha si crece mucho
- **Caché**: Usar Redis para queries frecuentes (dashboard) si es necesario

### Seguridad
- **Autenticación**: Auth.js (NextAuth.js v5) con Credentials Provider
- **Sesiones**: Cookies HTTP-only (seguras, no accesibles desde JavaScript)
- **Hash de contraseñas**: 
  - Librería: `bcrypt` con Node.js `crypto`
  - Salt rounds: 10
  - Generar: `bcrypt.hash(password, 10)`
  - Verificar: `bcrypt.compare(password, storedHash)`
  - Formato hash: `$2b$10$...`
  - **Nunca almacenar contraseñas en texto plano**
- **Validación**: Siempre en backend, nunca confiar en frontend
- **SQL Injection**: Usar Prisma (protege automáticamente) o prepared statements
- **XSS**: Sanitizar inputs antes de guardar
- **CORS**: Configurar apropiadamente para producción
- **Rate Limiting**: Implementar en endpoints de autenticación

### Backup y Recuperación
- **Backups diarios**: Automatizar con `pg_dump` o herramienta de hosting
- **Retención**: Mínimo 30 días
- **Pruebas de restauración**: Mensuales
- **Backup de archivos**: Incluir `/uploads/` (OCs y documentos)

### Extensiones PostgreSQL Recomendadas
```sql
-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full text search (si se necesita búsqueda avanzada)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Comentarios SQL en Tablas
```sql
-- Agregar comentarios descriptivos a tablas y columnas importantes
COMMENT ON TABLE operacion IS 'Operaciones comerciales unificadas (venta + compra)';
COMMENT ON COLUMN operacion.orden_compra_cliente IS 'Número de OC que el cliente emitió a FSL';
COMMENT ON COLUMN operacion.orden_compra_generada_id IS 'Referencia a la OC generada por FSL al proveedor';
COMMENT ON COLUMN operacion_linea.precio_venta_unitario IS 'Precio al cliente (solo para VENTA_*)';
COMMENT ON COLUMN operacion_linea.precio_compra_unitario IS 'Costo al proveedor (solo para VENTA_*)';
COMMENT ON COLUMN usuario.password_hash IS 'Hash bcrypt con salt rounds 10, formato $2b$10$...';
COMMENT ON TABLE empresa IS 'Organizaciones que interactúan con el sistema (proveedores, clientes, transportistas, etc.)';
COMMENT ON TABLE evento IS 'Eventos logísticos u operativos que agrupan entregas relacionadas';
COMMENT ON TABLE entrega IS 'Entregas de productos o recursos que ocurren dentro de eventos';
COMMENT ON COLUMN entrega.evento_id IS 'Evento al que pertenece la entrega (obligatorio)';
COMMENT ON COLUMN entrega.empresa_id IS 'Empresa que realiza la entrega (obligatorio)';
COMMENT ON COLUMN entrega.empresa_receptora_id IS 'Empresa que recibe la entrega (opcional)';
COMMENT ON COLUMN operacion.evento_id IS 'Evento asociado a la operación (opcional)';
```

---

## 10. Resumen de Optimizaciones Aplicadas

### Índices Agregados
- ✅ Índices parciales (WHERE clause) para mejor performance
- ✅ Índices compuestos para búsquedas combinadas
- ✅ Índices en campos de ordenamiento frecuente (fecha DESC, created_at DESC)
- ✅ Índices en foreign keys con valores no nulos

### Constraints Agregados
- ✅ CHECK constraints para validaciones a nivel de base de datos
- ✅ Validación de fechas (no futuras, coherencia)
- ✅ Validación de montos (positivos)
- ✅ Validación de cantidades (positivas, coherentes)
- ✅ Validación de márgenes (no negativos)

### Vistas Optimizadas
- ✅ Vista de operaciones con pendientes
- ✅ Vista de resumen dashboard
- ✅ Vista de operaciones con márgenes calculados
- ✅ Vista de documentos faltantes

### Triggers
- ✅ Trigger para actualizar `updated_at` automáticamente
- ✅ Función para actualizar `ultimo_acceso` (ejecutada desde aplicación)

### Seguridad
- ✅ Hash de contraseñas con bcrypt (salt rounds: 10)
- ✅ Autenticación con Auth.js
- ✅ Constraints para prevenir datos inválidos

### Checklist de Implementación

#### Antes de crear tablas:
- [ ] Crear todos los ENUMs
- [ ] Crear extensión uuid-ossp
- [ ] Definir funciones de generación de números secuenciales

#### Al crear tablas:
- [ ] Crear en orden de dependencias
- [ ] Agregar índices después de crear tablas
- [ ] Agregar constraints CHECK después de crear tablas
- [ ] Agregar foreign keys con ON DELETE apropiado

#### Después de crear tablas:
- [ ] Crear triggers para updated_at
- [ ] Crear vistas útiles
- [ ] Insertar datos semilla
- [ ] Agregar comentarios SQL a tablas/columnas importantes
- [ ] Crear usuario admin con hash de contraseña

#### Validaciones:
- [ ] Probar generación de números secuenciales
- [ ] Probar constraints CHECK
- [ ] Probar foreign keys y cascadas
- [ ] Probar triggers
- [ ] Probar vistas

---

## 11. Optimizaciones Futuras

### Si el volumen crece (>10k operaciones):
1. **Índices parciales** para estados específicos
2. **Vistas materializadas** para dashboard
3. **Particionamiento** de tabla operacion por año
4. **Archivado** de operaciones cerradas > 2 años

### Si hay múltiples usuarios:
1. **Auditoría**: Tabla de logs de cambios
2. **Soft delete**: Campo `deleted_at` en lugar de DELETE físico
3. **Permisos**: Tabla de roles y permisos

---

*Documento listo para generar schema de Prisma y migraciones*

