# API Specification Document - Forestal Santa Lucía

**Versión:** 1.4  
**Fecha:** 2026-01-15  
**Basado en:** SDD v2.5, DATABASE-SCHEMA v1.3, UI-SPEC v1.4  
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
- **Método:** Auth.js (NextAuth.js v5) con Credentials Provider
- **Sesiones:** Cookies HTTP-only (seguras)
- **Header:** `Authorization: Bearer <token>` o cookies de sesión
- **Duración:** 7 días (configurable)
- **Hash de Contraseñas:** Node.js `crypto` con `bcrypt`, salt rounds: 10
- **Seguridad:** Contraseñas nunca almacenadas en texto plano, siempre hasheadas con bcrypt

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

**Nota:** Este endpoint utiliza Auth.js (NextAuth.js v5) con Credentials Provider. La autenticación se maneja mediante sesiones con cookies HTTP-only.

**Request Body:**
```json
{
  "email": "admin@forestalsantalucia.cl",
  "password": "********",
  "rememberMe": true
}
```

**Proceso de Autenticación:**
1. Sistema busca usuario por email en base de datos
2. Verifica contraseña usando `bcrypt.compare(password, user.password_hash)` (salt rounds: 10)
3. Si es válida, Auth.js crea sesión segura con cookie HTTP-only
4. Retorna información del usuario (sin password_hash)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@forestalsantalucia.cl",
      "nombre": "Administrador"
    },
    "session": {
    "expiresAt": "2026-01-19T10:30:00Z"
    }
  }
}
```

**Nota de Implementación:**
- Usar Auth.js Credentials Provider
- Verificar contraseña con `bcrypt.compare(password, storedHash)`
- Crear sesión segura con cookies HTTP-only
- Nunca retornar password_hash en respuestas
- Contraseñas se hashean con `bcrypt.hash(password, 10)` al crear/actualizar

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

**Headers:** `Authorization: Bearer <token>` o sesión de Auth.js

**Request Body:**
```json
{
  "currentPassword": "********",
  "newPassword": "********",
  "confirmPassword": "********"
}
```

**Validaciones:**
- `currentPassword`: Debe coincidir con hash almacenado (verificar con `bcrypt.compare(currentPassword, user.password_hash)`)
- `newPassword`: Mínimo 8 caracteres
- `confirmPassword`: Debe coincidir con `newPassword`
- Nueva contraseña se hashea con `bcrypt.hash(newPassword, 10)` antes de guardar

**Proceso:**
1. Verificar contraseña actual con `bcrypt.compare(currentPassword, user.password_hash)`
2. Validar nueva contraseña (mínimo 8 caracteres)
3. Hashear nueva contraseña con `bcrypt.hash(newPassword, 10)`
4. Actualizar `password_hash` en base de datos
5. Nunca almacenar contraseña en texto plano

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Contraseña actualizada correctamente"
  }
}
```

