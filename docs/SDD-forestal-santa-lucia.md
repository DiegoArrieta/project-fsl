# SDD - Spec Driven Development Document
## Sistema de Gestión Operativa - Forestal Santa Lucía SpA

**Versión:** 3.3  
**Fecha:** 2026-01-27  
**Estado:** MVP 95% Completo - Dashboard y Alertas Implementadas  

**Cambios v3.3:**
- ✅ Agregada entidad `Empresa` para representar organizaciones (proveedores, clientes, transportistas, etc.)
- ✅ Agregada entidad `Evento` para representar eventos logísticos u operativos
- ✅ Agregada entidad `Entrega` con relación a `Evento` y `Empresa`
- ✅ Actualizado modelo de dominio y diagramas de relaciones

**Cambios v3.2:**
- ✅ Una operación puede tener 1 o más proveedores (relación N:M)
- ✅ Tabla intermedia `operacion_proveedor` para relación muchos a muchos
- ✅ Eliminado campo `proveedor_id` de `operacion`  
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
- **Cliente realiza orden de compra a FSL** - El cliente solicita pallets mediante una orden de compra dirigida a FSL
- **FSL genera órdenes de compra a proveedores** - Una vez recibida la OC del cliente, FSL solicita los pallets a sus proveedores mediante sus propias órdenes de compra
- **FSL opera como intermediario** - Registra en una **operación unificada** tanto la venta al cliente como la compra al proveedor
- **Los pallets viajan directamente del proveedor al cliente final** (sin bodega FSL)
- FSL no mantiene stock físico propio

**Flujo operativo típico:**
1. Cliente emite orden de compra a FSL
2. FSL crea **una operación unificada** que contiene:
   - **Venta al cliente**: OC del cliente, precios de venta, cobro al cliente
   - **Compra al proveedor**: OC generada por FSL, costos de compra, pago al proveedor
3. FSL genera órdenes de compra (PDF) a los proveedores necesarios
4. Proveedores despachan directamente al cliente final
5. FSL gestiona documentos, pagos (cobros y pagos) y trazabilidad en la misma operación

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
2. **Genera órdenes de compra** a proveedores con número secuencial y PDF profesional
3. **Asocia documentos** a cada operación (OC, guías, facturas, certificados)
4. **Detecta y alerta** documentos faltantes automáticamente
5. **Controla pagos** (clientes, proveedores, fletes, factoring)
6. **Muestra pendientes** de forma clara y accionable

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
| **Órdenes de Compra** | Generación de OC a proveedores con número secuencial y PDF |
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
| Envío automático de OC por email | PDF se descarga manualmente para envío |

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

### 4.1 Filosofía del Modelo v2.5 (Operación Unificada)

**Cambio fundamental:** El sistema maneja **operaciones unificadas** que integran tanto la venta al cliente como la compra al proveedor en una sola entidad. Una operación comercial contiene:

- Tipo interno (compra/venta/comisión)
- **Cliente** (destinatario de la venta)
- **Proveedor** (origen de la compra) - presente en operaciones de venta
- **OC del Cliente** (orden de compra que el cliente emitió a FSL)
- **OC Generada** (orden de compra que FSL emite al proveedor)
- **Precios de venta** (al cliente)
- **Costos de compra** (al proveedor)
- **Márgenes calculados** automáticamente
- Documentos asociados
- Estado documental
- Estado financiero

**Principio clave:** Una operación de venta incluye automáticamente la compra asociada. No hay operaciones de compra separadas para ventas; todo está unificado.

El usuario ve **operaciones completas** con toda la información de venta y compra en un solo lugar.

### 4.2 Entidades Principales

#### **Operacion**
Entidad central unificada que representa una transacción comercial completa, incluyendo tanto la venta al cliente como la compra al proveedor.

| Atributo | Tipo | Requerido | Descripción |
|----------|------|-----------|-------------|
| id | UUID | Sí | Identificador único |
| numero | String | Sí | Número correlativo (OP-AAAA-NNNNN) |
| tipo | Enum | Sí | COMPRA, VENTA_DIRECTA, VENTA_COMISION |
| fecha | Date | Sí | Fecha de la operación |
| proveedores | Array[UUID] | Condicional | Requerido al menos 1 proveedor si tipo=COMPRA o VENTA_*. Una operación puede tener múltiples proveedores (relación N:M) |
| cliente_id | UUID | Condicional | Requerido si tipo=VENTA_* |
| estado_documental | Enum | Sí | INCOMPLETA, COMPLETA |
| estado_financiero | Enum | Sí | PENDIENTE, FACTURADA, PAGADA, CERRADA |
| direccion_entrega | String | No | Dirección de entrega |
| orden_compra_cliente | String | No | Número de orden de compra del cliente (para operaciones de venta) |
| orden_compra_fsl_id | UUID | No | Referencia a la OC generada por FSL al proveedor (si aplica) |
| observaciones | Text | No | Notas generales |
| created_at | Timestamp | Sí | Fecha de creación |
| updated_at | Timestamp | Sí | Última modificación |

#### **OperacionLinea**
Detalle de productos en una operación (múltiples tipos de pallet). En operaciones unificadas de venta, contiene tanto precios de venta como costos de compra.

