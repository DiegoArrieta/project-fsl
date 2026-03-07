# Arquitectura de Storage de Documentos
## Sistema de Gestión Operativa - Forestal Santa Lucía SpA

**Versión:** 1.0  
**Fecha:** 2026-01-27  
**Estado:** Definición Arquitectónica  

---

## Resumen Ejecutivo

Este documento define la estrategia de almacenamiento de documentos del sistema, estableciendo una arquitectura de dos fases:
1. **Fase de Desarrollo (MVP):** Uso de mocks para agilizar el desarrollo
2. **Fase de Producción:** Integración con Amazon S3 como servicio de almacenamiento definitivo

---

## Decisión Arquitectónica

### Storage Backend: Amazon S3

**Justificación:**
- ✅ **Escalabilidad**: Crece automáticamente sin límites
- ✅ **Durabilidad**: 99.999999999% (11 nueves) de durabilidad
- ✅ **Disponibilidad**: 99.99% SLA
- ✅ **Costo-efectivo**: Pago por uso real, sin costos fijos
- ✅ **Seguridad**: Encriptación en reposo y en tránsito
- ✅ **Integración**: SDK maduro para Node.js
- ✅ **Gestión de ciclo de vida**: Políticas automáticas de archivado

---

## Arquitectura de Dos Fases

### Fase 1: Desarrollo con Mocks

**Objetivo:** Permitir desarrollo y testing sin infraestructura externa

**Implementación:**
```typescript
// src/lib/storage/mock.ts
export async function uploadDocument(file: File): Promise<string> {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Retornar URL mock
  return `/uploads/mock/${Date.now()}-${file.name}`
}

export async function deleteDocument(url: string): Promise<void> {
  // Simular eliminación
  await new Promise(resolve => setTimeout(resolve, 200))
}

export async function getDocumentUrl(key: string): Promise<string> {
  // Retornar URL mock
  return `/uploads/mock/${key}`
}
```

**Ventajas:**
- ✅ Desarrollo rápido sin dependencias externas
- ✅ Testing sencillo
- ✅ Sin costos de infraestructura durante desarrollo
- ✅ No requiere credenciales AWS

---

### Fase 2: Producción con Amazon S3

**Objetivo:** Almacenamiento robusto y escalable en producción

**Implementación:**
```typescript
// src/lib/storage/s3.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET!

export async function uploadDocument(file: Buffer, key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  })
  
  await s3Client.send(command)
  
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
}

export async function deleteDocument(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })
  
  await s3Client.send(command)
}

export async function getSignedDocumentUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })
  
  return await getSignedUrl(s3Client, command, { expiresIn })
}
```

---

## Capa de Abstracción

**Objetivo:** APIs agnósticas del backend de storage

```typescript
// src/lib/storage/index.ts
import * as mockStorage from './mock'
import * as s3Storage from './s3'

const USE_MOCK = process.env.USE_MOCK_STORAGE === 'true'

export const storage = USE_MOCK ? mockStorage : s3Storage

// Uso en APIs:
import { storage } from '@/lib/storage'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  
  // El storage backend se decide por variable de entorno
  const url = await storage.uploadDocument(file)
  
  // Guardar metadata en BD
  await prisma.documento.create({
    data: {
      archivoUrl: url,
      // ...
    },
  })
}
```

**Ventajas:**
- ✅ Cambio transparente entre mocks y S3
- ✅ Sin cambios en código de APIs
- ✅ Sin cambios en frontend
- ✅ Facilita testing

---

## Estructura de Almacenamiento en S3

### Organización de Buckets

```
fsl-documentos/
├── operaciones/
│   ├── 2026/
│   │   ├── OP-2026-00001/
│   │   │   ├── orden-compra-cliente-{uuid}.pdf
│   │   │   ├── guia-despacho-{uuid}.pdf
│   │   │   ├── factura-{uuid}.pdf
│   │   │   └── certificado-nimf15-{uuid}.pdf
│   │   └── OP-2026-00002/
│   └── 2027/
├── ordenes-compra/
│   ├── 2026/
│   │   ├── OC-2026-00001.pdf
│   │   └── OC-2026-00002.pdf
│   └── 2027/
└── temp/
    └── {uuid}-{filename} (archivos temporales, se limpian después de 24h)
```

