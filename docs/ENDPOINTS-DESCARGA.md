# Guía de Descarga de PDFs y Documentos
## Sistema de Gestión Operativa - Forestal Santa Lucía SpA

**Fecha:** 2026-01-27  
**Versión:** 1.0

---

## 📥 Endpoints de Descarga

### 1. Descargar PDF de Orden de Compra

**Endpoint:**
```
GET /api/ordenes-compra/[id]/descargar-pdf
```

**Descripción:**  
Descarga el PDF de una orden de compra específica. El PDF se genera en tiempo real con los datos actuales de la orden.

**Parámetros:**
- `id` (path): ID de la orden de compra

**Respuesta:**
- Archivo PDF con nombre `OC-YYYY-NNNNN.pdf`
- Content-Type: `application/pdf`
- Content-Disposition: `attachment`

**Ejemplo de uso:**
```bash
# Usando curl
curl -o orden-compra.pdf \
  http://localhost:3000/api/ordenes-compra/[id]/descargar-pdf

# Usando wget
wget -O orden-compra.pdf \
  http://localhost:3000/api/ordenes-compra/[id]/descargar-pdf

# En el navegador
http://localhost:3000/api/ordenes-compra/[id]/descargar-pdf
```

**Ejemplo con JavaScript (Frontend):**
```javascript
// Descargar PDF de orden de compra
async function descargarOrdenCompra(id) {
  const response = await fetch(`/api/ordenes-compra/${id}/descargar-pdf`)
  const blob = await response.blob()
  
  // Crear enlace de descarga
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `orden-compra-${id}.pdf`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}
```

---

### 2. Generar y Descargar PDF de Orden de Compra

**Endpoint:**
```
POST /api/ordenes-compra/[id]/generar-pdf
```

**Descripción:**  
Genera el PDF de una orden de compra en estado BORRADOR, lo guarda en el storage, actualiza la orden a estado ENVIADA y retorna el PDF en base64.

**Parámetros:**
- `id` (path): ID de la orden de compra

**Requisitos:**
- La orden debe estar en estado `BORRADOR`
- Debe tener al menos un producto

**Respuesta JSON:**
```json
{
  "success": true,
  "data": {
    "pdfGenerado": true,
    "pdfUrl": "/uploads/ocs/OC-2026-00001.pdf",
    "estado": "ENVIADA"
  },
  "pdf": {
    "url": "/uploads/ocs/OC-2026-00001.pdf",
    "base64": "data:application/pdf;base64,JVBERi0xLj..."
  },
  "message": "PDF generado correctamente"
}
```

**Ejemplo con JavaScript:**
```javascript
// Generar PDF (cambia estado a ENVIADA)
async function generarPDFOrdenCompra(id) {
  const response = await fetch(`/api/ordenes-compra/${id}/generar-pdf`, {
    method: 'POST',
  })
  const result = await response.json()
  
  if (result.success) {
    // Descargar desde base64
    const link = document.createElement('a')
    link.href = result.pdf.base64
    link.download = `orden-compra-${id}.pdf`
    link.click()
  }
}
```

---

### 3. Descargar Documentos Subidos

**Endpoint:**
```
GET /api/documentos/[id]/descargar
```

**Descripción:**  
Obtiene la URL de descarga de un documento previamente subido (guías, facturas, certificados, etc.).

**Parámetros:**
- `id` (path): ID del documento

**Respuesta JSON:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tipo": "FACTURA",
    "nombre": "factura-123.pdf",
    "downloadUrl": "/uploads/mock/1234567890-factura-123.pdf",
    "operacion": "OP-2026-00001"
  }
}
```

**Nota sobre Storage:**
- **Desarrollo (Mock):** Retorna URL local
- **Producción (S3):** Retorna Signed URL con expiración

---

## 🔄 Flujo Completo de Uso

### Flujo de Orden de Compra:

1. **Crear Orden en BORRADOR:**
   ```
   POST /api/ordenes-compra
   ```

2. **Agregar/Editar Productos:**
   ```
   PUT /api/ordenes-compra/[id]
   ```

3. **Generar PDF (cambia a ENVIADA):**
   ```
   POST /api/ordenes-compra/[id]/generar-pdf
   ```

4. **Descargar PDF posteriormente:**
   ```
   GET /api/ordenes-compra/[id]/descargar-pdf
   ```

---

## 🎯 Resumen de URLs

| Tipo | Método | Endpoint | Descripción |
|------|--------|----------|-------------|
| **OC - Descargar** | GET | `/api/ordenes-compra/[id]/descargar-pdf` | Descarga PDF directamente |
| **OC - Generar** | POST | `/api/ordenes-compra/[id]/generar-pdf` | Genera + cambia estado + retorna base64 |
| **Documentos** | GET | `/api/documentos/[id]/descargar` | Obtiene URL de descarga |

---

## 📝 Notas Importantes

1. **Autenticación:** Todos los endpoints requieren autenticación (Auth.js)
2. **Storage:**
   - Desarrollo: Archivos en mock (no se guardan realmente)
   - Producción: Amazon S3 con Signed URLs
3. **Formato:** Todos los PDFs son generados con jsPDF
4. **Tamaño máximo:** 10 MB para documentos subidos

---

**Documentación actualizada:** 2026-01-27