**Nota de Implementación:**
- Usar `bcrypt.hash(newPassword, 10)` para generar hash de nueva contraseña
- Usar `bcrypt.compare(currentPassword, storedHash)` para verificar contraseña actual
- Nunca almacenar contraseñas en texto plano
- Salt rounds: 10 (configuración estándar de seguridad)

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
        "rut": "76123456-7"
      },
      "proveedor": {
        "id": "uuid",
        "razonSocial": "Forestal Andes Ltda.",
        "rut": "77442030-4"
      },
      "estadoDocumental": "INCOMPLETA",
      "estadoFinanciero": "FACTURADA",
      "documentosPresentes": 2,
      "documentosRequeridos": 3,
      "totalVenta": 17100000,
      "totalCompra": 12800000,
      "margenBruto": 4300000,
      "margenPorcentual": 25.1,
      "resumenProductos": "1000 Pallet Verde, 200 Pallet Certificado",
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
      "rut": "76123456-7",
      "razonSocial": "Cermaq Chile S.A.",
      "nombreFantasia": "Cermaq",
      "direccion": "Puerto Montt",
      "telefono": "65-1234567",
      "email": "contacto@cermaq.cl"
    },
    "proveedor": {
      "id": "uuid",
      "rut": "77442030-4",
      "razonSocial": "FORESTAL ANDES LIMITADA",
      "nombreFantasia": "Forestal Andes",
      "direccion": "Camino Freire a Barros Arana KM.2",
      "comuna": "Freire",
      "ciudad": "Temuco",
      "telefono": "45-2378200",
      "email": "administracion@forestalandes.cl"
    },
    "estadoDocumental": "INCOMPLETA",
    "estadoFinanciero": "FACTURADA",
    "direccionEntrega": "Puerto Montt, Av. Principal 123",
    "ordenCompraCliente": "OC-36",
    "ordenCompraGenerada": {
      "id": "uuid",
      "numero": "OC-2026-00015",
      "estado": "ENVIADA",
      "pdfUrl": "/uploads/ocs/oc-2026-00015.pdf"
    },
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
        "cantidad": 1000,
        "cantidadEntregada": 990,
        "cantidadDanada": 10,
        "precioUnitario": null,
        "precioVentaUnitario": 13500,
        "precioCompraUnitario": 10000,
        "margenUnitario": 3500,
        "subtotalVenta": 13500000,
        "subtotalCompra": 10000000,
        "margenSubtotal": 3500000
      },
      {
        "id": "uuid",
        "tipoPallet": {
          "id": "uuid",
          "codigo": "PC",
          "nombre": "Pallet Certificado",
          "requiereCertificacion": true
        },
        "cantidad": 200,
        "cantidadEntregada": 200,
        "cantidadDanada": 0,
        "precioUnitario": null,
        "precioVentaUnitario": 18000,
        "precioCompraUnitario": 14000,
        "margenUnitario": 4000,
        "subtotalVenta": 3600000,
        "subtotalCompra": 2800000,
        "margenSubtotal": 800000
      }
    ],
    "totalVenta": 17100000,
    "totalCompra": 12800000,
    "margenBruto": 4300000,
    "margenPorcentual": 25.1,
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
        "choferRut": "12345678-9",
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
  "proveedorId": "uuid",
  "direccionEntrega": "Puerto Montt, Av. Principal 123",
  "ordenCompraCliente": "OC-36",
  "observaciones": "Entregar antes de las 14:00",
  "lineas": [
    {
      "tipoPalletId": "uuid",
      "cantidad": 1000,
      "precioVentaUnitario": 13500,
      "precioCompraUnitario": 10000
    },
    {
      "tipoPalletId": "uuid",
      "cantidad": 200,
      "precioVentaUnitario": 18000,
      "precioCompraUnitario": 14000
    }
  ]
}
```

**Validaciones:**
- `tipo`: requerido, enum válido
- `fecha`: requerido, no futura
- `clienteId`: requerido si tipo es VENTA_*
- `proveedorId`: requerido si tipo es COMPRA o VENTA_* (obligatorio en operaciones unificadas)
- `ordenCompraCliente`: opcional, recomendado para operaciones de venta (número de OC que el cliente emitió a FSL)
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
| `cantidadDocumento` | number | No | Cantidad total declarada (para guías) |
| `cantidadDanada` | number | No | Cantidad de pallets dañados (para guías) |
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
    "choferRut": "12345678-9",
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
      "rut": "77442030-4",
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
- `rut`: requerido, formato válido (sin puntos, solo guión antes del dígito verificador, ej: `77442030-4`), dígito verificador, único
- `razonSocial`: requerido
- `email`: formato válido si se proporciona

**Nota sobre formato de RUT:**
- El RUT se almacena y se envía en la API **sin puntos**, solo con guión antes del dígito verificador
- Formato: `12345678-9` (sin puntos)
- El sistema debe normalizar el RUT al recibirlo (eliminar puntos si los hay)

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

## 9. Endpoints de Órdenes de Compra

### 9.1 Listar Órdenes de Compra

```
GET /api/ordenes-compra
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | number | Página (default: 1) |
| `pageSize` | number | Items por página (default: 10, max: 50) |
| `proveedorId` | uuid | Filtrar por proveedor |
| `estado` | string | BORRADOR, ENVIADA, RECIBIDA, CANCELADA |
| `fechaDesde` | date | Fecha inicio (YYYY-MM-DD) |
| `fechaHasta` | date | Fecha fin (YYYY-MM-DD) |
| `buscar` | string | Búsqueda por número de OC |
| `ordenar` | string | fecha_desc (default), fecha_asc, numero |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "numero": "OC-2026-00015",
      "proveedor": {
        "id": "uuid",
        "razonSocial": "Forestal Andes Ltda.",
        "rut": "77442030-4"
      },
      "fecha": "2026-01-12",
      "fechaEntrega": "2026-01-20",
      "estado": "ENVIADA",
      "pdfGenerado": true,
      "totalProductos": 2,
      "totalCantidad": 1200,
      "totalMonto": 17100000,
      "createdAt": "2026-01-12T10:00:00Z"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "pageSize": 10,
    "totalPages": 2
  }
}
```

---

### 9.2 Obtener Orden de Compra por ID

```
GET /api/ordenes-compra/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "numero": "OC-2026-00015",
    "proveedor": {
      "id": "uuid",
      "rut": "77442030-4",
      "razonSocial": "FORESTAL ANDES LIMITADA",
      "nombreFantasia": "Forestal Andes",
      "direccion": "Camino Freire a Barros Arana KM.2",
      "comuna": "Freire",
      "ciudad": "Temuco",
      "telefono": "45-2378200",
      "email": "administracion@forestalandes.cl"
    },
    "fecha": "2026-01-12",
    "fechaEntrega": "2026-01-20",
    "direccionEntrega": "Puerto Montt, Av. Principal 123",
    "observaciones": "Entregar antes de las 14:00",
    "operacionId": null,
    "estado": "ENVIADA",
    "pdfGenerado": true,
    "pdfUrl": "/uploads/ocs/oc-2026-00015.pdf",
    "lineas": [
      {
        "id": "uuid",
        "tipoPallet": {
          "id": "uuid",
          "codigo": "PV",
          "nombre": "Pallet Verde",
          "requiereCertificacion": false
        },
        "cantidad": 1000,
        "precioUnitario": 13500,
        "subtotal": 13500000,
        "descripcion": null
      },
      {
        "id": "uuid",
        "tipoPallet": {
          "id": "uuid",
          "codigo": "PC",
          "nombre": "Pallet Certificado",
          "requiereCertificacion": true
        },
        "cantidad": 200,
        "precioUnitario": 18000,
        "subtotal": 3600000,
        "descripcion": null
      }
    ],
    "totalMonto": 17100000,
    "createdAt": "2026-01-12T10:00:00Z",
    "updatedAt": "2026-01-12T10:30:00Z"
  }
}
```

---

### 9.3 Crear Orden de Compra

```
POST /api/ordenes-compra
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "proveedorId": "uuid",
  "fecha": "2026-01-12",
  "fechaEntrega": "2026-01-20",
  "direccionEntrega": "Puerto Montt, Av. Principal 123",
  "observaciones": "Entregar antes de las 14:00",
  "operacionId": null,
  "lineas": [
    {
      "tipoPalletId": "uuid",
      "cantidad": 1000,
      "precioUnitario": 13500,
      "descripcion": null
    },
    {
      "tipoPalletId": "uuid",
      "cantidad": 200,
      "precioUnitario": 18000,
      "descripcion": null
    }
  ]
}
```

**Validaciones:**
- `proveedorId`: requerido, debe existir y estar activo
- `fecha`: requerido, no futura
- `fechaEntrega`: opcional, debe ser >= fecha
- `lineas`: al menos 1 línea
- `lineas[].cantidad`: > 0
- `lineas[].tipoPalletId`: debe existir y estar activo

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "numero": null,
    "estado": "BORRADOR",
    "pdfGenerado": false,
    "message": "Orden de compra creada correctamente"
  }
}
```

