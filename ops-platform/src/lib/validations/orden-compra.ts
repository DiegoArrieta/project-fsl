/**
 * Schemas de validación para Órdenes de Compra
 */

import { z } from 'zod'

// Schema para línea de orden de compra
export const ordenCompraLineaSchema = z.object({
  id: z.string().uuid().optional(),
  tipoPalletId: z.string().uuid({ message: 'Tipo de pallet es requerido' }),
  cantidad: z.number().int().min(1, 'Cantidad debe ser mayor a 0'),
  precioUnitario: z.number().min(0, 'Precio debe ser mayor o igual a 0').optional(),
  descripcion: z.string().optional(),
  presupuestoLineaId: z.string().uuid().optional().nullable(),
})

// Schema para crear orden de compra
export const createOrdenCompraSchema = z
  .object({
    proveedorId: z.string().uuid({ message: 'Proveedor es requerido' }),
    fecha: z.string().or(z.date()),
    fechaEntrega: z.string().or(z.date()).optional(),
    direccionEntrega: z.string().optional(),
    observaciones: z.string().optional(),
    operacionId: z.string().uuid().optional(),
    presupuestoId: z.string().uuid().optional().nullable(),
    productos: z.array(ordenCompraLineaSchema).min(1, 'Debe agregar al menos un producto'),
  })
  .superRefine((data, ctx) => {
    const hayLineaPresupuesto = data.productos.some((p) => p.presupuestoLineaId)
    if (hayLineaPresupuesto && !data.presupuestoId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Debe indicar el presupuesto si alguna línea está ligada a una línea del presupuesto.',
        path: ['presupuestoId'],
      })
    }
  })

// Schema para actualizar orden de compra (solo BORRADOR)
export const updateOrdenCompraSchema = z
  .object({
    proveedorId: z.string().uuid().optional(),
    fecha: z.string().or(z.date()).optional(),
    fechaEntrega: z.string().or(z.date()).optional(),
    direccionEntrega: z.string().optional(),
    observaciones: z.string().optional(),
    operacionId: z.string().uuid().optional(),
    presupuestoId: z.string().uuid().optional().nullable(),
    productos: z.array(ordenCompraLineaSchema).min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.productos) return
    const hayLineaPresupuesto = data.productos.some((p) => p.presupuestoLineaId)
    if (hayLineaPresupuesto && data.presupuestoId === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'Debe enviar presupuestoId si las líneas incluyen presupuestoLineaId.',
        path: ['presupuestoId'],
      })
    }
    if (hayLineaPresupuesto && data.presupuestoId === null) {
      ctx.addIssue({
        code: 'custom',
        message: 'No puede quitar el presupuesto si hay lí ligadas a líneas del presupuesto.',
        path: ['presupuestoId'],
      })
    }
  })

// Schema para cambiar estado
export const updateEstadoOrdenCompraSchema = z.object({
  estado: z.enum(['BORRADOR', 'ENVIADA', 'RECIBIDA', 'CANCELADA']),
})

// Schema para asociar a operación
export const asociarOperacionSchema = z.object({
  operacionId: z.string().uuid({ message: 'ID de operación es requerido' }),
})

// Tipos inferidos
export type OrdenCompraLinea = z.infer<typeof ordenCompraLineaSchema>
export type CreateOrdenCompra = z.infer<typeof createOrdenCompraSchema>
export type UpdateOrdenCompra = z.infer<typeof updateOrdenCompraSchema>





