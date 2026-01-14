# API Specification Document - Forestal Santa Lucía

**Versión:** 1.0  
**Fecha:** 2026-01-12  
**Basado en:** SDD v2.1, DATABASE-SCHEMA v1.0, UI-SPEC v1.0  
**Framework objetivo:** Next.js 14 API Routes (App Router)  
**Formato:** REST JSON  

---

## 1. Información General

### 1.1 Base URL
```
Desarrollo:  http://localhost:3000/api
Producción:  https://app.forestalsantalucia.cl/api
```

### 1.2 Autenticación
- **Método:** JWT (JSON Web Token)
- **Header:** `Authorization: Bearer <token>`
- **Duración:** 7 días (configurable)
- **Refresh:** Automático en cada request válido

### 1.3 Formato de Respuestas

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-01-12T10:30:00Z"
  }
}
```

**Respuesta con paginación:**
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 48,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5,
    "timestamp": "2026-01-12T10:30:00Z"
  }
}
```

**Respuesta de error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El RUT ingresado no es válido",
    "details": {
      "field": "rut",
      "value": "12.345.678-0"
    }
  }
}
```

### 1.4 Códigos de Error

| Código | HTTP Status | Descripción |
|--------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Token inválido o expirado |
| `FORBIDDEN` | 403 | Sin permisos para esta acción |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `VALIDATION_ERROR` | 400 | Error de validación de datos |
| `DUPLICATE_ENTRY` | 409 | Registro duplicado (ej: RUT) |
| `BUSINESS_RULE_ERROR` | 422 | Violación de regla de negocio |
| `FILE_TOO_LARGE` | 413 | Archivo excede tamaño máximo |
| `INVALID_FILE_TYPE` | 415 | Tipo de archivo no permitido |
| `INTERNAL_ERROR` | 500 | Error interno del servidor |

---

## 2. Endpoints de Autenticación

### 2.1 Login

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "admin@forestalsantalucia.cl",
  "password": "********",
  "rememberMe": true
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "admin@forestalsantalucia.cl",
      "nombre": "Administrador"
    },
    "expiresAt": "2026-01-19T10:30:00Z"
  }
}
```

**Response 401:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Credenciales inválidas"
  }
}
```

---

### 2.2 Logout

```
POST /api/auth/logout
```

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Sesión cerrada correctamente"
  }
}
```

---

### 2.3 Verificar Sesión

```
GET /api/auth/me
```

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@forestalsantalucia.cl",
    "nombre": "Administrador",
    "ultimoAcceso": "2026-01-12T08:00:00Z"
  }
}
```

---

### 2.4 Cambiar Contraseña

```
PUT /api/auth/password
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "********",
  "newPassword": "********",
  "confirmPassword": "********"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Contraseña actualizada correctamente"
  }
}
```

---

## 3. Endpoints de Dashboard

### 3.1 Obtener Resumen Dashboard

```
GET /api/dashboard
```

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "pendientes": {
      "documentosFaltantes": 5,
      "pagosPendientes": 3,
      "total": 8
    },
    "resumen": {
      "operacionesAbiertas": 23,
      "cerradas30Dias": 18,
      "compras": 12,
      "ventas": 11
    },
    "alertas": [
      {
        "operacionId": "uuid",
        "numero": "OP-2026-00123",
        "tipo": "DOCUMENTO_FALTANTE",
        "mensaje": "Falta Guía de Recepción",
        "prioridad": "alta"
      },
      {
        "operacionId": "uuid",
        "numero": "OP-2026-00120",
        "tipo": "PAGO_PENDIENTE",
        "mensaje": "Pago a proveedor pendiente",
        "monto": 2500000,
        "prioridad": "media"
      }
    ],
    "actividadReciente": [
      {
        "tipo": "OPERACION_CREADA",
        "operacionId": "uuid",
        "numero": "OP-2026-00130",
        "descripcion": "Venta a Cermaq Chile S.A.",
        "fecha": "2026-01-12T08:30:00Z"
      }
    ]
  }
}
```

---

## 4. Endpoints de Operaciones

