import { Prisma } from '@prisma/client'

/**
 * Vista de tipo pallet alineada con el catálogo de OC / selector (misma forma que `TipoPalletAtributosLineaInput` + identidad).
 */
export interface PresupuestoLineaTipoPalletVista {
  id: string
  codigo: string
  nombre: string
  categoria: { nombre: string }
  dimensiones: string | null
  requiereCertificacion: boolean
  paises: Array<{ pais: { nombre: string; codigoIso: string } }>
}

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
    public createdAt: Date,
    public tipoPalletVista: PresupuestoLineaTipoPalletVista | null = null
  ) {}

  /**
   * Calcula el total de la línea
   */
  calcularTotal(): Prisma.Decimal {
    return this.precioUnitario.mul(this.cantidad)
  }
}

