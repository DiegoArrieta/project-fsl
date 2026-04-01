import { prisma } from '@/lib/db'

export class OrdenCompraPresupuestoError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OrdenCompraPresupuestoError'
  }
}

/**
 * Suma cantidades ya pedidas por línea de presupuesto en órdenes no canceladas.
 */
export async function getComprometidoPorPresupuestoLineaId(
  presupuestoId: string,
  excludeOrdenCompraId?: string
): Promise<Map<string, number>> {
  const lineas = await prisma.ordenCompraLinea.findMany({
    where: {
      presupuestoLineaId: { not: null },
      ordenCompra: {
        presupuestoId,
        estado: { not: 'CANCELADA' },
        ...(excludeOrdenCompraId ? { id: { not: excludeOrdenCompraId } } : {}),
      },
    },
    select: { presupuestoLineaId: true, cantidad: true },
  })

  const map = new Map<string, number>()
  for (const l of lineas) {
    if (!l.presupuestoLineaId) continue
    map.set(l.presupuestoLineaId, (map.get(l.presupuestoLineaId) ?? 0) + l.cantidad)
  }
  return map
}

export interface ProductoOrdenCompraInput {
  tipoPalletId: string
  cantidad: number
  precioUnitario?: number | null
  descripcion?: string | null
  presupuestoLineaId?: string | null
}

const PRESUPUESTO_NO_OC = 'Este presupuesto no puede usarse para órdenes de compra (borrador o rechazado).'

function presupuestoErr(message: string): never {
  throw new OrdenCompraPresupuestoError(message)
}

export async function assertProductosContraPresupuesto({
  presupuestoId,
  productos,
  excludeOrdenCompraId,
}: {
  presupuestoId: string
  productos: ProductoOrdenCompraInput[]
  excludeOrdenCompraId?: string
}): Promise<void> {
  const presupuesto = await prisma.presupuesto.findUnique({
    where: { id: presupuestoId },
    include: { lineas: true },
  })

  if (!presupuesto) {
    presupuestoErr('Presupuesto no encontrado')
  }

  if (presupuesto.estado === 'BORRADOR' || presupuesto.estado === 'RECHAZADO') {
    presupuestoErr(PRESUPUESTO_NO_OC)
  }

  const comprometido = await getComprometidoPorPresupuestoLineaId(presupuestoId, excludeOrdenCompraId)

  const porLinea = new Map<string, number>()
  for (const p of productos) {
    if (!p.presupuestoLineaId) continue
    porLinea.set(p.presupuestoLineaId, (porLinea.get(p.presupuestoLineaId) ?? 0) + p.cantidad)
  }

  for (const [presupuestoLineaId, cantidadSolicitada] of porLinea) {
    const pl = presupuesto.lineas.find((l) => l.id === presupuestoLineaId)
    if (!pl) {
      presupuestoErr(`La línea de presupuesto no pertenece a este presupuesto.`)
    }

    const productosConEsaLinea = productos.filter((x) => x.presupuestoLineaId === presupuestoLineaId)
    for (const p of productosConEsaLinea) {
      if (p.tipoPalletId !== pl.tipoPalletId) {
        presupuestoErr('El tipo de pallet no coincide con la línea del presupuesto.')
      }
    }

    const ya = comprometido.get(presupuestoLineaId) ?? 0
    if (ya + cantidadSolicitada > pl.cantidad) {
      const disp = Math.max(0, pl.cantidad - ya)
      presupuestoErr(
        `Cantidad superior a la disponible para una línea del presupuesto (disponible: ${disp}, solicitada en esta orden: ${cantidadSolicitada}).`
      )
    }
  }
}

export function normalizarProductosSinPresupuesto(
  presupuestoId: string | null | undefined,
  productos: ProductoOrdenCompraInput[]
): ProductoOrdenCompraInput[] {
  if (presupuestoId) return productos
  return productos.map((p) => ({ ...p, presupuestoLineaId: null }))
}