### 4.1 Listar Operaciones

```
GET /api/operaciones
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | number | Página (default: 1) |
| `pageSize` | number | Items por página (default: 10, max: 50) |
| `tipo` | string | COMPRA, VENTA_DIRECTA, VENTA_COMISION |
| `estadoDocumental` | string | INCOMPLETA, COMPLETA |
| `estadoFinanciero` | string | PENDIENTE, FACTURADA, PAGADA, CERRADA |
| `proveedorId` | uuid | Filtrar por proveedor |
| `clienteId` | uuid | Filtrar por cliente |
| `fechaDesde` | date | Fecha inicio (YYYY-MM-DD) |
| `fechaHasta` | date | Fecha fin (YYYY-MM-DD) |
| `buscar` | string | Búsqueda por número de operación |
| `ordenar` | string | fecha_desc (default), fecha_asc, numero |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "numero": "OP-2026-00130",
      "tipo": "VENTA_DIRECTA",
      "fecha": "2026-01-12",
      "cliente": {
        "id": "uuid",
        "razonSocial": "Cermaq Chile S.A.",
        "rut": "76.xxx.xxx-x"
      },
      "proveedor": null,
      "estadoDocumental": "INCOMPLETA",
      "estadoFinanciero": "FACTURADA",
      "documentosPresentes": 2,
      "documentosRequeridos": 3,
      "totalOperacion": 7650000,
      "resumenProductos": "500 Pallet Verde, 50 Pallet Certificado",
      "createdAt": "2026-01-12T08:30:00Z"
    }
  ],
  "meta": {
    "total": 48,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5
  }
}
```

---

### 4.2 Obtener Operación por ID

```
GET /api/operaciones/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "numero": "OP-2026-00130",
    "tipo": "VENTA_DIRECTA",
    "fecha": "2026-01-12",
    "cliente": {
      "id": "uuid",
      "rut": "76.xxx.xxx-x",
      "razonSocial": "Cermaq Chile S.A.",
      "nombreFantasia": "Cermaq",
      "direccion": "Puerto Montt",
      "telefono": "65-1234567",
      "email": "contacto@cermaq.cl"
    },
    "proveedor": null,
    "estadoDocumental": "INCOMPLETA",
    "estadoFinanciero": "FACTURADA",
    "direccionEntrega": "Puerto Montt, Av. Principal 123",
    "ordenCompraCliente": "OC-36",
    "observaciones": "Entregar antes de las 14:00",
    "observacionCierre": null,
    "fechaCierre": null,
    "lineas": [
      {
        "id": "uuid",
        "tipoPallet": {
          "id": "uuid",
          "codigo": "PV",
          "nombre": "Pallet Verde",
          "requiereCertificacion": false
        },
        "cantidad": 500,
        "cantidadEntregada": 500,
        "precioUnitario": 13500,
        "subtotal": 6750000
      },
      {
        "id": "uuid",
        "tipoPallet": {
          "id": "uuid",
          "codigo": "PC",
          "nombre": "Pallet Certificado",
          "requiereCertificacion": true
        },
        "cantidad": 50,
        "cantidadEntregada": 50,
        "precioUnitario": 18000,
        "subtotal": 900000
      }
    ],
    "totalOperacion": 7650000,
    "documentos": [
      {
        "id": "uuid",
        "tipo": "GUIA_DESPACHO",
        "numeroDocumento": "95519",
        "fechaDocumento": "2026-01-12",
        "archivoUrl": "/uploads/docs/xxx.pdf",
        "archivoNombre": "guia-95519.pdf",
        "esObligatorio": true,
        "choferNombre": "Joel Manque",
        "choferRut": "12.345.678-9",
        "vehiculoPatente": "JHZW23",
        "transportista": "Transportes Curacalco",
        "uploadedAt": "2026-01-12T09:00:00Z"
      },
      {
        "id": "uuid",
        "tipo": "FACTURA",
        "numeroDocumento": "F-00234",
        "fechaDocumento": "2026-01-12",
        "archivoUrl": "/uploads/docs/yyy.pdf",
        "archivoNombre": "factura-234.pdf",
        "esObligatorio": true,
        "uploadedAt": "2026-01-12T09:30:00Z"
      }
    ],
    "documentosFaltantes": [
      {
        "tipo": "CERTIFICADO_NIMF15",
        "nombre": "Certificado NIMF-15",
        "razon": "Requerido para Pallet Certificado"
      }
    ],
    "pagos": [
      {
        "id": "uuid",
        "tipo": "COBRO_CLIENTE",
        "monto": 3000000,
        "fechaPago": "2026-01-12",
        "metodoPago": "Transferencia",
        "referencia": "TRF-123456",
        "banco": "Banco Estado"
      }
    ],
    "totalPagado": 3000000,
    "saldoPendiente": 4650000,
    "factoring": null,
    "createdAt": "2026-01-12T08:30:00Z",
    "updatedAt": "2026-01-12T09:30:00Z"
  }
}
```

