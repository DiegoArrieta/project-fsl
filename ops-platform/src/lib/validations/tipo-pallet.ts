import { z } from 'zod'

const uuid = z.string().uuid('ID inválido')

export const createTipoPalletSchema = z.object({
  categoriaId: uuid,
  codigo: z
    .string()
    .trim()
    .min(1, 'Código requerido')
    .max(10, 'Máximo 10 caracteres')
    .transform((s) => s.toUpperCase()),
  nombre: z.string().trim().min(1, 'Nombre requerido').max(100),
  descripcion: z.string().trim().max(2000).nullable().optional(),
  dimensiones: z.string().trim().max(200).nullable().optional(),
  requiereCertificacion: z.boolean().optional(),
  activo: z.boolean().optional(),
  paisIds: z.array(uuid).min(1, 'Seleccione al menos un país de destino'),
})

export const updateTipoPalletSchema = z
  .object({
    categoriaId: uuid.optional(),
    codigo: z
      .string()
      .trim()
      .min(1)
      .max(10)
      .transform((s) => s.toUpperCase())
      .optional(),
    nombre: z.string().trim().min(1).max(100).optional(),
    descripcion: z.string().trim().max(2000).nullable().optional(),
    dimensiones: z.string().trim().max(200).nullable().optional(),
    requiereCertificacion: z.boolean().optional(),
    activo: z.boolean().optional(),
    paisIds: z.array(uuid).min(1).optional(),
  })
  .strict()
