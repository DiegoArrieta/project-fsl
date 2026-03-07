import { Prisma } from '@prisma/client'

/**
 * Entidad de dominio: PresupuestoLinea
 * Representa una línea de producto en un presupuesto
 */
export class PresupuestoLineaEntity {
  constructor(
    public id: string,
    public presupuestoId: string,
    public tipoPalletId: string,
    public cantidad: number,
    public precioUnitario: Prisma.Decimal,
    public descripcion: string | null,
    public createdAt: Date
  ) {}

  /**
   * Calcula el total de la línea
   */
  calcularTotal(): Prisma.Decimal {
    return this.precioUnitario.mul(this.cantidad)
  }
}

