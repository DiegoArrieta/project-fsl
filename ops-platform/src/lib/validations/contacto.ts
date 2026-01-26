import { z } from 'zod'
import { validateRut, normalizeRut } from './rut'

/**
 * Schema base para datos de contacto (compartido entre Proveedor y Cliente)
 */
const contactoBaseSchema = z.object({
  rut: z
    .string()
    .min(1, 'El RUT es requerido')
    .refine(
      (rut) => {
        const normalized = normalizeRut(rut)
        return validateRut(normalized)
      },
      {
        message: 'RUT inválido. Verifique el formato y el dígito verificador',
      }
    )
    .transform((rut) => normalizeRut(rut)), // Normalizar al almacenar
  razonSocial: z.string().min(1, 'La razón social es requerida').max(255),
  nombreFantasia: z.string().max(255).optional().nullable(),
  direccion: z.string().max(500).optional().nullable(),
  comuna: z.string().max(100).optional().nullable(),
  ciudad: z.string().max(100).optional().nullable(),
  telefono: z.string().max(20).optional().nullable(),
  email: z
    .string()
    .email('Email inválido')
    .max(255)
    .optional()
    .nullable()
    .or(z.literal('')),
})

/**
 * Schema para crear/actualizar Proveedor
 */
export const proveedorSchema = contactoBaseSchema.extend({
  activo: z.boolean().default(true),
})

/**
 * Schema para crear/actualizar Cliente
 */
export const clienteSchema = contactoBaseSchema.extend({
  activo: z.boolean().default(true),
})

export type ProveedorInput = z.infer<typeof proveedorSchema>
export type ClienteInput = z.infer<typeof clienteSchema>

