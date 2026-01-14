# Schema de Base de Datos - Forestal Santa Lucía

**Versión:** 1.0  
**Fecha:** 2026-01-12  
**Base de datos:** PostgreSQL  
**ORM objetivo:** Prisma  
**Basado en:** SDD v2.1  

---

## 1. Diagrama Entidad-Relación

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              MODELO DE DATOS v2.1                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   ┌──────────────┐                                    ┌──────────────┐              │
│   │   Usuario    │                                    │  TipoPallet  │              │
│   └──────────────┘                                    └──────┬───────┘              │
│                                                              │                      │
│   ┌──────────────┐         ┌──────────────┐         ┌───────┴────────┐             │
│   │  Proveedor   │────┐    │   Operacion  │    ┌────│ OperacionLinea │             │
│   └──────────────┘    │    ├──────────────┤    │    └────────────────┘             │
│                       └───►│ proveedor_id │◄───┘                                   │
│   ┌──────────────┐    ┌───►│ cliente_id   │                                        │
│   │   Cliente    │────┘    └──────┬───────┘                                        │
│   └──────────────┘                │                                                │
│                                   │                                                │
│              ┌────────────────────┼────────────────────┐                           │
│              │                    │                    │                           │
│              ▼                    ▼                    ▼                           │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                      │
│   │  Documento   │     │     Pago     │     │  Factoring   │                      │
│   └──────────────┘     └──────────────┘     └──────────────┘                      │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

RELACIONES:
  Proveedor    1 ──────── N  Operacion (como proveedor)
  Cliente      1 ──────── N  Operacion (como cliente)
  Operacion    1 ──────── N  OperacionLinea
  Operacion    1 ──────── N  Documento
  Operacion    1 ──────── N  Pago
  Operacion    1 ──────── 1  Factoring (opcional)
  TipoPallet   1 ──────── N  OperacionLinea
```

---

## 2. Enumeraciones (Enums)

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

---

## 3. Tablas

### 3.1 Usuario

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid_generate_v4() | PK |
| `email` | VARCHAR(255) | NO | - | Único, login |
| `nombre` | VARCHAR(255) | NO | - | Nombre completo |
| `password_hash` | VARCHAR(255) | NO | - | Bcrypt hash |
| `activo` | BOOLEAN | NO | true | Puede acceder |
| `ultimo_acceso` | TIMESTAMP | YES | NULL | Último login |
| `created_at` | TIMESTAMP | NO | NOW() | Fecha creación |
| `updated_at` | TIMESTAMP | NO | NOW() | Última modificación |

**Índices:**
- `usuario_email_unique` UNIQUE (email)

---

### 3.2 Proveedor

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid_generate_v4() | PK |
| `rut` | VARCHAR(12) | NO | - | RUT único (ej: 77.442.030-4) |
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
| `rut` | VARCHAR(12) | NO | - | RUT único |
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

### 3.4 TipoPallet

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

### 3.5 Operacion

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid_generate_v4() | PK |
| `numero` | VARCHAR(20) | NO | - | Correlativo (OP-2026-00001) |
| `tipo` | ENUM TipoOperacion | NO | - | Tipo de operación |
| `fecha` | DATE | NO | - | Fecha de la operación |
| `proveedor_id` | UUID | YES | NULL | FK → Proveedor |
| `cliente_id` | UUID | YES | NULL | FK → Cliente |
| `estado_documental` | ENUM EstadoDocumental | NO | 'INCOMPLETA' | Estado de documentos |
| `estado_financiero` | ENUM EstadoFinanciero | NO | 'PENDIENTE' | Estado financiero |
| `direccion_entrega` | VARCHAR(500) | YES | NULL | Dirección de entrega |
| `orden_compra_cliente` | VARCHAR(50) | YES | NULL | OC del cliente (referencia) |
| `observaciones` | TEXT | YES | NULL | Notas generales |
| `observacion_cierre` | TEXT | YES | NULL | Obligatoria al cerrar |
| `fecha_cierre` | TIMESTAMP | YES | NULL | Cuándo se cerró |
| `created_at` | TIMESTAMP | NO | NOW() | Fecha creación |
| `updated_at` | TIMESTAMP | NO | NOW() | Última modificación |

**Índices:**
- `operacion_numero_unique` UNIQUE (numero)
- `operacion_tipo_idx` (tipo)
- `operacion_fecha_idx` (fecha)
- `operacion_proveedor_idx` (proveedor_id)
- `operacion_cliente_idx` (cliente_id)
- `operacion_estado_doc_idx` (estado_documental)
- `operacion_estado_fin_idx` (estado_financiero)

**Foreign Keys:**
- `proveedor_id` → `proveedor(id)` ON DELETE RESTRICT
- `cliente_id` → `cliente(id)` ON DELETE RESTRICT

**Validaciones de negocio:**
```
- Si tipo = COMPRA → proveedor_id es requerido
- Si tipo = VENTA_DIRECTA → cliente_id es requerido
- Si tipo = VENTA_COMISION → proveedor_id Y cliente_id son requeridos
- Si estado_financiero = CERRADA → observacion_cierre es requerido
```

---

### 3.6 OperacionLinea

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid_generate_v4() | PK |
| `operacion_id` | UUID | NO | - | FK → Operacion |
| `tipo_pallet_id` | UUID | NO | - | FK → TipoPallet |
| `cantidad` | INTEGER | NO | - | Cantidad solicitada |
| `cantidad_entregada` | INTEGER | NO | 0 | Cantidad efectivamente entregada |
| `precio_unitario` | DECIMAL(12,2) | YES | NULL | Precio por unidad |
| `descripcion_producto` | VARCHAR(255) | YES | NULL | Descripción adicional del producto |
| `created_at` | TIMESTAMP | NO | NOW() | Fecha creación |

**Índices:**
- `operacion_linea_operacion_idx` (operacion_id)
- `operacion_linea_tipo_pallet_idx` (tipo_pallet_id)

**Foreign Keys:**
- `operacion_id` → `operacion(id)` ON DELETE CASCADE
- `tipo_pallet_id` → `tipo_pallet(id)` ON DELETE RESTRICT

**Validaciones:**
```
- cantidad > 0
- cantidad_entregada >= 0
- cantidad_entregada <= cantidad
```

---

### 3.7 Documento

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
| `uploaded_at` | TIMESTAMP | NO | NOW() | Fecha de subida |

**Índices:**
- `documento_operacion_idx` (operacion_id)
- `documento_tipo_idx` (tipo)
- `documento_numero_idx` (numero_documento)

**Foreign Keys:**
- `operacion_id` → `operacion(id)` ON DELETE CASCADE

**Validaciones:**
```
- archivo_size <= 10485760 (10 MB)
- archivo_tipo IN ('application/pdf', 'image/jpeg', 'image/png', 'image/webp')
```

---

### 3.8 Pago

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
- `pago_fecha_idx` (fecha_pago)

**Foreign Keys:**
- `operacion_id` → `operacion(id)` ON DELETE CASCADE

**Validaciones:**
```
- monto > 0
- fecha_pago <= CURRENT_DATE (no fechas futuras)
```

---

### 3.9 Factoring

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

**Validaciones:**
```
- monto_factura > 0
- monto_adelantado > 0
- monto_adelantado <= monto_factura
- Solo operaciones tipo VENTA_* pueden tener factoring
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
    (SELECT COUNT(*) FROM operacion WHERE estado_financiero = 'CERRADA' AND fecha_cierre >= CURRENT_DATE - INTERVAL '30 days') AS cerradas_30dias;
