import { z } from 'zod'
import { validateRut, normalizeRut } from './rut'

/**
 * Schema para crear/actualizar Empresa
 */
export const empresaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(255),
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
  tipoEmpresa: z.enum(['PROVEEDOR', 'CLIENTE', 'TRANSPORTISTA', 'OTRO'], {
    errorMap: () => ({ message: 'Tipo de empresa inválido' }),
  }),
  contacto: z.string().max(255).optional().nullable(),
  direccion: z.string().max(500).optional().nullable(),
  telefono: z.string().max(20).optional().nullable(),
  email: z
    .string()
    .email('Email inválido')
    .max(255)
    .optional()
    .nullable()
    .or(z.literal('')),
  estado: z.enum(['ACTIVA', 'INACTIVA'], {
    errorMap: () => ({ message: 'Estado inválido' }),
  }),
})

/**
 * Schema para actualizar estado de empresa
 */
export const empresaEstadoSchema = z.object({
  estado: z.enum(['ACTIVA', 'INACTIVA'], {
    errorMap: () => ({ message: 'Estado inválido' }),
  }),
})

export type EmpresaInput = z.infer<typeof empresaSchema>
export type EmpresaEstadoInput = z.infer<typeof empresaEstadoSchema>

