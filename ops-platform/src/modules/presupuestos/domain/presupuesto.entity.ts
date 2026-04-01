import { Prisma, EstadoPresupuesto } from '@prisma/client'
import { PresupuestoLineaEntity } from './presupuesto-linea.entity'

/**
 * Entidad de dominio: Presupuesto
 * Contiene la lógica de negocio para cálculos de totales
 */
export class PresupuestoEntity {
  constructor(
    public id: string,
    public numero: string,
    public clienteId: string,
    public fecha: Date,
    public ciudad: string | null,
    public direccion: string | null,
    public observaciones: string | null,
    public subtotal: Prisma.Decimal,
    public iva: Prisma.Decimal,
    public total: Prisma.Decimal,
    public estado: EstadoPresupuesto,
    public lineas: PresupuestoLineaEntity[],
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * Calcula los totales basándose en las líneas
   * subtotal = sum(lineas.precioUnitario * cantidad)
   * iva = subtotal * 0.19
   * total = subtotal + iva
   */
  static calcularTotales(lineas: PresupuestoLineaEntity[]): {
    subtotal: Prisma.Decimal
    iva: Prisma.Decimal
    total: Prisma.Decimal
  } {
    const subtotal = lineas.reduce((acc, linea) => {
      const lineaTotal = linea.precioUnitario.toNumber() * linea.cantidad
      return acc + lineaTotal
    }, 0)

    const subtotalDecimal = new Prisma.Decimal(subtotal)
    const iva = subtotalDecimal.mul(0.19)
    const total = subtotalDecimal.add(iva)

    return {
      subtotal: subtotalDecimal,
      iva,
      total,
    }
  }

  /**
   * Valida que el presupuesto pueda ser aceptado
   */
  puedeSerAceptado(): boolean {
    return this.estado === 'BORRADOR' || this.estado === 'ENVIADO'
  }

  /**
   * Valida que el presupuesto pueda ser editado
   */
  puedeSerEditado(): boolean {
    return this.estado === 'BORRADOR'
  }

  /**
   * Presupuestos aceptados quedan ligados a una operación y no deben eliminarse por este flujo.
   */
  puedeSerEliminado(): boolean {
    return this.estado !== 'ACEPTADO'
  }
}

