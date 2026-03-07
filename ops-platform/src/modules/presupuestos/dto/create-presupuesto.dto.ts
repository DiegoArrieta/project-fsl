import { z } from 'zod'

/**
 * DTO para crear un presupuesto
 */
export const createPresupuestoSchema = z.object({
  clienteId: z.string().uuid('ID de cliente inválido'),
  fecha: z.coerce.date({
    required_error: 'La fecha es requerida',
    invalid_type_error: 'Fecha inválida',
  }),
  ciudad: z.string().max(100).optional().nullable(),
  direccion: z.string().max(500).optional().nullable(),
  observaciones: z.string().optional().nullable(),
  lineas: z
    .array(
      z.object({
        tipoPalletId: z.string().uuid('ID de tipo de pallet inválido'),
        cantidad: z.coerce.number().int().positive('La cantidad debe ser mayor a 0'),
        precioUnitario: z.coerce
          .number()
          .positive('El precio unitario debe ser mayor a 0')
          .transform((val) => Math.round(val * 100) / 100), // Redondear a 2 decimales
        descripcion: z.string().max(255).optional().nullable(),
      })
    )
    .min(1, 'Debe haber al menos una línea de producto'),
})

export type CreatePresupuestoDto = z.infer<typeof createPresupuestoSchema>

/**
 * DTO para actualizar un presupuesto
 */
export const updatePresupuestoSchema = createPresupuestoSchema.partial().extend({
  estado: z.enum(['BORRADOR', 'ENVIADO', 'ACEPTADO', 'RECHAZADO']).optional(),
})

export type UpdatePresupuestoDto = z.infer<typeof updatePresupuestoSchema>

