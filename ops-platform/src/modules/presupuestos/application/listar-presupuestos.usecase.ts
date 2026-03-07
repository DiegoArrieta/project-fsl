import { PresupuestoRepository } from '../infrastructure/presupuesto.repository'
import { PresupuestoEntity } from '../domain/presupuesto.entity'
import { EstadoPresupuesto } from '@prisma/client'

/**
 * Use Case: Listar Presupuestos
 * Maneja la lógica de filtrado y paginación
 */
export class ListarPresupuestosUseCase {
  constructor(private repository: PresupuestoRepository) {}

  async execute(params: {
    page?: number
    pageSize?: number
    clienteId?: string
    estado?: EstadoPresupuesto
    buscar?: string
  }): Promise<{
    data: PresupuestoEntity[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }> {
    const page = params.page || 1
    const pageSize = params.pageSize || 20

    const result = await this.repository.findMany({
      page,
      pageSize,
      clienteId: params.clienteId,
      estado: params.estado,
      buscar: params.buscar,
    })

    return {
      ...result,
      page,
      pageSize,
      totalPages: Math.ceil(result.total / pageSize),
    }
  }
}

