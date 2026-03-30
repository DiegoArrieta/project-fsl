import { z } from 'zod'

export const solicitudCotizacionLineaSchema = z.object({
  tipoPalletId: z.string().uuid('ID de tipo de pallet inválido'),
  cantidad: z.coerce.number().int().positive('La cantidad debe ser mayor a 0'),
  descripcion: z.string().max(255).optional().nullable(),
})

export const createSolicitudCotizacionSchema = z.object({
  proveedorId: z.string().uuid('ID de proveedor inválido'),
  fecha: z.coerce.date({
    required_error: 'La fecha es requerida',
    invalid_type_error: 'Fecha inválida',
  }),
  observaciones: z.string().optional().nullable(),
  estado: z.enum(['BORRADOR', 'ENVIADO', 'CERRADO']).optional(),
  lineas: z.array(solicitudCotizacionLineaSchema).min(1, 'Debe haber al menos una línea'),
})

export const updateSolicitudCotizacionSchema = z.object({
  proveedorId: z.string().uuid().optional(),
  fecha: z.coerce.date().optional(),
  observaciones: z.string().optional().nullable(),
  estado: z.enum(['BORRADOR', 'ENVIADO', 'CERRADO']).optional(),
  lineas: z.array(solicitudCotizacionLineaSchema).min(1).optional(),
})

export type CreateSolicitudCotizacionInput = z.infer<typeof createSolicitudCotizacionSchema>
export type UpdateSolicitudCotizacionInput = z.infer<typeof updateSolicitudCotizacionSchema>
