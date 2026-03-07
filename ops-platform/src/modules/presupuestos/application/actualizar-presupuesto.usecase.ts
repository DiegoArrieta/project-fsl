import { PresupuestoRepository } from '../infrastructure/presupuesto.repository'
import { PresupuestoEntity } from '../domain/presupuesto.entity'
import { PresupuestoLineaEntity } from '../domain/presupuesto-linea.entity'
import { UpdatePresupuestoDto } from '../dto/create-presupuesto.dto'
import { Prisma } from '@prisma/client'

/**
 * Use Case: Actualizar Presupuesto
 * Valida que el presupuesto pueda ser editado y recalcula totales si hay cambios en líneas
 */
export class ActualizarPresupuestoUseCase {
  constructor(private repository: PresupuestoRepository) {}

  async execute(id: string, dto: UpdatePresupuestoDto): Promise<PresupuestoEntity> {
    // Obtener presupuesto actual
    const presupuestoActual = await this.repository.findById(id)

    if (!presupuestoActual) {
      throw new Error('Presupuesto no encontrado')
    }

    // Validar que puede ser editado
    if (!presupuestoActual.puedeSerEditado()) {
      throw new Error(`El presupuesto no puede ser editado. Estado actual: ${presupuestoActual.estado}`)
    }

    // Si hay cambios en líneas, recalcular totales
    let subtotal = presupuestoActual.subtotal.toNumber()
    let iva = presupuestoActual.iva.toNumber()
    let total = presupuestoActual.total.toNumber()

    if (dto.lineas && dto.lineas.length > 0) {
      const lineasEntities = dto.lineas.map(
        (linea) =>
          new PresupuestoLineaEntity(
            linea.id || '',
            id,
            linea.tipoPalletId,
            linea.cantidad,
            new Prisma.Decimal(linea.precioUnitario),
            linea.descripcion || null,
            new Date()
          )
      )

      const totales = PresupuestoEntity.calcularTotales(lineasEntities)
      subtotal = totales.subtotal.toNumber()
      iva = totales.iva.toNumber()
      total = totales.total.toNumber()
    }

    // Actualizar presupuesto
    const presupuesto = await this.repository.update(id, {
      fecha: dto.fecha,
      ciudad: dto.ciudad,
      direccion: dto.direccion,
      observaciones: dto.observaciones,
      subtotal,
      iva,
      total,
      estado: dto.estado,
      lineas: dto.lineas,
    })

    return presupuesto
  }
}

