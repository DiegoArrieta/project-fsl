/**
 * Schemas de validación para Operaciones
 * Incluye validaciones para operaciones unificadas (venta con compra asociada)
 */

import { z } from 'zod'

// Schema para línea de operación
export const operacionLineaSchema = z.object({
  id: z.string().uuid().optional(),
  tipoPalletId: z.string().uuid({ message: 'Tipo de pallet es requerido' }),
  cantidad: z.number().int().min(1, 'Cantidad debe ser mayor a 0'),
  
  // Para operaciones de COMPRA
  precioUnitario: z.number().min(0, 'Precio debe ser mayor o igual a 0').optional(),
  
  // Para operaciones de VENTA (unificadas)
  precioVentaUnitario: z.number().min(0, 'Precio de venta debe ser mayor o igual a 0').optional(),
  precioCompraUnitario: z.number().min(0, 'Precio de compra debe ser mayor o igual a 0').optional(),
  
  // Datos de entrega (se llenan después)
  cantidadEntregada: z.number().int().min(0).default(0),
  cantidadDanada: z.number().int().min(0).default(0),
})

// Schema base para operación
const operacionBaseSchema = z.object({
  tipo: z.enum(['COMPRA', 'VENTA_DIRECTA', 'VENTA_COMISION'] as const),
  fecha: z.string().or(z.date()),
  direccionEntrega: z.string().optional(),
  ordenCompraCliente: z.string().optional(),
  observaciones: z.string().optional(),
  productos: z.array(operacionLineaSchema).min(1, 'Debe agregar al menos un producto'),
})

// Schema para crear operación con validaciones condicionales
export const createOperacionSchema = operacionBaseSchema
  .extend({
    proveedores: z.array(z.string().uuid()).optional(),
    clienteId: z.string().uuid().optional(),
    eventoId: z.string().uuid().optional().nullable(),
  })
  .refine(
    (data) => {
      // COMPRA requiere al menos 1 proveedor
      if (data.tipo === 'COMPRA') {
        return !!data.proveedores && data.proveedores.length > 0
      }
      return true
    },
    {
      message: 'Se requiere al menos un proveedor para operaciones de compra',
      path: ['proveedores'],
    }
  )
  .refine(
    (data) => {
      // VENTA_* requiere cliente Y al menos 1 proveedor (operación unificada)
      if (data.tipo === 'VENTA_DIRECTA' || data.tipo === 'VENTA_COMISION') {
        return !!data.clienteId && !!data.proveedores && data.proveedores.length > 0
      }
      return true
    },
    {
      message: 'Cliente y al menos un proveedor son requeridos para operaciones de venta (operación unificada)',
      path: ['clienteId'],
    }
  )
  .refine(
    (data) => {
      // Para COMPRA, validar que todos los productos tengan precioUnitario
      if (data.tipo === 'COMPRA') {
        return data.productos.every((p) => p.precioUnitario !== undefined && p.precioUnitario >= 0)
      }
      return true
    },
    {
      message: 'Todos los productos deben tener precio unitario en operaciones de compra',
      path: ['productos'],
    }
  )
  .refine(
    (data) => {
      // Para VENTA_*, validar que todos los productos tengan precios de venta Y compra
      if (data.tipo === 'VENTA_DIRECTA' || data.tipo === 'VENTA_COMISION') {
        return data.productos.every(
          (p) =>
            p.precioVentaUnitario !== undefined &&
            p.precioVentaUnitario >= 0 &&
            p.precioCompraUnitario !== undefined &&
            p.precioCompraUnitario >= 0
        )
      }
      return true
    },
    {
      message: 'Todos los productos deben tener precio de venta y precio de compra en operaciones de venta',
      path: ['productos'],
    }
  )
  .refine(
    (data) => {
      // Para VENTA_*, validar que margen no sea negativo (precio venta >= precio compra)
      if (data.tipo === 'VENTA_DIRECTA' || data.tipo === 'VENTA_COMISION') {
        return data.productos.every(
          (p) =>
            p.precioVentaUnitario !== undefined &&
            p.precioCompraUnitario !== undefined &&
            p.precioVentaUnitario >= p.precioCompraUnitario
        )
      }
      return true
    },
    {
      message: 'El precio de venta no puede ser menor al precio de compra (margen negativo)',
      path: ['productos'],
    }
  )

// Schema para actualizar operación
export const updateOperacionSchema = operacionBaseSchema
  .extend({
    proveedores: z.array(z.string().uuid()).optional(),
    clienteId: z.string().uuid().optional(),
    eventoId: z.string().uuid().optional().nullable(),
  })
  .partial()

// Schema para actualizar estado documental
export const updateEstadoDocumentalSchema = z.object({
  estadoDocumental: z.enum(['INCOMPLETA', 'COMPLETA']),
})

// Schema para actualizar estado financiero
export const updateEstadoFinancieroSchema = z.object({
  estadoFinanciero: z.enum(['PENDIENTE', 'FACTURADA', 'PAGADA', 'CERRADA']),
})

// Schema para cerrar operación
export const cerrarOperacionSchema = z.object({
  observacionCierre: z.string().min(10, 'La observación de cierre debe tener al menos 10 caracteres'),
})

// Tipos inferidos
export type OperacionLinea = z.infer<typeof operacionLineaSchema>
export type CreateOperacion = z.infer<typeof createOperacionSchema>
export type UpdateOperacion = z.infer<typeof updateOperacionSchema>

