import { z } from 'zod'

/**
 * Schema para crear/actualizar Entrega
 */
export const entregaSchema = z.object({
  eventoId: z.string().uuid('ID de evento inválido'),
  empresaId: z.string().uuid('ID de empresa inválido'),
  empresaReceptoraId: z.string().uuid('ID de empresa receptora inválido').optional().nullable(),
  fechaHora: z.coerce.date({
    required_error: 'La fecha y hora son requeridas',
    invalid_type_error: 'Fecha y hora inválidas',
  }),
  tipoEntrega: z.enum(['COMPLETA', 'PARCIAL', 'DEVOLUCION', 'OTRO'], {
    errorMap: () => ({ message: 'Tipo de entrega inválido' }),
  }),
  descripcion: z.string().optional().nullable(),
  cantidad: z.coerce
    .number({
      required_error: 'La cantidad es requerida',
      invalid_type_error: 'Cantidad inválida',
    })
    .positive('La cantidad debe ser mayor a 0'),
  unidad: z.string().min(1, 'La unidad es requerida').max(50),
  estado: z.enum(['PENDIENTE', 'EN_TRANSITO', 'COMPLETADA', 'RECHAZADA'], {
    errorMap: () => ({ message: 'Estado inválido' }),
  }),
  observaciones: z.string().optional().nullable(),
})

/**
 * Schema para actualizar estado de entrega
 */
export const entregaEstadoSchema = z.object({
  estado: z.enum(['PENDIENTE', 'EN_TRANSITO', 'COMPLETADA', 'RECHAZADA'], {
    errorMap: () => ({ message: 'Estado inválido' }),
  }),
})

export type EntregaInput = z.infer<typeof entregaSchema>
export type EntregaEstadoInput = z.infer<typeof entregaEstadoSchema>