---

### 9.4 Actualizar Orden de Compra

```
PUT /api/ordenes-compra/:id
```

**Headers:** `Authorization: Bearer <token>`

**Validaciones:**
- Solo se puede editar si `estado` = BORRADOR
- No se puede editar si `pdfGenerado` = true

**Request Body:**
```json
{
  "fecha": "2026-01-12",
  "fechaEntrega": "2026-01-21",
  "direccionEntrega": "Puerto Montt, Av. Principal 456",
  "observaciones": "Actualizado: entregar a las 16:00",
  "lineas": [
    {
      "id": "uuid-existente",
      "cantidad": 1200,
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

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "numero": null,
    "message": "Orden de compra actualizada correctamente"
  }
}
```

---

### 9.5 Generar PDF de Orden de Compra

```
POST /api/ordenes-compra/:id/generar-pdf
```

**Headers:** `Authorization: Bearer <token>`

**Validaciones:**
- OC debe tener al menos una línea de producto
- OC no debe tener PDF generado previamente
- OC debe estar en estado BORRADOR

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "numero": "OC-2026-00015",
    "estado": "ENVIADA",
    "pdfGenerado": true,
    "pdfUrl": "/uploads/ocs/oc-2026-00015.pdf",
    "message": "PDF generado correctamente"
  }
}
```

**Proceso:**
1. Sistema genera número secuencial (OC-YYYY-NNNNN)
2. Sistema crea PDF con formato profesional
3. PDF se guarda en `/uploads/ocs/`
4. Estado cambia automáticamente a ENVIADA
5. Se retorna URL del PDF para descarga

---

### 9.6 Descargar PDF de Orden de Compra

```
GET /api/ordenes-compra/:id/pdf
```

**Headers:** `Authorization: Bearer <token>`

**Response:** Archivo PDF binario con headers apropiados
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="OC-2026-00015.pdf"
```

