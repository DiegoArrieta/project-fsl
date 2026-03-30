import { z } from 'zod'

const codigoIso2 = z
  .string()
  .trim()
  .length(2, 'El código ISO debe tener 2 letras')
  .regex(/^[A-Za-z]{2}$/, 'Solo letras A–Z (ISO 3166-1 alpha-2)')
  .transform((s) => s.toUpperCase())

export const createPaisSchema = z.object({
  codigoIso: codigoIso2,
  nombre: z.string().trim().min(1, 'Nombre requerido').max(100),
  activo: z.boolean().optional(),
})

export const updatePaisSchema = z
  .object({
    codigoIso: codigoIso2.optional(),
    nombre: z.string().trim().min(1).max(100).optional(),
    activo: z.boolean().optional(),
  })
  .strict()
