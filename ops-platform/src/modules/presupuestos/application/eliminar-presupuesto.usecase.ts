import { prisma } from '@/lib/db'
import { PresupuestoRepository } from '../infrastructure/presupuesto.repository'

/**
 * Elimina un presupuesto si no está aceptado ni tiene vínculos bloqueantes.
 */
export class EliminarPresupuestoUseCase {
  constructor(private repository: PresupuestoRepository) {}

  async execute(id: string): Promise<void> {
    const presupuesto = await this.repository.findById(id)

    if (!presupuesto) {
      throw new Error('Presupuesto no encontrado')
    }

    if (!presupuesto.puedeSerEliminado()) {
      throw new Error(
        'No se puede eliminar un presupuesto aceptado: existe una operación vinculada. Elimine primero la operación si corresponde.'
      )
    }

    const operacionVinculada = await prisma.operacion.findFirst({
      where: { presupuestoId: id },
      select: { id: true, numero: true },
    })

    if (operacionVinculada) {
      throw new Error(
        `No se puede eliminar: el presupuesto está vinculado a la operación ${operacionVinculada.numero}.`
      )
    }

    const ordenesCount = await prisma.ordenCompra.count({
      where: { presupuestoId: id },
    })

    if (ordenesCount > 0) {
      throw new Error(
        'No se puede eliminar: hay órdenes de compra vinculadas. Elimínelas o desvincúlelas primero.'
      )
    }

    await this.repository.delete(id)
  }
}
