/**
 * Schemas de validación para Pagos
 */

import { z } from 'zod'

// Schema para crear pago
export const createPagoSchema = z.object({
  operacionId: z.string().uuid({ message: 'ID de operación es requerido' }),
  tipo: z.enum(['PAGO_PROVEEDOR', 'COBRO_CLIENTE', 'PAGO_FLETE', 'PAGO_COMISION']),
  monto: z.number().positive({ message: 'El monto debe ser mayor a 0' }),
  fechaPago: z.string().or(z.date()),
  metodoPago: z
    .string()
    .min(1, 'Método de pago es requerido')
    .max(50, 'Método de pago muy largo')
    .optional(),
  referencia: z.string().max(100).optional(),
  banco: z.string().max(100).optional(),
  observaciones: z.string().optional(),
})

// Schema para actualizar pago
export const updatePagoSchema = z.object({
  tipo: z.enum(['PAGO_PROVEEDOR', 'COBRO_CLIENTE', 'PAGO_FLETE', 'PAGO_COMISION']).optional(),
  monto: z.number().positive({ message: 'El monto debe ser mayor a 0' }).optional(),
  fechaPago: z.string().or(z.date()).optional(),
  metodoPago: z.string().min(1).max(50).optional(),
  referencia: z.string().max(100).optional(),
  banco: z.string().max(100).optional(),
  observaciones: z.string().optional(),
})

// Tipos inferidos
export type CreatePago = z.infer<typeof createPagoSchema>
export type UpdatePago = z.infer<typeof updatePagoSchema>