---

### 4.3 Crear Operación

```
POST /api/operaciones
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "tipo": "VENTA_DIRECTA",
  "fecha": "2026-01-12",
  "clienteId": "uuid",
  "proveedorId": null,
  "direccionEntrega": "Puerto Montt, Av. Principal 123",
  "ordenCompraCliente": "OC-36",
  "observaciones": "Entregar antes de las 14:00",
  "lineas": [
    {
      "tipoPalletId": "uuid",
      "cantidad": 500,
      "precioUnitario": 13500
    },
    {
      "tipoPalletId": "uuid",
      "cantidad": 50,
      "precioUnitario": 18000
    }
  ]
}
```

**Validaciones:**
- `tipo`: requerido, enum válido
- `fecha`: requerido, no futura
- `clienteId`: requerido si tipo es VENTA_*
- `proveedorId`: requerido si tipo es COMPRA o VENTA_COMISION
- `lineas`: al menos 1 línea
- `lineas[].cantidad`: > 0
- `lineas[].tipoPalletId`: debe existir y estar activo

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "numero": "OP-2026-00131",
    "tipo": "VENTA_DIRECTA",
    "fecha": "2026-01-12",
    "estadoDocumental": "INCOMPLETA",
    "estadoFinanciero": "PENDIENTE",
    "message": "Operación creada correctamente"
  }
}
```

---

### 4.4 Actualizar Operación

```
PUT /api/operaciones/:id
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fecha": "2026-01-12",
  "direccionEntrega": "Puerto Montt, Av. Principal 456",
  "ordenCompraCliente": "OC-36-REV",
  "observaciones": "Actualizado: entregar a las 16:00",
  "lineas": [
    {
      "id": "uuid-existente",
      "cantidad": 600,
      "cantidadEntregada": 500,
      "precioUnitario": 13500
    },
    {
      "tipoPalletId": "uuid-nuevo",
      "cantidad": 100,
      "precioUnitario": 15000
    }
  ]
}
```

**Validaciones:**
- No se puede editar si `estadoFinanciero` = CERRADA
- Las líneas con `id` se actualizan, sin `id` se crean
- Líneas no incluidas se eliminan

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "numero": "OP-2026-00130",
    "message": "Operación actualizada correctamente"
  }
}
```

---

### 4.5 Cerrar Operación

```
POST /api/operaciones/:id/cerrar
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "observacionCierre": "Operación completada satisfactoriamente. Cliente confirmó recepción de mercadería."
}
```

**Validaciones:**
- `observacionCierre`: requerido, mínimo 10 caracteres
- Operación no debe estar ya cerrada

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "numero": "OP-2026-00130",
    "estadoFinanciero": "CERRADA",
    "fechaCierre": "2026-01-12T15:30:00Z",
    "message": "Operación cerrada correctamente"
  }
}
```

---

### 4.6 Eliminar Operación

```
DELETE /api/operaciones/:id
```

**Headers:** `Authorization: Bearer <token>`

**Validaciones:**
- No se puede eliminar si tiene documentos
- No se puede eliminar si tiene pagos
- No se puede eliminar si está cerrada

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Operación eliminada correctamente"
  }
}
```

