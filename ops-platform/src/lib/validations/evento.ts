import { z } from 'zod'

/**
 * Schema para crear/actualizar Evento
 */
export const eventoSchema = z
  .object({
    numero: z.string().min(1, 'El número es requerido').max(50),
    tipo: z.enum(['ENTREGA', 'RECEPCION', 'TRASLADO', 'OTRO'], {
      errorMap: () => ({ message: 'Tipo de evento inválido' }),
    }),
    fechaInicio: z.coerce.date({
      required_error: 'La fecha de inicio es requerida',
      invalid_type_error: 'Fecha de inicio inválida',
    }),
    fechaFin: z.coerce
      .date({
        invalid_type_error: 'Fecha de fin inválida',
      })
      .optional()
      .nullable(),
    ubicacion: z.string().max(500).optional().nullable(),
    descripcion: z.string().optional().nullable(),
    estado: z.enum(['PLANIFICADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO'], {
      errorMap: () => ({ message: 'Estado inválido' }),
    }),
    operacionId: z.string().uuid('ID de operación inválido').optional().nullable(),
  })
  .refine(
    (data) => {
      // Si hay fechaFin, debe ser >= fechaInicio
      if (data.fechaFin && data.fechaInicio) {
        return data.fechaFin >= data.fechaInicio
      }
      return true
    },
    {
      message: 'La fecha de fin debe ser mayor o igual a la fecha de inicio',
      path: ['fechaFin'],
    }
  )

/**
 * Schema para actualizar estado de evento
 */
export const eventoEstadoSchema = z.object({
  estado: z.enum(['PLANIFICADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO'], {
    errorMap: () => ({ message: 'Estado inválido' }),
  }),
})

export type EventoInput = z.infer<typeof eventoSchema>
export type EventoEstadoInput = z.infer<typeof eventoEstadoSchema>

