import type { OrdenCompraLinea } from '@prisma/client'

export interface FuenteCompraOperacionLinea {
  ordenCompraId: string
  ordenCompraNumero: string
  proveedorRazonSocial: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface DesgloseCompraOperacionLinea {
  operacionLineaId: string
  tipoPalletId: string
  cantidadVenta: number
  cantidadCompradaRecibida: number
  hayDesvioCantidad: boolean
  fuentes: FuenteCompraOperacionLinea[]
}

type OrdenRecibidaInput = {
  id: string
  numero: string
  proveedor: { razonSocial: string }
  lineas: OrdenCompraLinea[]
}

/**
 * Fuentes de compra por línea de operación (misma regla que sync de costos).
 */
export function buildDesgloseCompraOperacionLineas(params: {
  lineasOperacion: Array<{
    id: string
    tipoPalletId: string
    presupuestoLineaId: string | null
    cantidad: number
  }>
  ordenesRecibidas: OrdenRecibidaInput[]
}): DesgloseCompraOperacionLinea[] {
  const { lineasOperacion, ordenesRecibidas } = params

  return lineasOperacion.map((linea) => {
    const porPl: FuenteCompraOperacionLinea[] = []
    const porTipo: FuenteCompraOperacionLinea[] = []

    for (const oc of ordenesRecibidas) {
      for (const ln of oc.lineas) {
        if (ln.tipoPalletId !== linea.tipoPalletId) continue
        const qty = ln.cantidad
        const pu = Number(ln.precioUnitario ?? 0)
        const row: FuenteCompraOperacionLinea = {
          ordenCompraId: oc.id,
          ordenCompraNumero: oc.numero,
          proveedorRazonSocial: oc.proveedor.razonSocial,
          cantidad: qty,
          precioUnitario: pu,
          subtotal: qty * pu,
        }
        porTipo.push(row)
        if (linea.presupuestoLineaId && ln.presupuestoLineaId === linea.presupuestoLineaId) {
          porPl.push(row)
        }
      }
    }

    const fuentes = linea.presupuestoLineaId && porPl.length > 0 ? porPl : porTipo
    const cantidadCompradaRecibida = fuentes.reduce((s, f) => s + f.cantidad, 0)
    const hayDesvioCantidad = cantidadCompradaRecibida !== linea.cantidad

    return {
      operacionLineaId: linea.id,
      tipoPalletId: linea.tipoPalletId,
      cantidadVenta: linea.cantidad,
      cantidadCompradaRecibida,
      hayDesvioCantidad,
      fuentes,
    }
  })
}
