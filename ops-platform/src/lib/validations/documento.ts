/**
 * Schemas de validación para Documentos
 */

import { z } from 'zod'

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
  numeroDocumento: z.string().optional(),
  fechaDocumento: z.string().or(z.date()).optional(),
  observaciones: z.string().optional(),
  esObligatorio: z.boolean().default(true),
  // Datos de transporte (para guías)
  choferNombre: z.string().optional(),
  choferRut: z.string().optional(),
  vehiculoPatente: z.string().optional(),
  transportista: z.string().optional(),
  cantidadDocumento: z.number().int().min(0).optional(),
  cantidadDanada: z.number().int().min(0).optional(),
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