**Validaciones:**
- OC debe tener PDF generado (`pdfGenerado` = true)

---

### 9.7 Cambiar Estado de Orden de Compra

```
PATCH /api/ordenes-compra/:id/estado
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "estado": "RECIBIDA"
}
```

**Validaciones:**
- `estado`: requerido, enum válido
- No se puede cambiar a BORRADOR si ya tiene PDF generado
- No se puede cancelar si está RECIBIDA

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "numero": "OC-2026-00015",
    "estado": "RECIBIDA",
    "message": "Estado actualizado correctamente"
  }
}
```

---

### 9.8 Asociar Orden de Compra a Operación

```
PATCH /api/ordenes-compra/:id/asociar-operacion
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "operacionId": "uuid"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "numero": "OC-2026-00015",
    "operacionId": "uuid",
    "message": "Orden de compra asociada correctamente"
  }
}
```

---

### 9.9 Eliminar Orden de Compra

```
DELETE /api/ordenes-compra/:id
```

**Headers:** `Authorization: Bearer <token>`

**Validaciones:**
- Solo se puede eliminar si `estado` = BORRADOR
- No se puede eliminar si tiene PDF generado

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Orden de compra eliminada correctamente"
  }
}
```

---

## 10. Endpoints de Tipos de Pallet

### 10.1 Listar Tipos de Pallet

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

### 10.2 Crear Tipo de Pallet

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

## 11. Endpoints de Reportes

### 11.1 Reporte de Operaciones por Período

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

### 11.2 Reporte de Pendientes

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

### 11.3 Reporte por Contacto

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

### 11.4 Exportar Operaciones

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

## 12. Resumen de Endpoints

### Total: 44 Endpoints

| Módulo | Endpoints | Métodos |
|--------|-----------|---------|
| Auth | 4 | POST, GET, PUT |
| Dashboard | 1 | GET |
| Operaciones | 6 | GET, POST, PUT, DELETE |
| Órdenes de Compra | 9 | GET, POST, PUT, PATCH, DELETE |
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
| 🔴 Crítica | 24 | Auth, CRUD Operaciones, CRUD OC, Documentos, Dashboard |
| 🟡 Alta | 12 | Pagos, Contactos básico |
| 🟢 Media | 8 | Factoring, Reportes, Tipos Pallet |

---

## 13. Consideraciones de Implementación

### 13.1 Seguridad
- Todas las rutas (excepto login) requieren autenticación mediante Auth.js
- **Autenticación**: Auth.js (NextAuth.js v5) con Credentials Provider
- **Sesiones**: Cookies HTTP-only (seguras, no accesibles desde JavaScript)
- **Hash de Contraseñas**: 
  - Usar `bcrypt` con Node.js `crypto`
  - Salt rounds: 10
  - Generar hash: `bcrypt.hash(password, 10)`
  - Verificar: `bcrypt.compare(password, storedHash)`
  - Nunca almacenar contraseñas en texto plano
- Validar sesión en middleware de Auth.js
- Sanitizar inputs para prevenir SQL injection
- Validar tipos de archivo en uploads
- Rate limiting en endpoints sensibles

### 13.2 Performance
- Paginación obligatoria en listas
- Índices en campos de búsqueda
- Caché de catálogos (tipos pallet)
- Lazy loading de relaciones

### 13.3 Archivos
- Almacenar en `/uploads/docs/`
- Nombrar con UUID + extensión
- Validar MIME type en servidor
- Límite 10MB por archivo

### 13.4 Transacciones
- Usar transacciones para operaciones multi-tabla
- Rollback en caso de error
- Logs de auditoría

### 13.5 Generación de PDF
- Usar librería PDF (ej: `pdfkit`, `puppeteer`, `react-pdf`)
- Template profesional con logo de FSL
- Incluir todos los datos: proveedor, productos, totales
- Guardar PDF en `/uploads/ocs/` con nombre `oc-YYYY-NNNNN.pdf`
- Retornar URL para descarga inmediata

---

*Documento listo para implementación del backend*