| Atributo | Tipo | Requerido | Descripción |
|----------|------|-----------|-------------|
| id | UUID | Sí | Identificador único |
| operacion_id | UUID | Sí | Referencia a la operación |
| tipo_pallet_id | UUID | Sí | Tipo de pallet |
| cantidad | Integer | Sí | Cantidad solicitada original |
| precio_unitario | Decimal | No | Precio por unidad (venta o compra según tipo de operación) |
| precio_venta_unitario | Decimal | No | Precio de venta por unidad (al cliente) - solo para operaciones de venta |
| precio_compra_unitario | Decimal | No | Precio de compra por unidad (al proveedor) - solo para operaciones de venta |
| cantidad_entregada | Integer | Sí | Cantidad efectivamente recibida conforme |
| cantidad_danada | Integer | Sí | Cantidad de pallets dañados o rechazados |

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

#### **OrdenCompra**
Orden de compra generada por FSL dirigida a un proveedor.

| Atributo | Tipo | Requerido | Descripción |
|----------|------|-----------|-------------|
| id | UUID | Sí | Identificador único |
| numero | String | Sí | Número correlativo (OC-AAAA-NNNNN) |
| proveedor_id | UUID | Sí | Proveedor destinatario |
| fecha | Date | Sí | Fecha de la orden |
| fecha_entrega | Date | No | Fecha esperada de entrega |
| direccion_entrega | String | No | Dirección de entrega |
| observaciones | Text | No | Notas generales |
| operacion_id | UUID | No | Operación asociada (si aplica) |
| estado | Enum | Sí | BORRADOR, ENVIADA, RECIBIDA, CANCELADA |
| pdf_generado | Boolean | Sí | Si se ha generado el PDF |
| pdf_url | String | No | Ruta del PDF generado |
| created_at | Timestamp | Sí | Fecha de creación |
| updated_at | Timestamp | Sí | Última modificación |

#### **OrdenCompraLinea**
Líneas de productos de una orden de compra.

| Atributo | Tipo | Requerido | Descripción |
|----------|------|-----------|-------------|
| id | UUID | Sí | Identificador único |
| orden_compra_id | UUID | Sí | Referencia a la orden de compra |
| tipo_pallet_id | UUID | Sí | Tipo de pallet |
| cantidad | Integer | Sí | Cantidad solicitada |
| precio_unitario | Decimal | No | Precio por unidad (opcional) |
| descripcion | String | No | Descripción adicional |

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

#### **Empresa**
Entidad que representa organizaciones que interactúan con el sistema (proveedores, clientes, transportistas, etc.). Permite reutilización y unificación de información de empresas.

| Atributo | Tipo | Requerido | Descripción |
|----------|------|-----------|-------------|
| id | UUID | Sí | Identificador único |
| nombre | String | Sí | Nombre de la empresa |
| rut | String | Sí | RUT o identificador legal (formato: `12345678-9`) |
| tipo_empresa | Enum | Sí | PROVEEDOR, CLIENTE, TRANSPORTISTA, OTRO |
| contacto | String | No | Información de contacto principal |
| direccion | String | No | Dirección física |
| telefono | String | No | Teléfono de contacto |
| email | String | No | Email de contacto |
| estado | Enum | Sí | ACTIVA, INACTIVA |
| created_at | Timestamp | Sí | Fecha de creación |
| updated_at | Timestamp | Sí | Última modificación |

> **Nota v3.3:** La entidad `Empresa` unifica la representación de organizaciones. Las entidades `Proveedor` y `Cliente` pueden referenciar a `Empresa` mediante `empresa_id` para mantener consistencia y evitar duplicación de información.

#### **Evento**
Entidad que representa eventos logísticos u operativos dentro del sistema. Los eventos pueden contener múltiples entregas.

| Atributo | Tipo | Requerido | Descripción |
|----------|------|-----------|-------------|
| id | UUID | Sí | Identificador único |
| numero | String | Sí | Número identificador del evento |
| tipo | Enum | Sí | ENTREGA, RECEPCION, TRASLADO, OTRO |
| fecha_inicio | Date | Sí | Fecha de inicio del evento |
| fecha_fin | Date | No | Fecha de finalización del evento |
| ubicacion | String | No | Ubicación donde ocurre el evento |
| descripcion | Text | No | Descripción del evento |
| estado | Enum | Sí | PLANIFICADO, EN_CURSO, COMPLETADO, CANCELADO |
| operacion_id | UUID | No | Operación asociada (si aplica) |
| created_at | Timestamp | Sí | Fecha de creación |
| updated_at | Timestamp | Sí | Última modificación |

> **Nota v3.3:** Los eventos permiten agrupar entregas relacionadas y proporcionar contexto operativo para las actividades logísticas.

#### **Entrega**
Entidad que representa el acto de entrega de productos o recursos dentro del sistema. Las entregas ocurren dentro de eventos.

| Atributo | Tipo | Requerido | Descripción |
|----------|------|-----------|-------------|
| id | UUID | Sí | Identificador único |
| evento_id | UUID | Sí | Evento al que pertenece la entrega |
| empresa_id | UUID | Sí | Empresa que realiza la entrega |
| empresa_receptora_id | UUID | No | Empresa que recibe la entrega (si aplica) |
| fecha_hora | Timestamp | Sí | Fecha y hora de la entrega |
| tipo_entrega | Enum | Sí | COMPLETA, PARCIAL, DEVOLUCION, OTRO |
| descripcion | Text | No | Descripción de la entrega |
| cantidad | Decimal | Sí | Cantidad entregada |
| unidad | String | Sí | Unidad de medida (ej: "unidades", "pallets", "kg") |
| estado | Enum | Sí | PENDIENTE, EN_TRANSITO, COMPLETADA, RECHAZADA |
| observaciones | Text | No | Notas adicionales sobre la entrega |
| created_at | Timestamp | Sí | Fecha de creación |
| updated_at | Timestamp | Sí | Última modificación |

