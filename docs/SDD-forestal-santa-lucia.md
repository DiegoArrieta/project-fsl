# SDD - Spec Driven Development Document
## Sistema de Gestión Operativa - Forestal Santa Lucía SpA

**Versión:** 2.0  
**Fecha:** 2026-01-12  
**Estado:** Especificación validada con cliente  
**Autor:** Arquitectura de Software  

> **Actualización v2.0:** Simplificación radical del modelo. El sistema se centra en **orden, control y certeza operativa** mediante la gestión unificada de operaciones comerciales y control documental. Usuario único, interfaz simple, foco en pendientes y alertas.  

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Alcance Funcional](#2-alcance-funcional)
3. [Actores y Roles](#3-actores-y-roles)
4. [Modelo de Dominio](#4-modelo-de-dominio)
5. [Flujos de Negocio](#5-flujos-de-negocio)
6. [Reglas de Negocio](#6-reglas-de-negocio)
7. [Estados y Transiciones](#7-estados-y-transiciones)
8. [Requerimientos Funcionales](#8-requerimientos-funcionales)
9. [Requerimientos No Funcionales](#9-requerimientos-no-funcionales)
10. [Supuestos y Decisiones de Diseño](#10-supuestos-y-decisiones-de-diseño)
11. [Riesgos y Preguntas Abiertas](#11-riesgos-y-preguntas-abiertas)
12. [Extensiones Futuras](#12-extensiones-futuras)
13. [Glosario](#13-glosario)

---

## 1. Resumen Ejecutivo

### 1.1 Contexto

Forestal Santa Lucía SpA opera como **intermediario comercial** en el negocio de compra y venta de pallets de madera. 

**Modelo de negocio:**
- FSL compra pallets a proveedores
- FSL vende pallets a clientes (venta directa o por comisión)
- **Los pallets viajan directamente del proveedor al cliente final** (sin bodega FSL)
- FSL no mantiene stock físico propio

Actualmente, la operación se gestiona con Excel, WhatsApp y documentos físicos. No hay un sistema que centralice operaciones, documentos y pagos.

### 1.2 Problema Real

El cliente no busca optimización ni BI avanzado. Busca **orden y certeza**:

- **"¿Qué operaciones están abiertas?"**
- **"¿Qué documentos faltan?"**
- **"¿Qué facturas no están pagadas?"**
- **"¿Qué certificados no han sido entregados?"**

Excel funciona para registrar, pero:
- No avisa cuando algo falta
- No alerta pendientes
- No conecta documentos con operaciones
- Requiere buscar en múltiples archivos

### 1.3 Solución Propuesta

Sistema web **personal y simple** que:

1. **Registra todas las operaciones** (compras, ventas, comisiones) de forma unificada
2. **Asocia documentos** a cada operación (OC, guías, facturas, certificados)
3. **Detecta y alerta** documentos faltantes automáticamente
4. **Controla pagos** (clientes, proveedores, fletes, factoring)
5. **Muestra pendientes** de forma clara y accionable

**No es un sistema de contabilidad**, es un sistema de **control operativo**.

### 1.4 Enfoque de Implementación

Desarrollo incremental enfocado en valor inmediato:

| Fase | Alcance | Duración estimada |
|------|---------|-------------------|
| MVP | Operaciones, documentos, alertas básicas | 3-4 semanas |
| V1.1 | Pagos, factoring, reportes simples | 2 semanas |
| V1.2 | Mejoras UX, búsquedas, históricos | 2 semanas |

---

## 2. Alcance Funcional

### 2.1 In-Scope (MVP - Primera Etapa)

| Módulo | Funcionalidades |
|--------|-----------------|
| **Operaciones** | Registro unificado de compras, ventas y ventas con comisión |
| **Documentos** | Subida, asociación y control de documentos (OC, guías, facturas, certificados NIMF-15) |
| **Alertas** | Detección automática de documentos faltantes y pendientes |
| **Pagos** | Registro de pagos a proveedores, cobros a clientes, pagos de fletes |
| **Factoring** | Control de facturas factorizadas y factoring utilizado |
| **Comisiones** | Registro y control de comisiones en ventas por intermediación |
| **Proveedores/Clientes** | Gestión básica de contactos comerciales |
| **Estados** | Visualización clara del estado de cada operación (documental y financiero) |
| **Reportes Simples** | Ventas/compras por período, pendientes, trazabilidad básica |

### 2.2 Out-of-Scope (Primera Etapa)

| Funcionalidad | Razón de exclusión |
|---------------|-------------------|
| Contabilidad formal | No es un sistema contable, solo control operativo |
| Facturación electrónica | Se emite externamente (SII) |
| Multiusuario y roles | Sistema personal (un usuario) en esta fase |
| Búsquedas avanzadas | No requeridas según cliente |
| Mobile-first | Uso principal desde computador |
| Análisis de costos logísticos | Solo registro, no optimización de fletes |
| BI avanzado | Reportes simples son suficientes |
| Integraciones externas | No necesarias en MVP |
| Gestión de bodega/almacén | FSL no tiene stock físico (modelo intermediación) |
| Dashboard sofisticado | Dashboard simple enfocado en pendientes |

---

## 3. Actores y Roles

### 3.1 Usuario del Sistema

| Actor | Descripción | Permisos |
|-------|-------------|----------|
| **Usuario Principal** | Dueño/administrador del negocio | Acceso total a todas las funcionalidades |

> **Nota v2.0:** El sistema es **personal** en esta fase. No hay roles diferenciados. Un único usuario con acceso completo. La gestión multiusuario quedará para fases futuras si es necesaria.

### 3.2 Actores Externos (No usuarios del sistema)

| Actor | Descripción | Relación con sistema |
|-------|-------------|---------------------|
| **Proveedor** | Vende pallets a FSL | Se registra como contacto, sus documentos se adjuntan |
| **Cliente** | Compra pallets a FSL | Se registra como contacto, recibe mercadería |
| **Transportista** | Traslada mercadería | Información se registra en documentos de despacho |

### 3.3 Acceso Futuro (Fuera de MVP)

En fases posteriores se podría considerar:
- Roles diferenciados (admin/operador)
- Multiusuario colaborativo
- Portal de clientes (consulta de operaciones)
- Portal de proveedores

---

## 4. Modelo de Dominio

### 4.1 Filosofía del Modelo v2.0

**Cambio fundamental:** El sistema ya no distingue visualmente entre "compras", "ventas" y "comisiones". Ahora todo es una **Operación comercial** con:

- Tipo interno (compra/venta/comisión)
- Documentos asociados
- Estado documental
- Estado financiero
- Participantes (proveedor/cliente)

El usuario ve **operaciones**, no "módulos separados". La complejidad se reduce dramáticamente.

### 4.2 Entidades Principales

#### **Operacion**
Entidad central unificada que representa cualquier transacción comercial.

| Atributo | Tipo | Requerido | Descripción |
|----------|------|-----------|-------------|
| id | UUID | Sí | Identificador único |
| numero | String | Sí | Número correlativo (OP-AAAA-NNNNN) |
| tipo | Enum | Sí | COMPRA, VENTA_DIRECTA, VENTA_COMISION |
| fecha | Date | Sí | Fecha de la operación |
| proveedor_id | UUID | Condicional | Requerido si tipo=COMPRA o VENTA_COMISION |
| cliente_id | UUID | Condicional | Requerido si tipo=VENTA_* |
| estado_documental | Enum | Sí | INCOMPLETA, COMPLETA |
| estado_financiero | Enum | Sí | PENDIENTE, FACTURADA, PAGADA, CERRADA |
| direccion_entrega | String | No | Dirección de entrega |
| observaciones | Text | No | Notas generales |
| created_at | Timestamp | Sí | Fecha de creación |
| updated_at | Timestamp | Sí | Última modificación |

#### **OperacionLinea**
Detalle de productos en una operación (múltiples tipos de pallet).

| Atributo | Tipo | Requerido | Descripción |
|----------|------|-----------|-------------|
| id | UUID | Sí | Identificador único |
| operacion_id | UUID | Sí | Referencia a la operación |
| tipo_pallet_id | UUID | Sí | Tipo de pallet |
| cantidad | Integer | Sí | Cantidad de pallets |
| precio_unitario | Decimal | No | Precio por unidad (compra o venta) |
| cantidad_entregada | Integer | Sí | Cantidad efectivamente entregada |

#### **Proveedor / Cliente**
Contactos comerciales (estructura similar para ambos).

| Atributo | Tipo | Requerido | Descripción |
|----------|------|-----------|-------------|
| id | UUID | Sí | Identificador único |
| rut | String | Sí | RUT de la empresa |
| razon_social | String | Sí | Nombre legal |
| nombre_fantasia | String | No | Nombre comercial |
| direccion | String | No | Dirección |
| telefono | String | No | Teléfono de contacto |
| email | String | No | Email de contacto |
| activo | Boolean | Sí | Si está activo para operar |
| created_at | Timestamp | Sí | Fecha de creación |

#### **Documento**
Archivos asociados a operaciones (OC, guías, facturas, certificados).

| Atributo | Tipo | Requerido | Descripción |
|----------|------|-----------|-------------|
| id | UUID | Sí | Identificador único |
| operacion_id | UUID | Sí | Operación a la que pertenece |
| tipo | Enum | Sí | ORDEN_COMPRA, GUIA_DESPACHO, GUIA_RECEPCION, FACTURA, CERTIFICADO_NIMF15, OTRO |
| numero_documento | String | No | Número del documento (si aplica) |
| fecha_documento | Date | No | Fecha del documento |
| archivo_url | String | Sí | Ruta o URL del archivo (PDF/imagen) |
| observaciones | Text | No | Notas adicionales |
| obligatorio | Boolean | Sí | Si es obligatorio para considerar operación completa |
| uploaded_at | Timestamp | Sí | Fecha de subida |

> **Nota:** La entidad Documento es clave para el control. El sistema detecta automáticamente documentos faltantes según el tipo de operación.

#### **Pago**
Registro de transacciones financieras asociadas a operaciones.

| Atributo | Tipo | Requerido | Descripción |
|----------|------|-----------|-------------|
| id | UUID | Sí | Identificador único |
| operacion_id | UUID | Sí | Operación relacionada |
| tipo | Enum | Sí | PAGO_PROVEEDOR, COBRO_CLIENTE, PAGO_FLETE, PAGO_COMISION |
| monto | Decimal | Sí | Monto del pago |
| fecha_pago | Date | Sí | Fecha del pago |
| metodo_pago | String | No | Transferencia, cheque, etc. |
| referencia | String | No | Número de transferencia, cheque, etc. |
| observaciones | Text | No | Notas adicionales |
| created_at | Timestamp | Sí | Fecha de registro |

#### **Factoring**
Control de facturas factorizadas.

| Atributo | Tipo | Requerido | Descripción |
|----------|------|-----------|-------------|
| id | UUID | Sí | Identificador único |
| operacion_id | UUID | Sí | Operación (venta) factorizada |
| empresa_factoring | String | Sí | Nombre de la empresa de factoring |
| fecha_factoring | Date | Sí | Fecha de la operación de factoring |
| monto_factura | Decimal | Sí | Monto total de la factura |
| monto_adelantado | Decimal | Sí | Monto adelantado por el factoring |
| comision_factoring | Decimal | No | Comisión cobrada |
| fecha_vencimiento | Date | No | Fecha de vencimiento de la factura |
| observaciones | Text | No | Notas adicionales |
| created_at | Timestamp | Sí | Fecha de registro |

#### **TipoPallet**
Catálogo de tipos de pallet que maneja la empresa.

| Atributo | Tipo | Requerido | Descripción |
|----------|------|-----------|-------------|
| id | UUID | Sí | Identificador único |
| codigo | String | Sí | Código corto (ej: "PV", "PR", "PC") |
| nombre | String | Sí | Nombre descriptivo |
| descripcion | String | No | Descripción adicional |
| requiere_certificacion | Boolean | Sí | Si requiere documentación especial (NIMF-15) |
| activo | Boolean | Sí | Si está disponible para usar |

**Valores iniciales:**
- `PV` - Pallet Verde
- `PR` - Pallet Rústico  
- `PC` - Pallet Certificado (requiere NIMF-15)

#### **Usuario**
Usuario del sistema (single-user en MVP).

| Atributo | Tipo | Requerido | Descripción |
|----------|------|-----------|-------------|
| id | UUID | Sí | Identificador único |
| email | String | Sí | Email (login) |
| nombre | String | Sí | Nombre completo |
| password_hash | String | Sí | Contraseña encriptada |
| activo | Boolean | Sí | Si puede acceder |
| ultimo_acceso | Timestamp | No | Último login |
| created_at | Timestamp | Sí | Fecha de creación |

> **Nota v2.0:** Se elimina el campo `rol` porque en esta fase hay un solo usuario con acceso total.

### 4.3 Diagrama de Relaciones v2.0 (Modelo Simplificado)

```
                     ┌─────────────────┐
                     │   TipoPallet    │
                     │ (Verde, Rústico,│
                     │  Certificado)   │
                     └────────┬────────┘
                              │
                              │
┌──────────────┐              │              ┌──────────────┐
│  Proveedor   │              │              │   Cliente    │
└──────┬───────┘              │              └──────┬───────┘
       │                      │                     │
       │ (N:1)                ▼                     │ (N:1)
       │          ┌────────────────────────┐        │
       └─────────►│      Operacion         │◄───────┘
                  ├────────────────────────┤
                  │ - tipo (COMPRA/VENTA)  │
                  │ - estado_documental    │
                  │ - estado_financiero    │
                  │ - fecha                │
                  └────────┬───────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
│ OperacionLinea  │ │  Documento   │ │    Pago      │
├─────────────────┤ ├──────────────┤ ├──────────────┤
│ - tipo_pallet   │ │ - tipo       │ │ - tipo       │
│ - cantidad      │ │ - archivo    │ │ - monto      │
│ - precio        │ │ - obligatorio│ │ - fecha_pago │
└─────────────────┘ └──────────────┘ └──────────────┘
                           │
                           ▼
                  ┌──────────────┐
                  │  Factoring   │
                  ├──────────────┤
                  │ - empresa    │
                  │ - monto      │
                  │ - fecha      │
                  └──────────────┘
```

**Principios del modelo v2.0:**

1. **Operacion** es la entidad central unificada
2. Los **Documentos** se asocian a operaciones (no entidades separadas)
3. Los **Pagos** se rastrean por operación
4. **Factoring** es un caso especial de financiamiento
5. No hay entidades separadas para compras/ventas/guías

### 4.4 Control de Completitud

El sistema determina automáticamente si una operación está completa según:

**Estado Documental:**
```
INCOMPLETA → Faltan documentos obligatorios
COMPLETA   → Todos los documentos obligatorios están presentes
```

**Estado Financiero:**
```
PENDIENTE  → Sin factura ni pagos
FACTURADA  → Factura emitida, pago pendiente
PAGADA     → Pagos registrados
CERRADA    → Operación completamente finalizada
```

**Documentos obligatorios según tipo:**

| Tipo Operación | Documentos Obligatorios |
|----------------|------------------------|
| COMPRA | Orden de Compra, Guía de Recepción |
| VENTA_DIRECTA | Guía de Despacho, Factura |
| VENTA_COMISION | Guía de Despacho, Factura |

Si el producto requiere certificación (Pallet Certificado):
- Agregar **Certificado NIMF-15** como obligatorio

---

## 5. Flujos de Negocio v2.0 (Modelo Simplificado)

> **Contexto v2.0:** Todo es una **Operación**. El usuario registra, adjunta documentos, registra pagos y el sistema indica qué falta. No hay flujos complejos, solo completitud progresiva.

### 5.1 Flujo Universal: Ciclo de Vida de una Operación

Todas las operaciones siguen el mismo ciclo simple:

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           CICLO DE VIDA DE UNA OPERACIÓN                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  1. CREAR OPERACIÓN                                                                 │
│     Usuario ingresa:                                                                │
│     • Tipo (Compra / Venta Directa / Venta con Comisión)                           │
│     • Proveedor o Cliente                                                           │
│     • Productos (tipo pallet, cantidad, precio)                                     │
│     • Fecha y dirección                                                             │
│                                                                                     │
│     ──────────────────────────────────────────────────────────────────────────────  │
│                                                                                     │
│  2. ADJUNTAR DOCUMENTOS                                                             │
│     • Sistema muestra qué documentos son obligatorios                               │
│     • Usuario sube archivos (PDF/imágenes)                                          │
│     • Sistema marca documentos como presentes/faltantes                             │
│                                                                                     │
│     🔴 Estado Documental: INCOMPLETA (faltan docs)                                  │
│     🟢 Estado Documental: COMPLETA (todos los docs presentes)                       │
│                                                                                     │
│     ──────────────────────────────────────────────────────────────────────────────  │
│                                                                                     │
│  3. REGISTRAR FACTURACIÓN Y PAGOS                                                   │
│     • Usuario adjunta factura                                                       │
│     • Usuario registra pagos (fecha, monto, método)                                 │
│     • Si aplica, registra factoring                                                 │
│                                                                                     │
│     Estado Financiero:                                                              │
│     🔴 PENDIENTE → 🟡 FACTURADA → 🟢 PAGADA → ✅ CERRADA                             │
│                                                                                     │
│     ──────────────────────────────────────────────────────────────────────────────  │
│                                                                                     │
│  4. MONITOREO DE PENDIENTES                                                         │
│     Sistema muestra en dashboard:                                                   │
│     • ⚠️ Operaciones con documentos faltantes                                        │
│     • ⚠️ Operaciones con pagos pendientes                                            │
│     • ⚠️ Operaciones con certificados pendientes                                     │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Tipos de Operación y sus Particularidades

Aunque el flujo es universal, cada tipo tiene particularidades:

#### **A) Operación tipo COMPRA**

```
Usuario registra compra → Adjunta documentos → Registra pago a proveedor
```

**Documentos obligatorios:**
- Orden de Compra
- Guía de recepción/traslado

**Pagos asociados:**
- Pago a proveedor
- Pago de flete (si FSL paga el transporte)

**Estado completo cuando:**
- ✅ Todos los documentos presentes
- ✅ Pago a proveedor registrado

---

#### **B) Operación tipo VENTA_DIRECTA**

```
Usuario registra venta → Adjunta documentos → Registra factura y cobro
```

**Documentos obligatorios:**
- Guía de despacho
- Factura
- Certificado NIMF-15 (solo si vende pallets certificados)

**Pagos asociados:**
- Cobro a cliente
- Pago de flete (si FSL paga el transporte)

**Estado completo cuando:**
- ✅ Todos los documentos presentes
- ✅ Factura emitida
- ✅ Cobro registrado

**Opcional:** Puede registrar factoring si la factura se factorizó

---

#### **C) Operación tipo VENTA_COMISION**

```
Usuario registra venta → Adjunta documentos → Registra comisión cobrada
```

**Documentos obligatorios:**
- Guía de despacho
- Factura (emitida por el proveedor al cliente)
- Certificado NIMF-15 (si aplica)

**Pagos asociados:**
- Comisión cobrada a proveedor (monto que recibe FSL)
- Pago de flete (si FSL paga el transporte)

**Estado completo cuando:**
- ✅ Todos los documentos presentes
- ✅ Comisión cobrada

---

### 5.3 Sistema de Alertas y Pendientes

El corazón del sistema es detectar automáticamente qué falta:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DASHBOARD DE PENDIENTES                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🔴 DOCUMENTOS FALTANTES (5)                                                 │
│     • OP-2026-00123 - Falta Guía de Recepción                               │
│     • OP-2026-00124 - Falta Certificado NIMF-15                             │
│     • OP-2026-00125 - Falta Factura                                         │
│     ...                                                                     │
│                                                                             │
│  🟡 PAGOS PENDIENTES (3)                                                     │
│     • OP-2026-00120 - Pago a proveedor pendiente ($2.500.000)               │
│     • OP-2026-00121 - Cobro a cliente pendiente ($3.200.000)                │
│     ...                                                                     │
│                                                                             │
│  🟢 OPERACIONES CERRADAS (15)                                                │
│     • Todo completo, sin pendientes                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Reglas de alertas:**
1. Si falta documento obligatorio → 🔴 Documento faltante
2. Si factura emitida pero no pagada → 🟡 Pago pendiente
3. Si pallet certificado sin NIMF-15 → 🔴 Certificado faltante
4. Si todo completo y cerrado → 🟢 OK

---

### 5.4 Flujo de Factoring

Caso especial: cuando se factoriza una factura de venta.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLUJO DE FACTORING                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Operación de venta existe y está facturada                              │
│  2. Usuario registra factoring:                                             │
│     • Empresa de factoring                                                  │
│     • Monto de la factura                                                   │
│     • Monto adelantado                                                      │
│     • Comisión del factoring                                                │
│     • Fecha de vencimiento                                                  │
│                                                                             │
│  3. Sistema marca la operación como "Factorizada"                           │
│  4. Sistema registra el adelanto como cobro parcial                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Reportes de factoring:**
- Listado de facturas factorizadas
- Factoring utilizado por período
- Facturas próximas a vencer

---

## 6. Reglas de Negocio v2.0

### 6.1 Reglas de Operaciones

| ID | Regla | Validación |
|----|-------|------------|
| RN-01 | Toda operación debe tener al menos una línea de producto | Validar antes de guardar |
| RN-02 | La cantidad debe ser mayor a cero | Validar en cada línea |
| RN-03 | Número de operación es secuencial: OP-2026-00001 en adelante | Sistema genera automático |
| RN-04 | No se puede eliminar operación con documentos o pagos asociados | Validar referencias |
| RN-05 | Operación COMPRA requiere proveedor obligatorio | Validar al crear |
| RN-06 | Operación VENTA_* requiere cliente obligatorio | Validar al crear |
| RN-07 | Operación VENTA_COMISION requiere proveedor Y cliente | Validar al crear |
| RN-08 | El cierre de operación requiere una Observación de Cierre | Campo obligatorio al cambiar a CERRADA |

### 6.2 Reglas de Documentos

| ID | Regla | Validación |
|----|-------|------------|
| RN-10 | Documentos obligatorios dependen del tipo de operación | Ver matriz de documentos obligatorios |
| RN-11 | Sistema detecta automáticamente documentos faltantes | Actualizar estado_documental |
| RN-12 | Solo se aceptan archivos PDF, JPG, PNG | Validar tipo de archivo |
| RN-13 | Tamaño máximo de archivo: 10 MB | Validar tamaño |
| RN-14 | Operación con pallet certificado requiere NIMF-15 obligatorio | Validar según tipo de producto |
| RN-15 | Documentos pueden tener número y fecha opcional | Campos opcionales |

### 6.3 Reglas de Pagos

| ID | Regla | Validación |
|----|-------|------------|
| RN-20 | Pago debe estar asociado a una operación | Referencia obligatoria |
| RN-21 | Monto de pago debe ser mayor a cero | Validar monto |
| RN-22 | Fecha de pago no puede ser futura | Validar fecha |
| RN-23 | Sistema actualiza estado financiero según pagos | Actualizar automático |
| RN-24 | Múltiples pagos permitidos (pagos parciales) | Suma total de pagos |

### 6.4 Reglas de Factoring

| ID | Regla | Validación |
|----|-------|------------|
| RN-30 | Solo operaciones de venta pueden factorizarse | Validar tipo de operación |
| RN-31 | Operación debe tener factura antes de factorizar | Validar documento FACTURA presente |
| RN-32 | Monto adelantado no puede ser mayor al monto de la factura | Validar montos |
| RN-33 | Una operación puede factorizarse solo una vez | Validar unicidad |

### 6.5 Reglas de Proveedores y Clientes

| ID | Regla | Validación |
|----|-------|------------|
| RN-40 | RUT debe ser válido (dígito verificador) y único | Validar formato y duplicados |
| RN-41 | Solo se puede operar con contactos activos | Filtrar en selectores |
| RN-42 | No se puede desactivar contacto con operaciones abiertas | Validar antes de desactivar |

### 6.6 Reglas de Tipos de Pallet

| ID | Regla | Validación |
|----|-------|------------|
| RN-50 | Código de pallet debe ser único | Validar duplicados |
| RN-51 | Si tipo requiere certificación, NIMF-15 es obligatorio | Regla documental |

### 6.7 Reglas de Usuarios

| ID | Regla | Validación |
|----|-------|------------|
| RN-60 | Email debe ser único | Validar duplicados |
| RN-61 | Contraseña mínimo 8 caracteres | Validar longitud |
| RN-62 | En MVP hay un solo usuario (sin roles) | N/A en esta fase |

---

## 7. Estados y Transiciones v2.0 (Modelo Simplificado)

### 7.1 Estado Documental de Operación

Indica si todos los documentos obligatorios están presentes:

```
        ┌──────────────┐
        │ INCOMPLETA   │  ← Faltan documentos obligatorios
        └──────┬───────┘
               │ Usuario adjunta documentos faltantes
               ▼
        ┌──────────────┐
        │   COMPLETA   │  ← Todos los documentos obligatorios presentes
        └──────────────┘
```

| Estado | Descripción | Visual |
|--------|-------------|--------|
| INCOMPLETA | Faltan uno o más documentos obligatorios | 🔴 Rojo |
| COMPLETA | Todos los documentos obligatorios presentes | 🟢 Verde |

**Transición automática:** El sistema detecta automáticamente cuando se completan todos los documentos.

---

### 7.2 Estado Financiero de Operación

Indica el avance del proceso de facturación y cobro/pago:

```
     ┌───────────┐
     │ PENDIENTE │  ← Sin factura ni pagos
     └─────┬─────┘
           │ Usuario adjunta factura
           ▼
     ┌───────────┐
     │ FACTURADA │  ← Factura emitida, pago pendiente
     └─────┬─────┘
           │ Usuario registra pagos
           ▼
     ┌───────────┐
     │  PAGADA   │  ← Pagos registrados
     └─────┬─────┘
           │ Usuario cierra operación
           ▼
     ┌───────────┐
     │  CERRADA  │  ← Operación finalizada
     └───────────┘
```

| Estado | Descripción | Visual | Acciones permitidas |
|--------|-------------|--------|---------------------|
| PENDIENTE | Sin factura ni pagos | ⚪ Gris | Editar, adjuntar factura |
| FACTURADA | Factura emitida, pago pendiente | 🟡 Amarillo | Registrar pagos |
| PAGADA | Todos los pagos registrados | 🟢 Verde | Cerrar operación |
| CERRADA | Operación completamente finalizada | ✅ Check | Solo consulta |

**Transición manual:** El usuario actualiza el estado según avanza el proceso financiero.

---

### 7.3 Matriz de Estados Combinados

Una operación puede estar en diferentes combinaciones de estados:

| Estado Documental | Estado Financiero | Significa | Acción requerida |
|-------------------|-------------------|-----------|------------------|
| 🔴 INCOMPLETA | ⚪ PENDIENTE | Recién creada | Adjuntar documentos |
| 🟢 COMPLETA | ⚪ PENDIENTE | Docs OK, sin factura | Facturar |
| 🟢 COMPLETA | 🟡 FACTURADA | Docs OK, facturada, sin pagar | Registrar pago |
| 🟢 COMPLETA | 🟢 PAGADA | Docs OK, pagada | Cerrar operación |
| 🟢 COMPLETA | ✅ CERRADA | Todo completo | Ninguna |
| 🔴 INCOMPLETA | 🟡 FACTURADA | Facturada pero faltan docs | ⚠️ Completar docs |

---

### 7.4 Transiciones de Estado

**Estado Documental (automático):**
```python
def calcular_estado_documental(operacion):
    docs_obligatorios = obtener_docs_obligatorios(operacion.tipo, operacion.productos)
    docs_presentes = operacion.documentos.filter(obligatorio=True)
    
    if docs_presentes.count() == docs_obligatorios.count():
        return "COMPLETA"
    else:
        return "INCOMPLETA"
```

**Estado Financiero (manual):**
- Usuario avanza manualmente según el progreso real
- Sistema puede sugerir transición (ej: si hay pagos, sugerir "PAGADA")
- No hay validaciones estrictas (el usuario decide cuándo cerrar)

---

## 8. Requerimientos Funcionales v2.0

### 8.1 Módulo de Operaciones (RF-OP) - CORE

| ID | Requerimiento | Prioridad | Descripción |
|----|---------------|-----------|-------------|
| RF-OP-01 | Crear operación (compra/venta/comisión) | 🔴 Crítica | Formulario unificado con tipo, contacto, productos |
| RF-OP-02 | Editar operación | 🔴 Crítica | Modificar datos básicos, líneas de producto |
| RF-OP-03 | Ver detalle completo de operación | 🔴 Crítica | Vista con documentos, pagos, estados |
| RF-OP-04 | Listar operaciones con filtros | 🔴 Crítica | Filtrar por tipo, fecha, contacto, estado |
| RF-OP-05 | Búsqueda por número de operación | 🟡 Alta | Búsqueda rápida por OP-AAAA-NNNNN |
| RF-OP-06 | Eliminar operación (sin docs/pagos) | 🟢 Media | Solo si no tiene referencias |
| RF-OP-07 | Duplicar operación | 🟢 Media | Crear nueva basada en existente |

### 8.2 Módulo de Documentos (RF-DOC) - CORE

| ID | Requerimiento | Prioridad | Descripción |
|----|---------------|-----------|-------------|
| RF-DOC-01 | Subir documento (PDF/imagen) | 🔴 Crítica | Drag & drop, selección de tipo |
| RF-DOC-02 | Ver documentos de operación | 🔴 Crítica | Listado con tipo, fecha, obligatoriedad |
| RF-DOC-03 | Descargar/visualizar documento | 🔴 Crítica | Abrir PDF en navegador, descargar |
| RF-DOC-04 | Eliminar documento | 🟡 Alta | Solo si operación no está cerrada |
| RF-DOC-05 | Detección automática de docs faltantes | 🔴 Crítica | Mostrar qué documentos faltan |
| RF-DOC-06 | Marcar documento como obligatorio/opcional | 🟢 Media | Configuración por tipo de operación |
| RF-DOC-07 | Validación de tipo y tamaño de archivo | 🔴 Crítica | PDF/JPG/PNG, máx 10 MB |

### 8.3 Módulo de Pagos (RF-PAG) - CORE

| ID | Requerimiento | Prioridad | Descripción |
|----|---------------|-----------|-------------|
| RF-PAG-01 | Registrar pago/cobro | 🔴 Crítica | Tipo, monto, fecha, método, referencia |
| RF-PAG-02 | Ver historial de pagos de operación | 🔴 Crítica | Listado con fecha, monto, tipo |
| RF-PAG-03 | Editar pago | 🟡 Alta | Modificar datos de pago existente |
| RF-PAG-04 | Eliminar pago | 🟡 Alta | Solo si operación no está cerrada |
| RF-PAG-05 | Calcular total pagado/cobrado | 🔴 Crítica | Suma automática de pagos |
| RF-PAG-06 | Registrar pago de flete | 🟡 Alta | Caso especial de pago |

### 8.4 Módulo de Factoring (RF-FAC)

| ID | Requerimiento | Prioridad | Descripción |
|----|---------------|-----------|-------------|
| RF-FAC-01 | Registrar factoring de factura | 🟡 Alta | Empresa, montos, fechas |
| RF-FAC-02 | Ver operaciones factorizadas | 🟡 Alta | Listado de facturas factorizadas |
| RF-FAC-03 | Reporte de factoring utilizado | 🟢 Media | Por período, por empresa |
| RF-FAC-04 | Alertas de vencimiento | 🟢 Media | Facturas próximas a vencer |

### 8.5 Módulo de Dashboard y Alertas (RF-DASH) - CORE

| ID | Requerimiento | Prioridad | Descripción |
|----|---------------|-----------|-------------|
| RF-DASH-01 | Dashboard de pendientes | 🔴 Crítica | Docs faltantes, pagos pendientes, certificados |
| RF-DASH-02 | Resumen de operaciones abiertas | 🔴 Crítica | Contador por estado |
| RF-DASH-03 | Actividad reciente | 🟡 Alta | Últimas operaciones creadas/modificadas |
| RF-DASH-04 | Alertas visuales por prioridad | 🔴 Crítica | 🔴 Urgente, 🟡 Atención, 🟢 OK |
| RF-DASH-05 | Accesos rápidos | 🟡 Alta | Botones para crear nueva operación |

### 8.6 Módulo de Guías (Registro)

| ID | Requerimiento | Prioridad | Descripción |
|----|---------------|-----------|-------------|
| RF-GUIA-01 | Registrar guía de tercero/proveedor | 🔴 Crítica | Ingresar número, fecha, transporte |
| RF-GUIA-02 | Capturar datos de transporte | 🟡 Alta | Nombre chofer, RUT y patente (según muestra) |
| RF-GUIA-03 | Asociar guía a operación existente | 🔴 Crítica | Vínculo N:1 entre guías y operación |
| RF-GUIA-04 | Adjuntar imagen/PDF de la guía | 🔴 Crítica | Registro visual del documento físico |

### 8.7 Módulo de Contactos (RF-CONT)

| ID | Requerimiento | Prioridad | Descripción |
|----|---------------|-----------|-------------|
| RF-CONT-01 | Listar proveedores y clientes | 🟡 Alta | Lista unificada con filtros |
| RF-CONT-02 | Crear proveedor/cliente | 🟡 Alta | RUT, razón social, datos de contacto |
| RF-CONT-03 | Editar contacto | 🟡 Alta | Modificar datos existentes |
| RF-CONT-04 | Activar/desactivar contacto | 🟢 Media | No eliminar, solo desactivar |
| RF-CONT-05 | Ver operaciones de contacto | 🟡 Alta | Historial de operaciones |
| RF-CONT-06 | Validación de RUT | 🟡 Alta | Dígito verificador, unicidad |

### 8.8 Módulo de Productos (RF-PROD)

| ID | Requerimiento | Prioridad | Descripción |
|----|---------------|-----------|-------------|
| RF-PROD-01 | Listar tipos de pallet | 🟡 Alta | PV, PR, PC |
| RF-PROD-02 | Crear tipo de pallet | 🟢 Baja | Para futuros productos |
| RF-PROD-03 | Configurar si requiere certificación | 🟡 Alta | NIMF-15 obligatorio |

### 8.9 Módulo de Reportes (RF-REP)

| ID | Requerimiento | Prioridad | Descripción |
|----|---------------|-----------|-------------|
| RF-REP-01 | Reporte de operaciones por período | 🟡 Alta | Compras y ventas, filtros por fecha |
| RF-REP-02 | Reporte de pendientes | 🔴 Crítica | Documentos y pagos pendientes |
| RF-REP-03 | Reporte de operaciones por contacto | 🟡 Alta | Historial con proveedor/cliente |
| RF-REP-04 | Trazabilidad por número de operación | 🟡 Alta | Documentos, pagos, historial |
| RF-REP-05 | Exportar a Excel/CSV | 🟢 Media | Descargar reportes |

### 8.10 Módulo de Autenticación (RF-AUTH)

| ID | Requerimiento | Prioridad | Descripción |
|----|---------------|-----------|-------------|
| RF-AUTH-01 | Login con email y contraseña | 🔴 Crítica | Autenticación básica |
| RF-AUTH-02 | Logout | 🔴 Crítica | Cerrar sesión |
| RF-AUTH-03 | Cambiar contraseña | 🟡 Alta | Usuario puede cambiar su contraseña |
| RF-AUTH-04 | Recordar sesión | 🟢 Media | "Mantener sesión iniciada" |

---

## 9. Requerimientos No Funcionales

### 9.1 Rendimiento (RNF-PERF)

| ID | Requerimiento | Métrica |
|----|---------------|---------|
| RNF-PERF-01 | Tiempo de carga de pantallas principales | < 2 segundos |
| RNF-PERF-02 | Tiempo de respuesta de búsquedas | < 1 segundo |
| RNF-PERF-03 | Soporte de usuarios concurrentes | Mínimo 5 simultáneos |

### 9.2 Disponibilidad (RNF-DISP)

| ID | Requerimiento | Métrica |
|----|---------------|---------|
| RNF-DISP-01 | Disponibilidad del sistema | 99% en horario laboral (Lun-Vie 8-20h) |
| RNF-DISP-02 | Backup de datos | Diario, retención 30 días |

### 9.3 Seguridad (RNF-SEG)

| ID | Requerimiento | Descripción |
|----|---------------|-------------|
| RNF-SEG-01 | Autenticación | Login obligatorio para todas las operaciones |
| RNF-SEG-02 | Autorización | Control de acceso basado en roles |
| RNF-SEG-03 | Contraseñas | Almacenamiento con hash seguro (bcrypt) |
| RNF-SEG-04 | Sesiones | Expiración automática por inactividad (30 min) |
| RNF-SEG-05 | HTTPS | Todo el tráfico encriptado |
| RNF-SEG-06 | Auditoría | Log de acciones críticas (creación, modificación, anulación) |

### 9.4 Usabilidad (RNF-USA)

| ID | Requerimiento | Descripción |
|----|---------------|-------------|
| RNF-USA-01 | Responsive | Funcional en desktop y tablet |
| RNF-USA-02 | Navegadores | Chrome, Firefox, Edge (últimas 2 versiones) |
| RNF-USA-03 | Interfaz | Simple, mínima curva de aprendizaje |
| RNF-USA-04 | Feedback | Mensajes claros de éxito/error |
| RNF-USA-05 | Atajos | Navegación rápida entre módulos relacionados |

### 9.5 Mantenibilidad (RNF-MAN)

| ID | Requerimiento | Descripción |
|----|---------------|-------------|
| RNF-MAN-01 | Código | Documentado y con convenciones claras |
| RNF-MAN-02 | Base de datos | Migraciones versionadas |
| RNF-MAN-03 | Configuración | Variables de entorno para diferentes ambientes |
| RNF-MAN-04 | Logs | Registro de errores accesible |

### 9.6 Escalabilidad (RNF-ESC)

| ID | Requerimiento | Descripción |
|----|---------------|-------------|
| RNF-ESC-01 | Volumen de datos | Soportar 10,000+ órdenes sin degradación |
| RNF-ESC-02 | Arquitectura | Preparada para agregar módulos sin reescribir |

---

## 10. Supuestos y Decisiones de Diseño v2.1

### 10.1 Hechos Confirmados con el Cliente

| ID | Hecho | Impacto en diseño |
|----|-------|-------------------|
| ✅ HC-01 | **Cliente busca orden y certeza, no optimización** | Sistema simple enfocado en pendientes y alertas |
| ✅ HC-02 | **No quiere análisis complejo ni dashboards sofisticados** | Dashboard minimalista, reportes simples |
| ✅ HC-03 | **Excel funciona para registrar, pero no avisa ni conecta** | Sistema debe alertar y vincular documentos |
| ✅ HC-04 | **Sistema personal, no colaborativo (por ahora)** | Usuario único, sin roles |
| ✅ HC-05 | **Prefiere modelo mental único (todo es "operación")** | No distinguir visualmente compras/ventas |
| ✅ HC-06 | **Todo pasa por documentos** | Control documental es el corazón del sistema |
| ✅ HC-07 | **No hay bodega física** | Modelo de intermediación se mantiene |
| ✅ HC-08 | **Pagos y factoring son importantes** | Módulo financiero básico incluido |
| ✅ HC-09 | **Acepta informalidad actual** | Sistema debe poner estructura gradualmente |
| ✅ HC-10 | **No es un sistema de contabilidad** | Control operativo, no contable |
| ✅ HC-11 | **No se emitirán guías desde el sistema** | Solo registro de guías externas |

### 10.2 Decisiones de Diseño Tomadas v2.1

| ID | Decisión | Alternativa descartada | Justificación |
|----|----------|----------------------|---------------|
| 🔵 DEC-01 | **Entidad "Operacion" unificada** | Separar Compras/Ventas/Comisiones | Cliente quiere modelo mental único |
| 🔵 DEC-02 | **Estados: Documental + Financiero** | Estados complejos con muchas transiciones | Simplicidad, claridad |
| 🔵 DEC-03 | **Documentos como entidad central** | Documentos embebidos en operaciones | Permite control granular |
| 🔵 DEC-04 | **Alertas automáticas de pendientes** | Usuario busca manualmente | Valor principal del sistema |
| 🔵 DEC-05 | **Usuario único sin roles (MVP)** | Multiusuario desde inicio | Confirmado por cliente |
| 🔵 DEC-06 | **Dashboard centrado en pendientes** | Dashboard con KPIs y gráficos | Cliente busca saber "qué falta" |
| 🔵 DEC-07 | **Pagos y factoring incluidos** | Solo documentos | Cliente necesita control financiero básico |
| 🔵 DEC-08 | **No hay validaciones estrictas** | Bloqueos por reglas de negocio | Cliente acepta flexibilidad |
| 🔵 DEC-09 | **Reportes simples, no BI** | Reportes avanzados con gráficos | Cliente no los necesita |
| 🔵 DEC-10 | **Móvil no es prioridad** | Mobile-first | Uso principal desde computador |
| 🔵 DEC-11 | **Cierre con observación obligatoria** | Cierre con un solo click | Trazabilidad de por qué se cerró |
| 🔵 DEC-12 | **Captura de datos de transporte** | Solo subir foto de guía | Necesario para trazabilidad de quién movió qué |

### 10.3 Simplificaciones Importantes vs v1.0

| Aspecto | v1.0 (anterior) | v2.0 (actual) | Impacto |
|---------|-----------------|---------------|---------|
| Entidades principales | OrdenCompra, OrdenVenta, GuiaDespacho | Operacion (unificada) | -60% complejidad modelo |
| Estados | 7+ estados diferentes | 2 estados simples (Documental + Financiero) | Más fácil de entender |
| Usuarios | Admin + Operador con permisos | Usuario único | Sin gestión de roles |
| Dashboard | Stock, disponibilidad, KPIs | Pendientes y alertas | Enfoque en acción |
| Trazabilidad | Compra→Venta vinculada | Operación autocontenida | Menos relaciones |
| Guías | Entidad separada compleja | Documento adjunto | Simplificación |
| Reportes | 6+ reportes complejos | 3-4 reportes simples | Menos desarrollo |

### 10.4 Consecuencias de las Decisiones

**Ventajas:**
- ✅ Desarrollo más rápido (3-4 semanas vs 8-9 semanas)
- ✅ Más fácil de usar y aprender
- ✅ Menos código = menos bugs
- ✅ Alineado con necesidad real del cliente

**Trade-offs aceptados:**
- ⚠️ No hay control fino de "disponibilidad comercial" (compras vs ventas)
- ⚠️ Trazabilidad proveedor→cliente es manual (no automática)
- ⚠️ No hay flujos de trabajo automáticos (estados manuales)
- ⚠️ Reportes simples (no análisis avanzado)

**Justificación:** El cliente confirmó que **no necesita** esas funcionalidades avanzadas en esta fase.

---

## 11. Riesgos y Preguntas Abiertas v2.0

### 11.1 Riesgos Identificados

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|----|--------|--------------|---------|------------|
| 🔴 RSK-01 | Usuario no adopta el sistema y vuelve a Excel | Media | Alto | UI extremadamente simple, valor inmediato (alertas), migración gradual |
| 🟡 RSK-02 | Requisitos adicionales emergen durante uso | Media | Medio | Arquitectura flexible, desarrollo iterativo |
| 🟡 RSK-03 | Documentos históricos no se digitalizan | Alta | Bajo | Fecha de corte, solo operaciones nuevas |
| 🟢 RSK-04 | Conectividad intermitente | Baja | Bajo | Aplicación web responsive, funciona en red local |
| 🟡 RSK-05 | Pérdida de documentos físicos/digitales | Media | Medio | Backup diario, múltiples copias |
| 🟢 RSK-06 | Cambio de proceso operativo del negocio | Baja | Alto | Sistema flexible, fácil de ajustar |

### 11.2 Preguntas Resueltas ✅

Las siguientes preguntas de v1.0 fueron **resueltas con el cliente**:

| ID | Pregunta | Respuesta |
|----|----------|-----------|
| ✅ QA-01 | ¿Existe bodega física propia? | **No, entrega directa proveedor→cliente** |
| ✅ QA-02 | ¿Cuántos usuarios usarán el sistema? | **Uno (por ahora)** |
| ✅ QA-03 | ¿Se necesitan roles diferenciados? | **No, usuario único** |
| ✅ QA-04 | ¿Se requiere distinguir tipos de negocio visualmente? | **No, todo es "operación"** |
| ✅ QA-05 | ¿Se requiere análisis financiero avanzado? | **No, solo control básico** |
| ✅ QA-06 | ¿Se requiere mobile-first? | **No, uso principal desde computador** |
| ✅ QA-07 | ¿Se necesitan reportes complejos? | **No, reportes simples suficientes** |

### 11.3 Preguntas Pendientes ⏳

Preguntas que pueden esperar hasta las primeras iteraciones de uso:

| ID | Pregunta | Área | Prioridad | Cuándo resolverla |
|----|----------|------|-----------|-------------------|
| ⏳ QA-10 | ¿Qué formato legal debe tener una guía propia emitida por FSL? | Legal | Media | Si el cliente necesita emitir guías propias |
| ⏳ QA-11 | ¿Existe correlativo actual de operaciones que deba continuarse? | Operación | Baja | Antes de go-live |
| ⏳ QA-12 | ¿Se manejan devoluciones? | Operación | Baja | Si surge el caso en uso real |
| ⏳ QA-13 | ¿Hay entregas parciales frecuentes? | Operación | Baja | Observar durante primeras semanas |
| ⏳ QA-14 | ¿Cómo se coordina actualmente con proveedores? | Operación | Baja | Informativo, no bloqueante |

### 11.4 Supuestos Asumidos (OK proceder)

Los siguientes supuestos se asumen como válidos. Si son incorrectos, se ajustará en fases posteriores:

| ID | Supuesto | Riesgo si es incorrecto |
|----|----------|------------------------|
| SUP-01 | Los precios son informativos (no se calculan márgenes automáticos) | Bajo - se puede agregar después |
| SUP-02 | Volumen es bajo-medio (< 50 operaciones/mes) | Bajo - arquitectura escala bien |
| SUP-03 | No hay flujos de aprobación (todo es directo) | Bajo - se puede agregar workflow |
| SUP-04 | Pallets certificados requieren NIMF-15 | Bajo - se ajusta configuración |
| SUP-05 | Una operación tiene un documento de cada tipo | Bajo - se permite múltiples si se necesita |

---

## 12. Extensiones Futuras v2.0

Las siguientes funcionalidades están **fuera del alcance del MVP** pero pueden agregarse según necesidad:

### 12.1 Corto Plazo (según uso real)

| Extensión | Descripción | Esfuerzo | Trigger |
|-----------|-------------|----------|---------|
| **Multiusuario con roles** | Admin/Operador con permisos diferenciados | Bajo | Si se incorpora personal |
| **Notificaciones por email** | Alertas automáticas de pendientes | Bajo | Si usuario lo solicita |
| **Búsqueda avanzada** | Filtros combinados, búsqueda full-text | Medio | Si volumen de operaciones crece |
| **Reportes con gráficos** | Visualizaciones de tendencias | Medio | Si usuario necesita análisis visual |
| **Historial de cambios** | Auditoría de modificaciones | Bajo | Si se requiere trazabilidad de cambios |

### 12.2 Mediano Plazo (si negocio evoluciona)

| Extensión | Descripción | Esfuerzo | Trigger |
|-----------|-------------|----------|---------|
| **Portal de clientes** | Clientes consultan sus operaciones online | Alto | Si clientes lo solicitan |
| **App móvil** | Registro de operaciones desde terreno | Alto | Si operación se hace en terreno |
| **Integración contable** | Exportar a sistema contable | Medio | Si se quiere automatizar contabilidad |
| **Flujos de aprobación** | Workflow con aprobaciones | Medio | Si se requiere control interno |
| **Bodega física** | Si FSL abre bodega propia | Alto | Cambio de modelo de negocio |

### 12.3 Largo Plazo (expansión)

| Extensión | Descripción | Esfuerzo | Trigger |
|-----------|-------------|----------|---------|
| **Multi-empresa** | Varias empresas en mismo sistema | Alto | Si FSL crea/adquiere otras empresas |
| **BI avanzado** | Análisis predictivo, ML | Muy Alto | Si se requiere optimización avanzada |
| **API pública** | Integraciones con terceros | Medio | Si se requiere conectar otros sistemas |

### 12.4 Ideas para Validar con Cliente

Funcionalidades que podrían agregar valor pero deben validarse:

- ⏸️ **Recordatorios automáticos** de documentos próximos a vencer
- ⏸️ **Plantillas de operaciones** para crear rápidamente operaciones similares
- ⏸️ **Escaneo con móvil** para subir documentos desde el teléfono
- ⏸️ **Firma digital** de documentos dentro del sistema
- ⏸️ **Chat interno** para coordinar entregas (¿necesario si es un usuario?)
- ⏸️ **Geolocalización** de entregas (¿valor real?)

---

## 13. Glosario v2.0

| Término | Definición |
|---------|------------|
| **FSL** | Forestal Santa Lucía SpA |
| **Operación** | Entidad central que representa cualquier transacción comercial (compra/venta/comisión) |
| **Estado Documental** | Indica si todos los documentos obligatorios están presentes (INCOMPLETA/COMPLETA) |
| **Estado Financiero** | Indica el avance financiero (PENDIENTE/FACTURADA/PAGADA/CERRADA) |
| **Documento** | Archivo adjunto a una operación (OC, guía, factura, certificado, etc.) |
| **Documento Obligatorio** | Documento requerido para considerar una operación completa |
| **Pallet** | Plataforma de madera utilizada para transportar mercancías |
| **Pallet Verde (PV)** | Pallet de madera sin tratamiento |
| **Pallet Rústico (PR)** | Pallet de madera con acabado básico |
| **Pallet Certificado (PC)** | Pallet con tratamiento fitosanitario certificado (NIMF-15) |
| **NIMF-15** | Norma Internacional para Medidas Fitosanitarias (tratamiento de madera para exportación) |
| **RUT** | Rol Único Tributario (identificador fiscal chileno) |
| **Factoring** | Operación financiera donde se adelanta el cobro de una factura |
| **Comisión** | Porcentaje o monto que FSL cobra por intermediar una venta entre proveedor y cliente |
| **Pendiente** | Algo que falta o no está completo (documento, pago, certificado) |
| **Alerta** | Notificación visual de que algo requiere atención |
| **Trazabilidad** | Capacidad de seguir el historial completo de una operación |
| **Dashboard** | Pantalla principal con resumen de pendientes y actividad |
| **Modelo de Intermediación** | FSL compra y vende sin almacenar; proveedor entrega directo al cliente |
| **Entrega Directa** | Proveedor despacha mercadería directamente al cliente final de FSL |
| **Control Documental** | Proceso de verificar que todos los documentos estén presentes |
| **Control Financiero** | Proceso de verificar facturación y pagos |

---

## Anexo A: Wireframes v2.0 (Descripción Textual)

### A.1 Dashboard Principal - Enfoque en Pendientes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🌲 Forestal Santa Lucía                             [Usuario] [Salir]      │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Operaciones] [Contactos] [Reportes]                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   🔴 REQUIEREN ATENCIÓN (8)                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ 📄 5 operaciones con documentos faltantes                               ││
│  │    • OP-2026-00123 - Falta Guía de Recepción                           ││
│  │    • OP-2026-00124 - Falta Certificado NIMF-15                         ││
│  │    • OP-2026-00125 - Falta Factura                                     ││
│  │    [Ver todas →]                                                        ││
│  │                                                                         ││
│  │ 💰 3 operaciones con pagos pendientes                                   ││
│  │    • OP-2026-00120 - Pago a proveedor ($2.500.000)                     ││
│  │    • OP-2026-00121 - Cobro a cliente ($3.200.000)                      ││
│  │    [Ver todas →]                                                        ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│   ✅ TODO EN ORDEN (15)                  📊 ÚLTIMOS 30 DÍAS                 │
│  ┌───────────────────────┐              ┌─────────────────────────────────┐│
│  │ 15 operaciones cerradas│              │ 23 operaciones creadas         ││
│  │ sin pendientes         │              │ 18 cerradas                    ││
│  │                        │              │ 5 abiertas                     ││
│  └───────────────────────┘              └─────────────────────────────────┘│
│                                                                             │
│   ⚡ ACCIONES RÁPIDAS                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ [+ Nueva Compra]  [+ Nueva Venta]  [+ Venta con Comisión]              ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### A.2 Lista de Operaciones (Unificada)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  OPERACIONES                                            [+ Nueva Operación] │
├─────────────────────────────────────────────────────────────────────────────┤
│  Buscar: [__________]  Tipo: [Todas ▼]  Contacto: [Todos ▼]  [Filtrar]     │
├─────────────────────────────────────────────────────────────────────────────┤
│  # Operación   │ Tipo   │ Contacto        │ Docs │ Pagos │ Acciones        │
│  ──────────────┼────────┼─────────────────┼──────┼───────┼─────────────────│
│  OP-2026-00125 │ VENTA  │ Cermaq          │ 🔴 2/3│ 🟡    │ [Ver Detalle]   │
│  OP-2026-00124 │ COMPRA │ F. Andes        │ 🟢 3/3│ 🟢    │ [Ver Detalle]   │
│  OP-2026-00123 │ COMIS. │ Invermar        │ 🔴 1/3│ ⚪    │ [Ver Detalle]   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Mostrando 1-10 de 48                              [< Anterior] [Siguiente >]│
└─────────────────────────────────────────────────────────────────────────────┘
```

### A.3 Detalle de Operación

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  OPERACIÓN OP-2026-00125                              [Editar] [Eliminar]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📋 INFORMACIÓN GENERAL                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Tipo: Venta Directa          Fecha: 08/01/2026                         ││
│  │ Cliente: Cermaq               Dirección: Puerto Montt                  ││
│  │                                                                         ││
│  │ Productos:                                                              ││
│  │ • Pallet Verde: 200 unidades @ $2.500 c/u                              ││
│  │ • Pallet Certificado: 50 unidades @ $3.000 c/u                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  📄 DOCUMENTOS (🔴 2/3 obligatorios presentes)               [+ Adjuntar]   │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ ✅ Guía de Despacho - GD-12345 (08/01/2026)          [Ver] [Eliminar]  ││
│  │ ✅ Factura - F-00234 (08/01/2026)                     [Ver] [Eliminar]  ││
│  │ ❌ Certificado NIMF-15 (Obligatorio - falta)                            ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  💰 PAGOS (🟡 Facturada, pago pendiente)                  [+ Registrar Pago]│
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Estado: FACTURADA                                                       ││
│  │ Total facturado: $650.000                                               ││
│  │ Total cobrado: $0                                                       ││
│  │                                                                         ││
│  │ • Factoring: No registrado                           [Registrar →]     ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  [Cerrar Operación]                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### A.4 Formulario Nueva Operación

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  NUEVA OPERACIÓN                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Tipo de operación:                                                         │
│  ◉ Compra     ○ Venta Directa     ○ Venta con Comisión                     │
│                                                                             │
│  Proveedor: [Seleccionar... ▼]           Fecha: [2026-01-12]               │
│                                                                             │
│  ─── PRODUCTOS ─────────────────────────────────────────────────────────────│
│  │ Tipo Pallet          │ Cantidad │ Precio Unit. │ Acción                ││
│  │ [Pallet Verde ▼]     │ [___200] │ [____2.000]  │ [X]                   ││
│  [+ Agregar línea]                                                          │
│                                                                             │
│  Observaciones: [_______________________________________________________]   │
│                                                                             │
│                                           [Cancelar]  [Crear Operación]     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Anexo B: Propuesta de Stack Tecnológico v2.0

> **Nota v2.0:** Con el modelo simplificado, el stack puede ser más liviano. Prioridad en rapidez de desarrollo y simplicidad.

### B.1 Opción Recomendada: Next.js Full-Stack (TypeScript)

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| Frontend | **Next.js 14** App Router | SSR, routing file-based, full-stack en un proyecto |
| UI Components | **shadcn/ui** + Tailwind CSS | Componentes modernos, rápido desarrollo |
| Estado | **React Query (TanStack)** | Caché automático, sincronización servidor |
| Backend | **Next.js API Routes** | API y UI en mismo proyecto |
| ORM | **Prisma** | Type-safe, migraciones automáticas |
| Base de Datos | **PostgreSQL** | Relacional, robusto, gratis (Supabase/Railway) |
| Autenticación | **NextAuth.js v5** | Simple, integrado |
| Storage (docs) | **Supabase Storage** o S3 | Escalable, económico |
| Hosting | **Vercel** (free tier) | Deploy automático, zero config |

**Ventajas para este proyecto:**
- ✅ Un solo proyecto (frontend + backend)
- ✅ TypeScript end-to-end (menos errores)
- ✅ Deploy en minutos
- ✅ Escalable si crece

**Estimación MVP:** 3-4 semanas

---

### B.2 Opción Alternativa: Python + HTMX (Si prefiere Python)

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| Backend | **FastAPI** | Rápido, moderno, tipado con Pydantic |
| Frontend | **HTMX** + Jinja2 | HTML dinámico sin JavaScript complejo |
| ORM | **SQLAlchemy** + Alembic | Maduro, flexible |
| Base de Datos | **PostgreSQL** | Mismo que opción A |
| UI | **Tailwind CSS** + DaisyUI | Componentes pre-hechos |
| Storage | **Local filesystem** o S3 | Simple o escalable |
| Hosting | **VPS** (DigitalOcean/Linode) | Control total |

**Ventajas para este proyecto:**
- ✅ Extremadamente simple
- ✅ Menos JavaScript (HTMX es mágico)
- ✅ Python es más común en Chile

**Estimación MVP:** 3-4 semanas

---

### B.3 Decisión Recomendada

**Next.js** es la opción recomendada para este proyecto porque:

1. **Comunidad activa** - Muchos recursos y librerías
2. **Experiencia de usuario moderna** - Sin recargas de página
3. **Productividad** - Componentes reutilizables
4. **Escalabilidad** - Fácil agregar funcionalidades futuras

Pero si el equipo prefiere **Python**, la opción HTMX es excelente y cumple perfectamente.

---

## Historial de Versiones

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-09 | Arquitectura | Documento inicial con modelo de intermediación |
| 1.1 | 2026-01-09 | Arquitectura | Confirmación modelo sin bodega física |
| 2.0 | 2026-01-12 | Arquitectura | Rediseño completo: Operaciones unificadas |
| **2.1** | **2026-01-12** | **Arquitectura** | **Alcance 100% Cerrado:** <br>• Correlativo inicia en OP-2026-00001 <br>• Cierre requiere observación obligatoria <br>• Se elimina impresión de guías (solo registro) <br>• Captura de datos de transporte (Chofer/Patente) <br>• Validación de supuestos operativos |

---

## Resumen de Cambios v2.0

### Lo que cambió fundamentalmente:

**Filosofía:**
- ❌ v1.0: Sistema de gestión operativa con trazabilidad compleja
- ✅ v2.0: Sistema de **control y certeza** - "¿Qué falta?"

**Modelo de datos:**
- ❌ v1.0: OrdenCompra, OrdenVenta, GuiaDespacho (entidades separadas)
- ✅ v2.0: **Operacion** (entidad unificada) + Documentos + Pagos

**Experiencia de usuario:**
- ❌ v1.0: Módulos separados (Compras/Ventas/Guías/Stock)
- ✅ v2.0: Todo es **Operación**, dashboard de **pendientes**

**Complejidad:**
- ❌ v1.0: 7+ estados, 5+ roles, cálculo de disponibilidad, flujos complejos
- ✅ v2.0: 2 estados simples, 1 usuario, flujo lineal

**Tiempo estimado de desarrollo:**
- v1.0: 8-9 semanas
- v2.0: 3-4 semanas ✅

---

**FIN DEL DOCUMENTO**

---

> **Estado:** Este documento está **validado** con las necesidades reales del cliente. Representa un MVP accionable y de alto valor. Las preguntas pendientes en sección 11.3 no son bloqueantes para iniciar desarrollo.