**Response 422:**
```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_RULE_ERROR",
    "message": "No se puede eliminar una operación con documentos asociados"
  }
}
```

---

## 5. Endpoints de Documentos

### 5.1 Subir Documento

```
POST /api/operaciones/:operacionId/documentos
```

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `archivo` | File | Sí | PDF, JPG, PNG (max 10MB) |
| `tipo` | string | Sí | Enum TipoDocumento |
| `numeroDocumento` | string | No | Número/folio del documento |
| `fechaDocumento` | date | No | Fecha del documento |
| `choferNombre` | string | No | Solo para guías |
| `choferRut` | string | No | Solo para guías |
| `vehiculoPatente` | string | No | Solo para guías |
| `transportista` | string | No | Solo para guías |
| `observaciones` | string | No | Notas adicionales |

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tipo": "GUIA_DESPACHO",
    "numeroDocumento": "95519",
    "archivoUrl": "/uploads/docs/abc123.pdf",
    "archivoNombre": "guia-95519.pdf",
    "esObligatorio": true,
    "uploadedAt": "2026-01-12T10:00:00Z",
    "operacionEstadoDocumental": "COMPLETA",
    "message": "Documento subido correctamente"
  }
}
```

---

### 5.2 Obtener Documento

```
GET /api/documentos/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "operacionId": "uuid",
    "tipo": "GUIA_DESPACHO",
    "numeroDocumento": "95519",
    "fechaDocumento": "2026-01-12",
    "archivoUrl": "/uploads/docs/abc123.pdf",
    "archivoNombre": "guia-95519.pdf",
    "archivoTipo": "application/pdf",
    "archivoSize": 245000,
    "esObligatorio": true,
    "choferNombre": "Joel Manque",
    "choferRut": "12.345.678-9",
    "vehiculoPatente": "JHZW23",
    "transportista": "Transportes Curacalco",
    "observaciones": null,
    "uploadedAt": "2026-01-12T10:00:00Z"
  }
}
```

---

### 5.3 Eliminar Documento

```
DELETE /api/documentos/:id
```

**Headers:** `Authorization: Bearer <token>`

**Validaciones:**
- Operación no debe estar cerrada

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Documento eliminado correctamente",
    "operacionEstadoDocumental": "INCOMPLETA"
  }
}
```

---

### 5.4 Descargar Documento

```
GET /api/documentos/:id/download
```

**Headers:** `Authorization: Bearer <token>`

**Response:** Archivo binario con headers apropiados
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="guia-95519.pdf"
```

---

## 6. Endpoints de Pagos

### 6.1 Listar Pagos de Operación

```
GET /api/operaciones/:operacionId/pagos
```

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "pagos": [
      {
        "id": "uuid",
        "tipo": "COBRO_CLIENTE",
        "monto": 3000000,
        "fechaPago": "2026-01-12",
        "metodoPago": "Transferencia",
        "referencia": "TRF-123456",
        "banco": "Banco Estado",
        "observaciones": null,
        "createdAt": "2026-01-12T11:00:00Z"
      }
    ],
    "resumen": {
      "totalOperacion": 7650000,
      "totalPagado": 3000000,
      "saldoPendiente": 4650000
    }
  }
}
```

---

### 6.2 Registrar Pago

```
POST /api/operaciones/:operacionId/pagos
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "tipo": "COBRO_CLIENTE",
  "monto": 3000000,
  "fechaPago": "2026-01-12",
  "metodoPago": "Transferencia",
  "banco": "Banco Estado",
  "referencia": "TRF-123456",
  "observaciones": "Pago parcial"
}
```

**Validaciones:**
- `tipo`: requerido, enum válido
- `monto`: requerido, > 0
- `fechaPago`: requerido, no futura
- Operación no debe estar cerrada

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tipo": "COBRO_CLIENTE",
    "monto": 3000000,
    "message": "Pago registrado correctamente"
  }
}
```

---

### 6.3 Actualizar Pago

```
PUT /api/pagos/:id
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "monto": 3500000,
  "fechaPago": "2026-01-12",
  "metodoPago": "Transferencia",
  "referencia": "TRF-123456-REV",
  "observaciones": "Monto corregido"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "message": "Pago actualizado correctamente"
  }
}
```

---

### 6.4 Eliminar Pago

```
DELETE /api/pagos/:id
```

**Headers:** `Authorization: Bearer <token>`

**Validaciones:**
- Operación no debe estar cerrada

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Pago eliminado correctamente"
  }
}
```

