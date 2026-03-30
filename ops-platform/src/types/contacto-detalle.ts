/**
 * Respuesta enriquecida de GET /api/proveedores/[id] y GET /api/clientes/[id]
 */

export interface UltimaOperacionContacto {
  id: string
  numero: string
  fecha: string | Date
  tipo: string
  estadoDocumental: string
  estadoFinanciero: string
}

export interface ContactoEstadisticas {
  totalOperaciones: number
  operacionesAbiertas: number
  ultimaOperacion: string | null
}

export interface ContactoDetalleApi {
  id: string
  rut: string
  razonSocial: string
  nombreFantasia?: string | null
  direccion?: string | null
  comuna?: string | null
  ciudad?: string | null
  telefono?: string | null
  email?: string | null
  activo: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
  estadisticas?: ContactoEstadisticas
  ultimasOperaciones?: UltimaOperacionContacto[]
}

export interface ContactoDetalleResult {
  tipo: 'proveedor' | 'cliente'
  data: ContactoDetalleApi
}
