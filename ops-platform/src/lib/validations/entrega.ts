import { z } from 'zod'

/**
 * Schema para crear/actualizar Entrega (origen/receptor como texto; sin tabla empresa).
 */
export const entregaSchema = z.object({
  eventoId: z.string().uuid('ID de evento inválido'),
  origenRazonSocial: z.string().min(1, 'Razón social de origen requerida').max(255),
  origenRut: z.string().min(1, 'RUT de origen requerido').max(12),
  receptorRazonSocial: z.string().max(255).optional().nullable(),
  receptorRut: z.string().max(12).optional().nullable(),
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