### Nomenclatura de Archivos

**Formato:** `{tipo}-{timestamp}-{uuid}.{extension}`

**Ejemplos:**
- `orden-compra-cliente-1706380800000-a1b2c3d4.pdf`
- `guia-despacho-1706380800000-e5f6g7h8.pdf`
- `factura-1706380800000-i9j0k1l2.pdf`

**Ventajas:**
- ✅ Nombres únicos (UUID)
- ✅ Ordenamiento temporal
- ✅ Tipo de documento identificable
- ✅ Sin conflictos de nombres

---

## Configuración de S3

### Política de Bucket

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAppAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:user/fsl-app"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::fsl-documentos/*"
    }
  ]
}
```

### CORS Configuration

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://app.forestalsantalucia.cl"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### Lifecycle Rules

```json
{
  "Rules": [
    {
      "Id": "DeleteTempFiles",
      "Status": "Enabled",
      "Prefix": "temp/",
      "Expiration": {
        "Days": 1
      }
    },
    {
      "Id": "TransitionToIA",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "STANDARD_IA"
        }
      ]
    }
  ]
}
```

---

## Variables de Entorno

### Desarrollo (Mocks)

```env
USE_MOCK_STORAGE=true
```

### Producción (S3)

```env
USE_MOCK_STORAGE=false
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_S3_BUCKET=fsl-documentos
```

---

## Seguridad

### Encriptación

- **En Reposo**: AES-256 (SSE-S3)
- **En Tránsito**: TLS 1.2+

### Acceso

- **Signed URLs**: URLs temporales con expiración (default: 1 hora)
- **IAM Policies**: Acceso restrictivo por usuario/aplicación
- **Bucket Policies**: Bloqueo de acceso público

### Validaciones en Aplicación

```typescript
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export function validateFile(file: File): void {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipo de archivo no permitido')
  }
  
  if (file.size > MAX_SIZE) {
    throw new Error('Archivo demasiado grande (máx 10 MB)')
  }
}
```

---

## Migración de Mocks a S3

### Pasos

1. **Preparación**
   - Crear bucket S3
   - Configurar IAM user con permisos
   - Obtener credenciales
   
2. **Configuración**
   - Agregar variables de entorno de AWS
   - Instalar `@aws-sdk/client-s3` y `@aws-sdk/s3-request-presigner`
   
3. **Activación**
   - Cambiar `USE_MOCK_STORAGE=false`
   - Reiniciar aplicación
   
4. **Verificación**
   - Probar upload de documento
   - Verificar archivo en S3
   - Probar descarga con signed URL

**Tiempo estimado:** 2-3 horas

---

## Monitoreo y Costos

### Métricas a Monitorear

- Número de objetos almacenados
- Tamaño total de almacenamiento
- Número de requests (PUT, GET, DELETE)
- Errores de upload/download

### Estimación de Costos (AWS us-east-1)

**Supuestos:**
- 500 documentos/mes
- Tamaño promedio: 500 KB
- Retención: 5 años

**Cálculo:**
- Storage: 500 docs/mes × 12 meses × 5 años × 0.5 MB = 15 GB
- Costo storage: 15 GB × $0.023/GB = **$0.35/mes**
- Requests: ~2,000 PUT + ~5,000 GET/mes
- Costo requests: **$0.02/mes**

**Total estimado: ~$0.40/mes** (insignificante)

---

## Anexo: Dependencias

### Desarrollo (Mocks)

Ninguna dependencia adicional requerida.

### Producción (S3)

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.500.0",
    "@aws-sdk/s3-request-presigner": "^3.500.0"
  }
}
```

---

## Conclusión

Esta arquitectura permite:
- ✅ Desarrollo rápido con mocks
- ✅ Migración transparente a S3
- ✅ Escalabilidad sin límites
- ✅ Costos predecibles y bajos
- ✅ Alta durabilidad y disponibilidad
- ✅ Seguridad enterprise-grade

La implementación por fases reduce riesgos y permite validar el sistema antes de incurrir en costos de infraestructura.