---

## 7. Endpoints de Factoring

### 7.1 Obtener Factoring de Operación

```
GET /api/operaciones/:operacionId/factoring
```

**Headers:** `Authorization: Bearer <token>`

**Response 200 (si existe):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "empresaFactoring": "Factoring Chile S.A.",
    "fechaFactoring": "2026-01-10",
    "montoFactura": 7650000,
    "montoAdelantado": 6500000,
    "comisionFactoring": 150000,
    "fechaVencimiento": "2026-02-10",
    "observaciones": null,
    "createdAt": "2026-01-10T14:00:00Z"
  }
}
```

**Response 200 (si no existe):**
```json
{
  "success": true,
  "data": null
}
```

---

### 7.2 Registrar Factoring

```
POST /api/operaciones/:operacionId/factoring
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "empresaFactoring": "Factoring Chile S.A.",
  "fechaFactoring": "2026-01-10",
  "montoFactura": 7650000,
  "montoAdelantado": 6500000,
  "comisionFactoring": 150000,
  "fechaVencimiento": "2026-02-10",
  "observaciones": "Factoring a 30 días"
}
```

**Validaciones:**
- Solo para operaciones tipo VENTA_*
- Operación debe tener documento tipo FACTURA
- No debe existir factoring previo
- `montoAdelantado` <= `montoFactura`

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "message": "Factoring registrado correctamente"
  }
}
```

---

### 7.3 Actualizar Factoring

```
PUT /api/factoring/:id
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "montoAdelantado": 6800000,
  "comisionFactoring": 120000,
  "fechaVencimiento": "2026-02-15",
  "observaciones": "Monto renegociado"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "message": "Factoring actualizado correctamente"
  }
}
```

---

### 7.4 Eliminar Factoring

```
DELETE /api/factoring/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Factoring eliminado correctamente"
  }
}
```

---

## 8. Endpoints de Contactos

### 8.1 Listar Proveedores

```
GET /api/proveedores
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `buscar` | string | Búsqueda por nombre o RUT |
| `activo` | boolean | Filtrar por estado activo |
| `page` | number | Página (default: 1) |
| `pageSize` | number | Items por página (default: 20) |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "rut": "77.442.030-4",
      "razonSocial": "FORESTAL ANDES LIMITADA",
      "nombreFantasia": "Forestal Andes",
      "direccion": "Camino Freire a Barros Arana KM.2",
      "comuna": "Freire",
      "ciudad": "Temuco",
      "telefono": "45-2378200",
      "email": "administracion@forestalandes.cl",
      "activo": true,
      "totalOperaciones": 15,
      "ultimaOperacion": "2026-01-10"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1
  }
}
```

---

### 8.2 Obtener Proveedor

```
GET /api/proveedores/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "rut": "77.442.030-4",
    "razonSocial": "FORESTAL ANDES LIMITADA",
    "nombreFantasia": "Forestal Andes",
    "direccion": "Camino Freire a Barros Arana KM.2",
    "comuna": "Freire",
    "ciudad": "Temuco",
    "telefono": "45-2378200",
    "email": "administracion@forestalandes.cl",
    "activo": true,
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-10T00:00:00Z",
    "estadisticas": {
      "totalOperaciones": 15,
      "operacionesAbiertas": 2,
      "ultimaOperacion": "2026-01-10",
      "montoTotal": 45000000
    }
  }
}
```

---

### 8.3 Crear Proveedor

```
POST /api/proveedores
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rut": "77.442.030-4",
  "razonSocial": "FORESTAL ANDES LIMITADA",
  "nombreFantasia": "Forestal Andes",
  "direccion": "Camino Freire a Barros Arana KM.2",
  "comuna": "Freire",
  "ciudad": "Temuco",
  "telefono": "45-2378200",
  "email": "administracion@forestalandes.cl"
}
```

