import { PresupuestoRepository } from '../infrastructure/presupuesto.repository'
import { prisma } from '@/lib/db'
import { SequenceService } from '../../sequences/sequence.service'
import { PresupuestoEntity } from '../domain/presupuesto.entity'
import { PresupuestoLineaEntity } from '../domain/presupuesto-linea.entity'
import { TipoOperacion, Prisma } from '@prisma/client'

/**
 * Use Case: Aceptar Presupuesto
 * Cambia el estado del presupuesto y crea una operación asociada
 */
export class AceptarPresupuestoUseCase {
  constructor(private repository: PresupuestoRepository) {}

  async execute(presupuestoId: string): Promise<{
    presupuesto: PresupuestoEntity
    operacionId: string
  }> {
    // Obtener presupuesto
    const presupuesto = await this.repository.findById(presupuestoId)

    if (!presupuesto) {
      throw new Error('Presupuesto no encontrado')
    }

    // Validar que puede ser aceptado
    if (!presupuesto.puedeSerAceptado()) {
      throw new Error(`El presupuesto no puede ser aceptado. Estado actual: ${presupuesto.estado}`)
    }

    // Usar transacción para garantizar atomicidad
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar estado del presupuesto
      const presupuestoActualizado = await tx.presupuesto.update({
        where: { id: presupuestoId },
        data: { estado: 'ACEPTADO' },
        include: {
          lineas: {
            include: {
              tipoPallet: true,
            },
          },
        },
      })

      // Generar número de operación usando el mismo cliente de transacción
      const numeroOperacion = await SequenceService.getNextSequence('OPERACION', tx)

      // Crear operación
      const operacion = await tx.operacion.create({
        data: {
          numero: numeroOperacion,
          tipo: 'VENTA_DIRECTA',
          fecha: presupuesto.fecha,
          clienteId: presupuesto.clienteId,
          presupuestoId: presupuestoId,
          direccionEntrega: presupuesto.direccion || null,
          observaciones: presupuesto.observaciones || null,
          estadoDocumental: 'INCOMPLETA',
          estadoFinanciero: 'PENDIENTE',
          lineas: {
            create: presupuesto.lineas.map((linea) => ({
              tipoPalletId: linea.tipoPalletId,
              cantidad: linea.cantidad,
              precioVentaUnitario: linea.precioUnitario,
              descripcionProducto: linea.descripcion || null,
              cantidadEntregada: 0,
              cantidadDanada: 0,
            })),
          },
        },
      })

      return {
        presupuesto: presupuestoActualizado,
        operacionId: operacion.id,
      }
    })

    // Mapear presupuesto actualizado a entidad
    const presupuestoEntity = new PresupuestoEntity(
      result.presupuesto.id,
      result.presupuesto.numero,
      result.presupuesto.clienteId,
      result.presupuesto.fecha,
      result.presupuesto.ciudad,
      result.presupuesto.direccion,
      result.presupuesto.observaciones,
      result.presupuesto.subtotal as unknown as Prisma.Decimal,
      result.presupuesto.iva as unknown as Prisma.Decimal,
      result.presupuesto.total as unknown as Prisma.Decimal,
      result.presupuesto.estado,
      result.presupuesto.lineas.map(
        (linea: any) =>
          new PresupuestoLineaEntity(
            linea.id,
            linea.presupuestoId,
            linea.tipoPalletId,
            linea.cantidad,
            linea.precioUnitario as unknown as Prisma.Decimal,
            linea.descripcion,
            linea.createdAt
          )
      ),
      result.presupuesto.createdAt,
      result.presupuesto.updatedAt
    )

    return {
      presupuesto: presupuestoEntity,
      operacionId: result.operacionId,
    }
  }
}