> **Nota v3.3:** Cada entrega debe estar asociada a un evento. La relación `Evento 1 ── N Entregas` permite agrupar múltiples entregas que ocurren en el mismo contexto operativo.

### 4.3 Diagrama de Relaciones v3.3 (Modelo Actualizado)

```
                     ┌─────────────────┐
                     │   TipoPallet    │
                     │ (Verde, Rústico,│
                     │  Certificado)   │
                     └───────┬─────────┘
                              │
                              │
┌──────────────┐              │              ┌──────────────┐
│  Proveedor   │              │              │   Cliente    │
│  (empresa_id)│              │              │ (empresa_id)│
└──────┬───────┘              │              └──────┬───────┘
       │                      │                     │
       │                      │                     │
       │                      ▼                     │
       │          ┌────────────────────────┐        │
       │          │      Operacion         │        │
       │          ├────────────────────────┤        │
       │          │ - tipo (COMPRA/VENTA)  │        │
       │          │ - estado_documental    │        │
       │          │ - estado_financiero    │        │
       │          │ - fecha                │        │
       │          └────────┬───────────────┘        │
       │                   │                        │
       │                   │                        │
       │                   │ (N:1)                  │
       │                   ▼                        │
       │          ┌─────────────────┐              │
       │          │     Evento       │              │
       │          ├─────────────────┤              │
       │          │ - tipo           │              │
       │          │ - fecha_inicio   │              │
       │          │ - estado         │              │
       │          └────────┬────────┘              │
       │                   │                        │
       │                   │ (1:N)                  │
       │                   ▼                        │
       │          ┌─────────────────┐              │
       │          │    Entrega      │              │
       │          ├─────────────────┤              │
       │          │ - empresa_id    │              │
       │          │ - empresa_receptora_id│        │
       │          │ - cantidad      │              │
       │          │ - tipo_entrega  │              │
       │          └─────────────────┘              │
       │                   │                        │
       │                   │ (N:1)                  │
       │                   ▼                        │
       └───────────────────┼────────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │     Empresa      │
                  ├─────────────────┤
                  │ - nombre        │
                  │ - rut           │
                  │ - tipo_empresa  │
                  │ - estado        │
                  └─────────────────┘

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

       ┌──────────────┐
       │  Proveedor   │
       │ (empresa_id) │
       └──────┬───────┘
              │ (N:1)
              │
              ▼
       ┌──────────────────────┐
       │   OrdenCompra        │
       ├──────────────────────┤
       │ - numero (OC-YYYY-N) │
       │ - estado             │
       │ - pdf_generado       │
       │ - fecha              │
       └──────────┬───────────┘
                  │
                  │ (1:N)
                  ▼
       ┌──────────────────────┐
       │ OrdenCompraLinea     │
       ├──────────────────────┤
       │ - tipo_pallet        │
       │ - cantidad           │
       │ - precio_unitario    │
       └──────────────────────┘
```

**Principios del modelo v3.3:**

1. **Operacion** es la entidad central unificada
2. Los **Documentos** se asocian a operaciones (no entidades separadas)
3. Los **Pagos** se rastrean por operación
4. **Factoring** es un caso especial de financiamiento
5. **Empresa** unifica la representación de organizaciones (proveedores, clientes, transportistas)
6. **Evento** agrupa actividades logísticas u operativas
7. **Entrega** representa entregas de productos/recursos dentro de eventos
8. Relación `Evento 1 ── N Entregas`: Las entregas ocurren dentro de eventos
9. Relación `Empresa N ── 1 Entrega`: Las entregas referencian empresas mediante `empresa_id`

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
| COMPRA | Orden de Compra (OC de FSL al proveedor), Guía de Recepción |
| VENTA_DIRECTA | Orden de Compra del Cliente (OC del cliente a FSL), Guía de Despacho, Factura |
| VENTA_COMISION | Orden de Compra del Cliente (OC del cliente a FSL), Guía de Despacho, Factura |

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
│     Para operaciones de VENTA (unificadas):                                        │
│     • Tipo (Venta Directa / Venta con Comisión)                                     │
│     • Cliente (obligatorio)                                                         │
│     • Proveedor (obligatorio - proveedor del cual FSL compra)                       │
│     • Orden de Compra del Cliente - Número de OC que el cliente emitió a FSL       │
│     • Productos con:                                                                │
│       - Tipo pallet y cantidad                                                      │
│       - Precio de venta unitario (al cliente)                                       │
│       - Precio de compra unitario (al proveedor)                                    │
│     • Fecha y dirección de entrega                                                   │
│     • Generar OC a proveedor - Sistema genera PDF y asocia a operación             │
│     • Sistema calcula automáticamente:                                             │
│       - Total venta, Total compra, Margen bruto, Margen %                          │
│                                                                                     │
│     Para operaciones de COMPRA (sin venta asociada):                                │
│     • Tipo: Compra                                                                  │
│     • Proveedor (obligatorio)                                                       │
│     • Productos (tipo pallet, cantidad, precio de compra)                           │
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
│     • Usuario adjunta factura (de FSL al cliente, si es venta)                      │
│     • Usuario registra pagos:                                                       │
│       - Cobro a cliente (precio de venta total) - para operaciones de venta          │
│       - Pago a proveedor (costo de compra total) - para operaciones de venta        │
│       - Pago a proveedor (costo total) - para operaciones de compra                 │
│       - Pago de flete (si aplica)                                                   │
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
Usuario registra compra directa a proveedor → FSL genera OC a proveedor → 
Adjunta documentos → Registra pago a proveedor
```

**Contexto operativo:**
- Esta operación se origina cuando FSL necesita comprar pallets a un proveedor sin venta asociada
- FSL emite su propia orden de compra al proveedor
- No hay cliente asociado (solo compra)

**Documentos obligatorios:**
- Orden de Compra (OC de FSL al proveedor)
- Guía de recepción/traslado

**Pagos asociados:**
- Pago a proveedor
- Pago de flete (si FSL paga el transporte)

**Estado completo cuando:**
- ✅ Todos los documentos presentes
- ✅ Pago a proveedor registrado

---

#### **B) Operación tipo VENTA_DIRECTA (Operación Unificada)**

```
Cliente emite OC a FSL → Usuario crea operación unificada con:
  • Cliente y OC del cliente
  • Proveedor y OC generada por FSL
  • Productos con precios de venta Y costos de compra
