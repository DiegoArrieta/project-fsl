import { PresupuestoRepository } from '../infrastructure/presupuesto.repository'
import { SequenceService } from '../../sequences/sequence.service'
import { PresupuestoEntity } from '../domain/presupuesto.entity'
import { PresupuestoLineaEntity } from '../domain/presupuesto-linea.entity'
import { CreatePresupuestoDto } from '../dto/create-presupuesto.dto'
import { Prisma } from '@prisma/client'

/**
 * Use Case: Crear Presupuesto
 * Orquesta la validación, generación de número y persistencia
 */
export class CreatePresupuestoUseCase {
  constructor(private repository: PresupuestoRepository) {}

  async execute(dto: CreatePresupuestoDto): Promise<PresupuestoEntity> {
    // Generar número secuencial usando SequenceService
    const numero = await SequenceService.getNextSequence('PRESUPUESTO')

    // Crear entidades de línea para calcular totales
    const lineasEntities = dto.lineas.map(
      (linea) =>
        new PresupuestoLineaEntity(
          '', // id temporal
          '', // presupuestoId temporal
          linea.tipoPalletId,
          linea.cantidad,
          new Prisma.Decimal(linea.precioUnitario),
          linea.descripcion || null,
          new Date()
        )
    )

    // Calcular totales usando la entidad de dominio
    const totales = PresupuestoEntity.calcularTotales(lineasEntities)

    // Crear presupuesto
    const presupuesto = await this.repository.create({
      numero,
      clienteId: dto.clienteId,
      fecha: dto.fecha,
      ciudad: dto.ciudad || null,
      direccion: dto.direccion || null,
      observaciones: dto.observaciones || null,
      subtotal: totales.subtotal.toNumber(),
      iva: totales.iva.toNumber(),
      total: totales.total.toNumber(),
      estado: 'BORRADOR',
      lineas: dto.lineas,
    })

    return presupuesto
  }
}
