/**
 * Schemas de validación para Documentos
 */

import { z } from 'zod'

/** FormData devuelve `null` si el campo no va en el multipart; Zod `.optional()` espera `undefined`. */
function optionalFormString(maxLen: number) {
  return z.preprocess(
    (val) => {
      if (val == null || val === '') return undefined
      const s = String(val).trim()
      return s === '' ? undefined : s
    },
    z.string().max(maxLen).optional()
  )
}

function optionalFormUnitCount() {
  return z.preprocess((val) => {
    if (val == null || val === '') return undefined
    const n = typeof val === 'number' ? val : parseInt(String(val), 10)
    if (Number.isNaN(n)) return undefined
    return n
  }, z.number().int().min(0).optional())
}

// Schema para crear documento
export const createDocumentoSchema = z.object({
  operacionId: z.string().uuid({ message: 'ID de operación es requerido' }),
  tipo: z.enum([
    'ORDEN_COMPRA',
    'ORDEN_COMPRA_CLIENTE',
    'GUIA_DESPACHO',
    'GUIA_RECEPCION',
    'FACTURA',
    'CERTIFICADO_NIMF15',
    'OTRO',
  ] as const),
  numeroDocumento: optionalFormString(50),
  fechaDocumento: z.preprocess(
    (val) => {
      if (val == null || val === '') return undefined
      const s = String(val).trim()
      return s === '' ? undefined : s
    },
    z.union([z.string(), z.date()]).optional()
  ),
  observaciones: z.preprocess(
    (val) => {
      if (val == null || val === '') return undefined
      const s = String(val).trim()
      return s === '' ? undefined : s
    },
    z.string().optional()
  ),
  esObligatorio: z.boolean().default(true),
  // Datos de transporte (para guías; todos opcionales)
  choferNombre: optionalFormString(100),
  choferRut: optionalFormString(12),
  vehiculoPatente: optionalFormString(10),
  transportista: optionalFormString(255),
  cantidadDocumento: optionalFormUnitCount(),
  cantidadDanada: optionalFormUnitCount(),
})

// Schema para actualizar documento
export const updateDocumentoSchema = z.object({
  tipo: z.enum([
    'ORDEN_COMPRA',
    'ORDEN_COMPRA_CLIENTE',
    'GUIA_DESPACHO',
    'GUIA_RECEPCION',
    'FACTURA',
    'CERTIFICADO_NIMF15',
    'OTRO',
  ] as const).optional(),
  numeroDocumento: z.string().optional(),
  fechaDocumento: z.string().or(z.date()).optional(),
  observaciones: z.string().optional(),
  esObligatorio: z.boolean().optional(),
  choferNombre: z.string().optional(),
  choferRut: z.string().optional(),
  vehiculoPatente: z.string().optional(),
  transportista: z.string().optional(),
  cantidadDocumento: z.number().int().min(0).optional(),
  cantidadDanada: z.number().int().min(0).optional(),
})

// Tipos inferidos
export type CreateDocumento = z.infer<typeof createDocumentoSchema>
export type UpdateDocumento = z.infer<typeof updateDocumentoSchema>





