import { z } from 'zod'

export const personaContactoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(255),
  cargo: z.string().max(150).optional().nullable(),
  email: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .refine(
      (v) => v == null || v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      { message: 'Email inválido' }
    ),
  telefono: z.string().max(30).optional().nullable(),
  esPrincipal: z.boolean().optional().default(false),
  notas: z.string().max(2000).optional().nullable(),
})

export type PersonaContactoInput = z.infer<typeof personaContactoSchema>
