import { PresupuestoRepository } from '../infrastructure/presupuesto.repository'
import { PresupuestoEntity } from '../domain/presupuesto.entity'

/**
 * Use Case: Obtener Presupuesto por ID
 */
export class ObtenerPresupuestoUseCase {
  constructor(private repository: PresupuestoRepository) {}

  async execute(id: string): Promise<PresupuestoEntity> {
    const presupuesto = await this.repository.findById(id)

    if (!presupuesto) {
      throw new Error('Presupuesto no encontrado')
    }

    return presupuesto
  }
}