**Validaciones:**
- `rut`: requerido, formato válido, dígito verificador, único
- `razonSocial`: requerido
- `email`: formato válido si se proporciona

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "rut": "77.442.030-4",
    "razonSocial": "FORESTAL ANDES LIMITADA",
    "message": "Proveedor creado correctamente"
  }
}
```

---

### 8.4 Actualizar Proveedor

```
PUT /api/proveedores/:id
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "nombreFantasia": "Forestal Andes Ltda.",
  "telefono": "45-2378201",
  "email": "ventas@forestalandes.cl"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "message": "Proveedor actualizado correctamente"
  }
}
```

---

### 8.5 Activar/Desactivar Proveedor

```
PATCH /api/proveedores/:id/estado
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "activo": false
}
```

**Validaciones:**
- No se puede desactivar si tiene operaciones abiertas

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "activo": false,
    "message": "Estado actualizado correctamente"
  }
}
```

---

### 8.6 Endpoints de Clientes

Los endpoints de clientes son idénticos a proveedores:

```
GET    /api/clientes              # Listar
GET    /api/clientes/:id          # Obtener
POST   /api/clientes              # Crear
PUT    /api/clientes/:id          # Actualizar
PATCH  /api/clientes/:id/estado   # Activar/Desactivar
```

---

## 9. Endpoints de Tipos de Pallet

### 9.1 Listar Tipos de Pallet

```
GET /api/tipos-pallet
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `activo` | boolean | Filtrar por estado activo (default: true) |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "codigo": "PV",
      "nombre": "Pallet Verde",
      "descripcion": "Pallet de madera sin tratamiento",
      "requiereCertificacion": false,
      "activo": true
    },
    {
      "id": "uuid",
      "codigo": "PR",
      "nombre": "Pallet Rústico",
      "descripcion": "Pallet de madera con acabado básico",
      "requiereCertificacion": false,
      "activo": true
    },
    {
      "id": "uuid",
      "codigo": "PC",
      "nombre": "Pallet Certificado",
      "descripcion": "Pallet con tratamiento fitosanitario NIMF-15",
      "requiereCertificacion": true,
      "activo": true
    }
  ]
}
```

---

### 9.2 Crear Tipo de Pallet

```
POST /api/tipos-pallet
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "codigo": "PE",
  "nombre": "Pallet Especial",
  "descripcion": "Pallet con dimensiones especiales",
  "requiereCertificacion": false
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "codigo": "PE",
    "message": "Tipo de pallet creado correctamente"
  }
}
```

---

## 10. Endpoints de Reportes

### 10.1 Reporte de Operaciones por Período

```
GET /api/reportes/operaciones
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `fechaDesde` | date | Fecha inicio (requerido) |
| `fechaHasta` | date | Fecha fin (requerido) |
| `tipo` | string | Filtrar por tipo |
| `formato` | string | json (default), csv, excel |

**Response 200 (JSON):**
```json
{
  "success": true,
  "data": {
    "periodo": {
      "desde": "2026-01-01",
      "hasta": "2026-01-31"
    },
    "resumen": {
      "totalOperaciones": 45,
      "compras": 20,
      "ventasDirectas": 18,
      "ventasComision": 7,
      "montoTotalCompras": 30000000,
      "montoTotalVentas": 45000000
    },
    "operaciones": [
      {
        "numero": "OP-2026-00130",
        "tipo": "VENTA_DIRECTA",
        "fecha": "2026-01-12",
        "contacto": "Cermaq Chile S.A.",
        "productos": "500 PV, 50 PC",
        "monto": 7650000,
        "estadoDocumental": "COMPLETA",
        "estadoFinanciero": "PAGADA"
      }
    ]
  }
}
```

**Response (CSV/Excel):** Archivo descargable

---

### 10.2 Reporte de Pendientes

```
GET /api/reportes/pendientes
```

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "documentosFaltantes": [
      {
        "operacion": "OP-2026-00123",
        "tipo": "COMPRA",
        "fecha": "2026-01-08",
        "contacto": "Forestal Andes",
        "documentoFaltante": "Guía de Recepción",
        "diasPendiente": 4
      }
    ],
    "pagosPendientes": [
      {
        "operacion": "OP-2026-00120",
        "tipo": "VENTA_DIRECTA",
        "fecha": "2026-01-05",
        "contacto": "Cermaq Chile S.A.",
        "montoTotal": 5000000,
        "montoPagado": 2500000,
        "saldoPendiente": 2500000,
        "diasPendiente": 7
      }
    ],
    "resumen": {
      "operacionesConDocsFaltantes": 5,
      "operacionesConPagosPendientes": 3,
      "montoTotalPendiente": 8500000
    }
  }
}
```