→ Adjunta documentos → Registra cobro a cliente Y pago a proveedor
```

**Contexto operativo:**
- El cliente primero emite una orden de compra dirigida a FSL
- FSL crea **una sola operación unificada** que contiene:
  - **Venta al cliente**: Cliente, OC del cliente, precios de venta
  - **Compra al proveedor**: Proveedor, OC generada por FSL, costos de compra
- FSL genera su orden de compra (PDF) al proveedor y la asocia a la operación
- Los proveedores despachan directamente al cliente final
- **Márgenes calculados automáticamente**: Diferencia entre precios de venta y costos de compra

**Estructura de la operación:**
- `cliente_id`: Cliente que compra (obligatorio)
- `proveedores`: Array de proveedores de los cuales FSL compra (obligatorio al menos 1, puede tener múltiples)
- `orden_compra_cliente`: Número de OC que el cliente emitió a FSL
- `orden_compra_generada_id`: Referencia a la OC generada por FSL al proveedor
- `OperacionLinea`: Cada línea contiene:
  - `precio_venta_unitario`: Precio al cliente
  - `precio_compra_unitario`: Costo al proveedor
  - `margen_unitario`: Calculado automáticamente (venta - compra)

**Cálculos automáticos:**
- Total venta = Σ(cantidad × precio_venta_unitario)
- Total compra = Σ(cantidad × precio_compra_unitario)
- Margen bruto = Total venta - Total compra
- Margen porcentual = (Margen bruto / Total venta) × 100

**Documentos obligatorios:**
- Orden de Compra del Cliente (OC que el cliente emitió a FSL)
- Orden de Compra de FSL (OC generada y enviada al proveedor)
- Guía de despacho
- Factura (de FSL al cliente)
- Certificado NIMF-15 (solo si vende pallets certificados)

**Pagos asociados:**
- **Cobro a cliente** (precio de venta total)
- **Pago a proveedor** (costo de compra total)
- Pago de flete (si FSL paga el transporte)

**Estado completo cuando:**
- ✅ Todos los documentos presentes
- ✅ Factura emitida
- ✅ Cobro a cliente registrado
- ✅ Pago a proveedor registrado

**Opcional:** Puede registrar factoring si la factura se factorizó

---

#### **C) Operación tipo VENTA_COMISION (Operación Unificada)**

```
Cliente emite OC a FSL → Usuario crea operación unificada con:
  • Cliente y OC del cliente
  • Proveedor y OC generada por FSL
  • Productos con costos de compra
