import { z } from 'zod'

export const createEmpresaFactoringSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(255),
  rut: z.string().max(12).optional().nullable(),
  contacto: z.string().max(255).optional().nullable(),
  telefono: z.string().max(20).optional().nullable(),
  email: z.string().max(255).optional().nullable(),
  notas: z.string().optional().nullable(),
  activo: z.boolean().optional(),
})

export const updateEmpresaFactoringSchema = createEmpresaFactoringSchema.partial()

export type CreateEmpresaFactoringInput = z.infer<typeof createEmpresaFactoringSchema>
export type UpdateEmpresaFactoringInput = z.infer<typeof updateEmpresaFactoringSchema>