---

### 10.3 Reporte por Contacto

```
GET /api/reportes/contacto/:id
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `fechaDesde` | date | Fecha inicio |
| `fechaHasta` | date | Fecha fin |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "contacto": {
      "id": "uuid",
      "tipo": "PROVEEDOR",
      "razonSocial": "FORESTAL ANDES LIMITADA",
      "rut": "77.442.030-4"
    },
    "periodo": {
      "desde": "2026-01-01",
      "hasta": "2026-01-31"
    },
    "resumen": {
      "totalOperaciones": 15,
      "montoTotal": 45000000,
      "operacionesAbiertas": 2,
      "operacionesCerradas": 13
    },
    "operaciones": [
      {
        "numero": "OP-2026-00125",
        "fecha": "2026-01-10",
        "productos": "1000 PC",
        "monto": 18000000,
        "estadoDocumental": "COMPLETA",
        "estadoFinanciero": "PAGADA"
      }
    ]
  }
}
```

---

### 10.4 Exportar Operaciones

```
GET /api/reportes/exportar
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `fechaDesde` | date | Fecha inicio |
| `fechaHasta` | date | Fecha fin |
| `tipo` | string | Filtrar por tipo |
| `formato` | string | csv, excel |

**Response:** Archivo descargable
```
Content-Type: text/csv | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="operaciones-2026-01.csv"
```

---

## 11. Resumen de Endpoints

### Total: 35 Endpoints

| Módulo | Endpoints | Métodos |
|--------|-----------|---------|
| Auth | 4 | POST, GET, PUT |
| Dashboard | 1 | GET |
| Operaciones | 6 | GET, POST, PUT, DELETE |
| Documentos | 4 | GET, POST, DELETE |
| Pagos | 4 | GET, POST, PUT, DELETE |
| Factoring | 4 | GET, POST, PUT, DELETE |
| Proveedores | 5 | GET, POST, PUT, PATCH |
| Clientes | 5 | GET, POST, PUT, PATCH |
| Tipos Pallet | 2 | GET, POST |
| Reportes | 4 | GET |

### Matriz de Endpoints por Prioridad

| Prioridad | Endpoints | Descripción |
|-----------|-----------|-------------|
| 🔴 Crítica | 15 | Auth, CRUD Operaciones, Documentos, Dashboard |
| 🟡 Alta | 12 | Pagos, Contactos básico |
| 🟢 Media | 8 | Factoring, Reportes, Tipos Pallet |

---

## 12. Consideraciones de Implementación

### 12.1 Seguridad
- Todas las rutas (excepto login) requieren autenticación
- Validar JWT en middleware
- Sanitizar inputs para prevenir SQL injection
- Validar tipos de archivo en uploads
- Rate limiting en endpoints sensibles

### 12.2 Performance
- Paginación obligatoria en listas
- Índices en campos de búsqueda
- Caché de catálogos (tipos pallet)
- Lazy loading de relaciones

### 12.3 Archivos
- Almacenar en `/uploads/docs/`
- Nombrar con UUID + extensión
- Validar MIME type en servidor
- Límite 10MB por archivo

### 12.4 Transacciones
- Usar transacciones para operaciones multi-tabla
- Rollback en caso de error
- Logs de auditoría

---

*Documento listo para implementación del backend*