→ Adjunta documentos → Registra comisión cobrada
```

**Contexto operativo:**
- El cliente primero emite una orden de compra dirigida a FSL
- FSL crea **una sola operación** que contiene:
  - **Venta al cliente**: Cliente, OC del cliente
  - **Compra al proveedor**: Proveedor, OC generada por FSL, costos de compra
- El proveedor factura directamente al cliente, y FSL recibe una comisión
- FSL registra la comisión como cobro

**Documentos obligatorios:**
- Orden de Compra del Cliente (OC que el cliente emitió a FSL)
- Orden de Compra de FSL (OC generada y enviada al proveedor)
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
4. Si cantidad entregada < cantidad solicitada → 🟡 Entrega parcial
5. Si hay pallets dañados registrados → ⚠️ Alerta de merma
6. Si todo completo y cerrado → 🟢 OK

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

### 5.5 Manejo de Entregas Parciales y Pallets Dañados

Este flujo aborda la realidad de que un pedido puede entregarse en varias tandas y que pueden ocurrir daños durante el traslado.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│               FLUJO DE ENTREGAS PARCIALES Y DAÑOS                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. REGISTRO DE ENTREGA (Guía)                                              │
│     Usuario sube guía y registra:                                           │
│     • Cantidad declarada en guía (ej: 1000)                                 │
│     • Cantidad dañada/rechazada (ej: 10)                                    │
│                                                                             │
│  2. ACTUALIZACIÓN DE SALDOS                                                 │
│     Sistema calcula:                                                        │
│     • Cantidad Entregada Conforme = 990                                     │
│     • Cantidad Dañada Acumulada = 10                                        │
│     • Saldo Pendiente = Original - Entregada Conforme                       │
│                                                                             │
│  3. REPOSICIÓN DE DAÑADOS                                                   │
│     Si hay 10 pallets dañados que el cliente rechazó:                       │
│     • FSL debe realizar una nueva compra de 10 pallets a un proveedor       │
│     • Se asocia a la misma operación de venta original                      │
│     • Se registra una nueva entrega (guía) por esos 10 pallets              │
│                                                                             │
│  4. CIERRE                                                                  │
│     La operación solo puede cerrarse cuando la suma de las entregas         │
│     conformes iguala a la cantidad solicitada original.                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 5.6 Flujo de Generación de Orden de Compra

Proceso para crear y generar una orden de compra en PDF dirigida a un proveedor.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE GENERACIÓN DE ORDEN DE COMPRA                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. CREAR ORDEN DE COMPRA                                                   │
│     Usuario ingresa:                                                        │
│     • Proveedor destinatario                                                │
│     • Fecha de la orden                                                     │
│     • Fecha esperada de entrega (opcional)                                 │
│     • Dirección de entrega                                                  │
│     • Productos (tipo pallet, cantidad, precio opcional)                    │
│     • Observaciones                                                         │
│                                                                             │
│     Estado inicial: BORRADOR                                                 │
│                                                                             │
│  2. GENERAR PDF                                                              │
│     Usuario presiona "Generar PDF":                                         │
│     • Sistema genera número secuencial (OC-2026-00001)                      │
│     • Sistema crea PDF con formato profesional                              │
│     • PDF incluye:                                                          │
│       - Datos de FSL (razón social, RUT, dirección)                        │
│       - Datos del proveedor                                                 │
│       - Número de OC y fecha                                                │
│       - Tabla de productos (tipo, cantidad, precio, subtotal)               │
│       - Total general                                                       │
│       - Observaciones                                                       │
│     • PDF se guarda en el sistema                                           │
│     • Estado cambia a ENVIADA                                               │
│                                                                             │
│  3. ENVÍO AL PROVEEDOR                                                       │
│     Usuario descarga el PDF y lo envía al proveedor (email, WhatsApp, etc.) │
│     • El PDF está listo para ser enviado                                    │
│     • Se puede asociar la OC a una operación existente                      │
│                                                                             │
│  4. SEGUIMIENTO                                                              │
│     • Usuario puede ver todas las OC generadas                               │
│     • Puede marcar como RECIBIDA cuando el proveedor confirma               │
│     • Puede cancelar si es necesario                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Características del PDF:**
- Formato profesional con logo de FSL (si está disponible)
- Número secuencial visible (OC-2026-00001)
- Datos completos del proveedor
- Tabla detallada de productos
- Totales calculados automáticamente
- Fecha de emisión y fecha esperada de entrega
- Observaciones y condiciones

---

## 6. Reglas de Negocio v2.0

### 6.1 Reglas de Operaciones

| ID | Regla | Validación |
|----|-------|------------|
| RN-01 | Toda operación debe tener al menos una línea de producto | Validar antes de guardar |
| RN-02 | La cantidad debe ser mayor a cero | Validar en cada línea |
| RN-03 | Número de operación es secuencial: OP-2026-00001 en adelante | Sistema genera automático |
| RN-04 | No se puede eliminar operación con documentos o pagos asociados | Validar referencias |
| RN-05 | Operación COMPRA requiere al menos 1 proveedor obligatorio | Validar al crear |
| RN-06 | Operación VENTA_DIRECTA requiere cliente Y al menos 1 proveedor obligatorios | Validar al crear (operación unificada) |
| RN-07 | Operación VENTA_COMISION requiere al menos 1 proveedor Y cliente obligatorios | Validar al crear (operación unificada) |
| RN-05B | Una operación puede tener múltiples proveedores (relación N:M) | Permitir agregar varios proveedores |
| RN-07B | Operación VENTA_* debe tener precios de venta Y compra en las líneas | Validar que ambas existan |
| RN-07C | Margen no puede ser negativo (precio venta >= precio compra) | Validar cálculo de margen |
| RN-07D | OC generada debe asociarse a la operación de venta | Vincular orden_compra_generada_id |
| RN-08 | El cierre de operación requiere una Observación de Cierre | Campo obligatorio al cambiar a CERRADA |
| RN-09 | Operación VENTA_* puede incluir número de OC del cliente | Campo opcional pero recomendado para trazabilidad |
| RN-10 | Los pallets dañados informados en guías deben ser repuestos | Requiere nueva compra/entrega para completar saldo |
| RN-11 | La cantidad entregada conforme no puede superar la solicitada | Validar suma de guías conforme |
| RN-12 | Número de OC es secuencial: OC-2026-00001 en adelante | Sistema genera automático al generar PDF |
| RN-13 | OC debe tener al menos una línea de producto | Validar antes de generar PDF |
| RN-14 | OC requiere proveedor obligatorio | Validar al crear |
| RN-15 | Solo OC en estado BORRADOR puede ser editada | Validar estado antes de editar |
| RN-16 | PDF solo se genera una vez por OC | Validar pdf_generado antes de regenerar |

### 6.2 Reglas de Documentos

| ID | Regla | Validación |
|----|-------|------------|
| RN-17 | Documentos obligatorios dependen del tipo de operación | Ver matriz de documentos obligatorios |
| RN-18 | Sistema detecta automáticamente documentos faltantes | Actualizar estado_documental |
| RN-19 | Solo se aceptan archivos PDF, JPG, PNG | Validar tipo de archivo |
| RN-20 | Tamaño máximo de archivo: 10 MB | Validar tamaño |
| RN-21 | Operación con pallet certificado requiere NIMF-15 obligatorio | Validar según tipo de producto |
| RN-22 | Documentos pueden tener número y fecha opcional | Campos opcionales |

### 6.3 Reglas de Pagos

| ID | Regla | Validación |
|----|-------|------------|
| RN-23 | Pago debe estar asociado a una operación | Referencia obligatoria |
| RN-24 | Monto de pago debe ser mayor a cero | Validar monto |
| RN-25 | Fecha de pago no puede ser futura | Validar fecha |
| RN-26 | Sistema actualiza estado financiero según pagos | Actualizar automático |
| RN-27 | Múltiples pagos permitidos (pagos parciales) | Suma total de pagos |

### 6.4 Reglas de Factoring

| ID | Regla | Validación |
|----|-------|------------|
| RN-28 | Solo operaciones de venta pueden factorizarse | Validar tipo de operación |
| RN-29 | Operación debe tener factura antes de factorizar | Validar documento FACTURA presente |
| RN-30 | Monto adelantado no puede ser mayor al monto de la factura | Validar montos |
| RN-31 | Una operación puede factorizarse solo una vez | Validar unicidad |

### 6.5 Reglas de Órdenes de Compra

| ID | Regla | Validación |
|----|-------|------------|
| RN-32 | OC debe tener al menos una línea de producto | Validar antes de generar PDF |
| RN-33 | OC requiere proveedor obligatorio | Validar al crear |
| RN-34 | Solo OC en estado BORRADOR puede ser editada | Validar estado antes de editar |
| RN-35 | PDF solo se genera una vez por OC | Validar pdf_generado antes de regenerar |
| RN-36 | Número de OC es secuencial: OC-2026-00001 en adelante | Sistema genera automático al generar PDF |

### 6.6 Reglas de Proveedores y Clientes

| ID | Regla | Validación |
|----|-------|------------|
| RN-40 | RUT debe ser válido (dígito verificador) y único. Se almacena sin puntos, solo con guión (ej: `77442030-4`) | Validar formato y duplicados |
| RN-41 | Solo se puede operar con contactos activos | Filtrar en selectores |
| RN-42 | No se puede desactivar contacto con operaciones abiertas | Validar antes de desactivar |

### 6.7 Reglas de Tipos de Pallet

| ID | Regla | Validación |
|----|-------|------------|
| RN-50 | Código de pallet debe ser único | Validar duplicados |
| RN-51 | Si tipo requiere certificación, NIMF-15 es obligatorio | Regla documental |

### 6.8 Reglas de Usuarios

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

### 7.3 Estado de Orden de Compra

Indica el estado del ciclo de vida de una orden de compra generada:

```
     ┌───────────┐
     │ BORRADOR  │  ← OC en creación, no enviada
     └─────┬─────┘
           │ Usuario genera PDF
           ▼
     ┌───────────┐
     │  ENVIADA  │  ← PDF generado y enviado al proveedor
     └─────┬─────┘
           │ Proveedor confirma recepción
           ▼
     ┌───────────┐
     │ RECIBIDA  │  ← Proveedor confirmó recepción
     └───────────┘
           │
           │ Usuario cancela
           ▼
     ┌───────────┐
     │ CANCELADA │  ← OC cancelada
     └───────────┘