```

---

## 6. Datos Semilla (Seed)

### Usuario Admin Inicial
```sql
INSERT INTO usuario (email, nombre, password_hash, activo) VALUES
('admin@forestalsantalucia.cl', 'Administrador', '$2b$10$[HASH_AQUI]', true);
```

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
('77.442.030-4', 'FORESTAL ANDES LIMITADA', 'Forestal Andes', 'Camino Freire a Barros Arana KM.2', 'Freire', 'Temuco', '45-2378200', 'administracion@forestalandes.cl', true);
```

### Cliente de Ejemplo
```sql
INSERT INTO cliente (rut, razon_social, nombre_fantasia, direccion, comuna, ciudad, activo) VALUES
('XX.XXX.XXX-X', 'CERMAQ CHILE S.A.', 'Cermaq', 'Puerto Montt', 'Puerto Montt', 'Puerto Montt', true);
```

---

## 7. Reglas de Documentos Obligatorios

Matriz de documentos obligatorios según tipo de operación y producto:

| Tipo Operación | Documento | Obligatorio | Condición |
|----------------|-----------|-------------|-----------|
| COMPRA | ORDEN_COMPRA | ✅ Sí | Siempre |
| COMPRA | GUIA_RECEPCION | ✅ Sí | Siempre |
| VENTA_DIRECTA | GUIA_DESPACHO | ✅ Sí | Siempre |
| VENTA_DIRECTA | FACTURA | ✅ Sí | Siempre |
| VENTA_DIRECTA | CERTIFICADO_NIMF15 | ⚠️ Condicional | Si producto requiere_certificacion |
| VENTA_COMISION | GUIA_DESPACHO | ✅ Sí | Siempre |
| VENTA_COMISION | FACTURA | ✅ Sí | Siempre |
| VENTA_COMISION | CERTIFICADO_NIMF15 | ⚠️ Condicional | Si producto requiere_certificacion |

---

## 8. Consideraciones de Implementación

### Prisma
- Usar `@id @default(uuid())` para todos los IDs
- Usar `@relation` para las FK con `onDelete` apropiado
- Definir los enums en el schema
- Usar `@unique` para campos únicos (rut, numero, email)

### Migraciones
- Crear en orden de dependencias: Usuario → TipoPallet → Proveedor/Cliente → Operacion → Resto
- Incluir seed data en migración inicial

### Performance
- Los índices definidos cubren las búsquedas más comunes
- Las vistas materializadas pueden agregarse si el volumen crece

---

*Documento listo para generar schema de Prisma*

