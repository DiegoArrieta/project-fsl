import { prisma } from '@/lib/db'

interface CostBucket {
  totalQty: number
  totalCost: number
}

function addLine(bucket: CostBucket, cantidad: number, precioUnitario: number) {
  bucket.totalQty += cantidad
  bucket.totalCost += cantidad * precioUnitario
}

/**
 * Recalcula precioCompraUnitario (promedio ponderado) en cada línea de operación
 * a partir de todas las órdenes de compra RECIBIDA vinculadas a la misma operación.
 *
 * - Líneas con presupuestoLineaId: primero agrupan compras por esa línea de presupuesto;
 *   si no hay compras, se usa el promedio global del tipo de pallet en la operación.
 * - Líneas sin presupuestoLineaId: promedio global por tipoPalletId (todas las OC RECIBIDA).
 */
export async function syncCostosOperacionDesdeOrdenesRecibidas(operacionId: string): Promise<void> {
  const operacion = await prisma.operacion.findUnique({
    where: { id: operacionId },
    include: { lineas: true },
  })
  if (!operacion?.lineas.length) return

  const ordenes = await prisma.ordenCompra.findMany({
    where: { operacionId, estado: 'RECIBIDA' },
    include: { lineas: true },
  })

  const byPresupuestoLineaId = new Map<string, CostBucket>()
  const globalByTipoPalletId = new Map<string, CostBucket>()

  for (const oc of ordenes) {
    for (const ln of oc.lineas) {
      const qty = ln.cantidad
      const pu = Number(ln.precioUnitario ?? 0)
      const tipo = ln.tipoPalletId

      const g = globalByTipoPalletId.get(tipo) ?? { totalQty: 0, totalCost: 0 }
      addLine(g, qty, pu)
      globalByTipoPalletId.set(tipo, g)

      if (ln.presupuestoLineaId) {
        const b = byPresupuestoLineaId.get(ln.presupuestoLineaId) ?? { totalQty: 0, totalCost: 0 }
        addLine(b, qty, pu)
        byPresupuestoLineaId.set(ln.presupuestoLineaId, b)
      }
    }
  }

  for (const linea of operacion.lineas) {
    let cup: number | null = null

    if (linea.presupuestoLineaId) {
      const plBucket = byPresupuestoLineaId.get(linea.presupuestoLineaId)
      if (plBucket && plBucket.totalQty > 0) {
        cup = plBucket.totalCost / plBucket.totalQty
      } else {
        const tipoBucket = globalByTipoPalletId.get(linea.tipoPalletId)
        if (tipoBucket && tipoBucket.totalQty > 0) {
          cup = tipoBucket.totalCost / tipoBucket.totalQty
        }
      }
    } else {
      const tipoBucket = globalByTipoPalletId.get(linea.tipoPalletId)
      if (tipoBucket && tipoBucket.totalQty > 0) {
        cup = tipoBucket.totalCost / tipoBucket.totalQty
      }
    }

    await prisma.operacionLinea.update({
      where: { id: linea.id },
      data: {
        precioCompraUnitario: cup !== null ? cup : null,
      },
    })
  }
}