```

| Estado | Descripción | Visual | Acciones permitidas |
|--------|-------------|--------|---------------------|
| BORRADOR | OC en creación, no enviada | ⚪ Gris | Editar, generar PDF, eliminar |
| ENVIADA | PDF generado y enviado al proveedor | 🟡 Amarillo | Ver PDF, marcar como recibida, cancelar |
| RECIBIDA | Proveedor confirmó recepción | 🟢 Verde | Ver PDF, asociar a operación |
| CANCELADA | OC cancelada | 🔴 Rojo | Solo consulta |

---

### 7.4 Matriz de Estados Combinados

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
| RF-OP-01 | Crear operación (compra/venta/comisión) | 🔴 Crítica | Formulario unificado con tipo, contacto, productos, orden de compra del cliente (si es venta) |
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

### 8.7 Módulo de Órdenes de Compra (RF-OC) - CORE

| ID | Requerimiento | Prioridad | Descripción |
|----|---------------|-----------|-------------|
| RF-OC-01 | Crear orden de compra | 🔴 Crítica | Formulario con proveedor, fecha, productos |
| RF-OC-02 | Editar orden de compra (solo borrador) | 🔴 Crítica | Modificar datos y líneas de producto |
| RF-OC-03 | Generar PDF de orden de compra | 🔴 Crítica | Generar PDF profesional con número secuencial |
| RF-OC-04 | Descargar PDF generado | 🔴 Crítica | Descargar PDF para enviar al proveedor |
| RF-OC-05 | Listar órdenes de compra | 🔴 Crítica | Filtrar por proveedor, fecha, estado |
| RF-OC-06 | Ver detalle de orden de compra | 🔴 Crítica | Vista completa con líneas y PDF |
| RF-OC-07 | Cambiar estado de OC (enviada/recibida/cancelada) | 🟡 Alta | Actualizar estado manualmente |
| RF-OC-08 | Asociar OC a operación existente | 🟡 Alta | Vincular OC generada con operación |
| RF-OC-09 | Eliminar OC (solo borrador) | 🟢 Media | Solo si está en estado BORRADOR |
| RF-OC-10 | Duplicar orden de compra | 🟢 Media | Crear nueva basada en existente |

### 8.8 Módulo de Contactos (RF-CONT)

| ID | Requerimiento | Prioridad | Descripción |
|----|---------------|-----------|-------------|
| RF-CONT-01 | Listar proveedores y clientes | 🟡 Alta | Lista unificada con filtros |
| RF-CONT-02 | Crear proveedor/cliente | 🟡 Alta | RUT, razón social, datos de contacto |
| RF-CONT-03 | Editar contacto | 🟡 Alta | Modificar datos existentes |
| RF-CONT-04 | Activar/desactivar contacto | 🟢 Media | No eliminar, solo desactivar |
| RF-CONT-05 | Ver operaciones de contacto | 🟡 Alta | Historial de operaciones |
| RF-CONT-06 | Validación de RUT | 🟡 Alta | Dígito verificador, unicidad. Normalizar formato (eliminar puntos, mantener guión). Almacenar sin puntos (ej: `77442030-4`) |

### 8.9 Módulo de Productos (RF-PROD)

| ID | Requerimiento | Prioridad | Descripción |
|----|---------------|-----------|-------------|
| RF-PROD-01 | Listar tipos de pallet | 🟡 Alta | PV, PR, PC |
| RF-PROD-02 | Crear tipo de pallet | 🟢 Baja | Para futuros productos |
| RF-PROD-03 | Configurar si requiere certificación | 🟡 Alta | NIMF-15 obligatorio |

### 8.10 Módulo de Reportes (RF-REP)

| ID | Requerimiento | Prioridad | Descripción |
|----|---------------|-----------|-------------|
| RF-REP-01 | Reporte de operaciones por período | 🟡 Alta | Compras y ventas, filtros por fecha |
| RF-REP-02 | Reporte de pendientes | 🔴 Crítica | Documentos y pagos pendientes |
| RF-REP-03 | Reporte de operaciones por contacto | 🟡 Alta | Historial con proveedor/cliente |
| RF-REP-04 | Trazabilidad por número de operación | 🟡 Alta | Documentos, pagos, historial |
| RF-REP-05 | Exportar a Excel/CSV | 🟢 Media | Descargar reportes |

### 8.11 Módulo de Autenticación (RF-AUTH)

| ID | Requerimiento | Prioridad | Descripción |
|----|---------------|-----------|-------------|
| RF-AUTH-01 | Login con email y contraseña | 🔴 Crítica | Auth.js con Credentials Provider, sesiones con cookies HTTP-only |
| RF-AUTH-02 | Logout | 🔴 Crítica | Cerrar sesión de Auth.js |
| RF-AUTH-03 | Cambiar contraseña | 🟡 Alta | Usuario puede cambiar su contraseña, hash con bcrypt (salt rounds: 10) |
| RF-AUTH-04 | Recordar sesión | 🟢 Media | "Mantener sesión iniciada" mediante cookies persistentes |
| RF-AUTH-05 | Hash seguro de contraseñas | 🔴 Crítica | Usar bcrypt con Node.js crypto, salt rounds: 10, nunca texto plano |

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
| **RUT** | Rol Único Tributario (identificador fiscal chileno). Se almacena sin puntos, solo con guión antes del dígito verificador (formato: `12345678-9`). En la UI se puede mostrar con puntos para mejor legibilidad (formato: `12.345.678-9`) |
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
| **OC del Cliente** | Orden de Compra que el cliente emite a FSL para solicitar pallets |
| **OC de FSL** | Orden de Compra que FSL emite a sus proveedores para cumplir con la OC del cliente |
| **Orden de Compra (OC)** | Documento que formaliza la solicitud de compra de productos |
| **OC Generada** | Orden de Compra creada y generada en PDF desde el sistema |
| **Número Secuencial OC** | Formato OC-YYYY-NNNNN generado automáticamente por el sistema |
| **Empresa** | Entidad que representa organizaciones que interactúan con el sistema (proveedores, clientes, transportistas, etc.) |
| **Evento** | Entidad que representa eventos logísticos u operativos dentro del sistema. Los eventos pueden contener múltiples entregas |
| **Entrega** | Entidad que representa el acto de entrega de productos o recursos. Las entregas ocurren dentro de eventos y referencian empresas |

---

## Anexo A: Wireframes v2.0 (Descripción Textual)

### A.1 Dashboard Principal - Enfoque en Pendientes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🌲 Forestal Santa Lucía                             [Usuario] [Salir]      │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Operaciones] [Órdenes de Compra] [Contactos] [Reportes]                  │
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
│  │                                                                         ││
│  │ [+ Nueva Orden de Compra]  ← Generar OC a proveedor                    ││
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
| Autenticación | **Auth.js (NextAuth.js v5)** | Credentials Provider, sesiones con cookies HTTP-only |
| Hash Contraseñas | **bcrypt** con Node.js `crypto` | Salt rounds: 10, nunca texto plano |
| Storage (docs) | **Amazon S3** (producción) / **Mocks** (desarrollo) | Escalable, económico, durabilidad 99.999999999% |
| PDF Generation | **jsPDF** | Generación de PDFs en cliente/servidor |
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
| **2.2** | **2026-01-15** | **Arquitectura** | **Flujo operativo completo:** <br>• Cliente emite OC a FSL <br>• FSL genera OC a proveedores <br>• Campo orden_compra_cliente en operaciones de venta <br>• OC del cliente como documento obligatorio en ventas <br>• Actualización de flujos de negocio y reglas |
| **2.3** | **2026-01-15** | **Arquitectura** | **Entregas parciales y mermas:** <br>• Registro de pallets dañados/rechazados <br>• Seguimiento de entregas parciales por operación <br>• Nueva lógica de reposición de pallets dañados |
| **2.4** | **2026-01-15** | **Arquitectura** | **Generación de Órdenes de Compra:** <br>• Módulo completo de OC con número secuencial (OC-YYYY-NNNNN) <br>• Generación de PDF profesional <br>• Estados de OC (BORRADOR, ENVIADA, RECIBIDA, CANCELADA) <br>• Asociación de OC a operaciones |
| **2.5** | **2026-01-15** | **Arquitectura** | **Operación Unificada:** <br>• Operaciones de venta incluyen compra asociada en una sola entidad <br>• Precios de venta y compra en las líneas de producto <br>• Cálculo automático de márgenes <br>• Proveedor obligatorio en operaciones de venta <br>• OC generada asociada a la operación |
| **2.6** | **2026-01-27** | **Desarrollo** | **Fase 3 Implementada - Módulo de Operaciones (Core):** <br>• APIs REST completas para CRUD de operaciones <br>• Validaciones Zod con reglas de negocio complejas <br>• Cálculo automático de márgenes en operaciones unificadas <br>• Generación de número secuencial (OP-YYYY-NNNNN) <br>• Gestión de estados documental y financiero <br>• Detección automática de documentos faltantes <br>• Cierre de operación con observación obligatoria <br>• Soporte completo para productos certificados (NIMF-15) |
| **2.7** | **2026-01-27** | **Desarrollo** | **Fase 4 Implementada - Módulo de Órdenes de Compra:** <br>• APIs REST completas para CRUD de órdenes de compra <br>• Generación de PDF profesional con jsPDF <br>• Número secuencial (OC-YYYY-NNNNN) por año <br>• Estados de OC (BORRADOR, ENVIADA, RECIBIDA, CANCELADA) <br>• Template PDF con datos empresa, proveedor, productos, totales <br>• Formateo automático de RUT con puntos <br>• Asociación opcional con operaciones <br>• Validación de transiciones de estado <br>• Solo editable/eliminable en BORRADOR |
| **2.8** | **2026-01-27** | **Arquitectura** | **Decisión de Infraestructura - Storage de Documentos:** <br>• Almacenamiento de documentos: **Amazon S3** para producción <br>• Desarrollo inicial con **mocks** para agilizar desarrollo <br>• APIs diseñadas para ser agnósticas del storage backend <br>• Migración transparente de mocks a S3 sin cambios en frontend <br>• S3 provee: escalabilidad, durabilidad (11 9s), costos predecibles <br>• Validaciones de tipo y tamaño en capa de aplicación <br>• Metadata de documentos en PostgreSQL, archivos en S3 |
| **2.9** | **2026-01-27** | **Desarrollo** | **Fase 5 Implementada - Módulo de Documentos:** <br>• Capa de abstracción de storage (`IStorageProvider`) <br>• `MockStorageProvider` funcional para desarrollo <br>• `S3StorageProvider` como placeholder documentado <br>• APIs REST completas para gestión de documentos <br>• Upload con validación de tipo (PDF, JPG, PNG) y tamaño (10MB max) <br>• Detección automática de documentos faltantes <br>• Actualización automática de `estado_documental` <br>• Soporte para certificación NIMF-15 <br>• Enum `TipoDocumento` incluye `ORDEN_COMPRA_CLIENTE` <br>• Endpoint batch para detectar faltantes en múltiples operaciones <br>• Migración Prisma para nuevo enum value <br>• Documentación completa en `ARQUITECTURA-STORAGE.md` |
| **3.0** | **2026-01-27** | **Desarrollo** | **Fase 6 Implementada - Módulo de Pagos (Core Completo):** <br>• APIs REST completas para gestión de pagos (CRUD) <br>• Validaciones Zod con soporte para Decimal de Prisma <br>• Cálculo automático de resumen financiero por operación <br>• Actualización automática de `estado_financiero` <br>• Validación de coherencia (pago vs tipo de operación) <br>• Validación de montos máximos (no exceder totales) <br>• Cálculo de saldos pendientes (cobros/pagos) <br>• Cálculo de margen neto (considerando fletes y comisiones) <br>• Endpoint de resumen financiero completo <br>• 4 tipos de pago: PAGO_PROVEEDOR, COBRO_CLIENTE, PAGO_FLETE, PAGO_COMISION <br>• Estados financieros: PENDIENTE, FACTURADA, PAGADA, CERRADA <br>• **MVP Core 90% Completo** - Operaciones + OCs + Documentos + Pagos funcionales |
| **3.1** | **2026-01-27** | **Desarrollo** | **Fase 7 Implementada - Dashboard y Sistema de Alertas (MVP 95%):** <br>• API de estadísticas del dashboard (`GET /api/dashboard/estadisticas`) <br>• Filtros por período (mes, trimestre, año, todo) <br>• Cálculo de métricas financieras (ingresos, costos, márgenes) <br>• Estadísticas de operaciones (total, por tipo, por estado) <br>• API de alertas completa (`GET /api/dashboard/alertas`) <br>• 4 tipos de alertas: DOCUMENTOS_INCOMPLETOS, PAGO_PENDIENTE, FACTURADA_SIN_PAGAR, OPERACION_ANTIGUA <br>• Priorización automática (ALTA, MEDIA, BAJA) basada en antigüedad <br>• Agrupación por tipo y prioridad <br>• Timeline de actividad reciente (`GET /api/dashboard/actividad-reciente`) <br>• Detección automática de documentos faltantes por operación <br>• Alertas de pagos pendientes con días transcurridos <br>• **Sistema Listo para Producción** - Solo falta conectar UI Mock con APIs reales |
| **3.3** | **2026-01-27** | **Arquitectura** | **Actualización Modelo de Dominio:** <br>• Agregada entidad `Empresa` para representar organizaciones (proveedores, clientes, transportistas, etc.) <br>• Agregada entidad `Evento` para representar eventos logísticos u operativos <br>• Agregada entidad `Entrega` con relación a `Evento` (1:N) y `Empresa` (N:1) <br>• Las entregas ocurren dentro de eventos (`evento_id` obligatorio) <br>• Las entregas referencian empresas mediante `empresa_id` y opcionalmente `empresa_receptora_id` <br>• Actualizado diagrama de relaciones v3.3 <br>• Modelo preparado para reutilización de información de empresas y trazabilidad de entregas |

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

