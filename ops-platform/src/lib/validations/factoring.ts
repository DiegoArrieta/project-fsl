/**
 * Schemas de validación para registro de factoring en operaciones de venta
 */

import { z } from 'zod'

export const createFactoringSchema = z.object({
  empresaFactoringId: z.string().uuid({ message: 'Debe seleccionar una empresa de factoring' }),
  fechaFactoring: z.union([z.string(), z.date()]),
  montoFactura: z.number().positive({ message: 'Monto factura debe ser mayor a 0' }),
  montoAdelantado: z.number().positive({ message: 'Monto adelantado debe ser mayor a 0' }),
  comisionFactoring: z.number().nonnegative().optional().nullable(),
  fechaVencimiento: z.union([z.string(), z.date()]).optional().nullable(),
  observaciones: z.string().optional().nullable(),
})

export const updateFactoringSchema = createFactoringSchema.partial()

/** Body para POST /api/factoring (id de operación en el JSON, evita rutas anidadas que en algunos despliegues devuelven 404). */
export const createFactoringConOperacionSchema = createFactoringSchema.extend({
  operacionId: z.string().uuid(),
})

export const updateFactoringConOperacionSchema = updateFactoringSchema.extend({
  operacionId: z.string().uuid(),
})

export type CreateFactoringInput = z.infer<typeof createFactoringSchema>
export type UpdateFactoringInput = z.infer<typeof updateFactoringSchema>
