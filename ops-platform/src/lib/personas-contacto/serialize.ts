import type { ContactoPersona } from '@prisma/client'

export interface PersonaContactoDto {
  id: string
  nombre: string
  cargo: string | null
  email: string | null
  telefono: string | null
  esPrincipal: boolean
  notas: string | null
  createdAt: string
  updatedAt: string
}

export function serializePersonaContacto(p: ContactoPersona): PersonaContactoDto {
  return {
    id: p.id,
    nombre: p.nombre,
    cargo: p.cargo,
    email: p.email,
    telefono: p.telefono,
    esPrincipal: p.esPrincipal,
    notas: p.notas,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }
}
