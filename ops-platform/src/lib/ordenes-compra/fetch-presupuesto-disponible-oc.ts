export interface DisponiblePresupuestoLinea {
  presupuestoLineaId: string
  tipoPalletId: string
  cantidadPresupuesto: number
  precioUnitarioPresupuesto: number
  descripcion: string | null
  cantidadComprometida: number
  cantidadDisponible: number
}

export interface DisponiblePresupuestoResponse {
  presupuesto: {
    id: string
    numero: string
    estado: string
    clienteId: string
    cliente: { id: string; razonSocial: string }
  }
  lineas: DisponiblePresupuestoLinea[]
}

export async function fetchDisponiblePresupuestoOrdenCompra(
  presupuestoId: string,
  opts?: { excludeOrdenCompraId?: string }
): Promise<DisponiblePresupuestoResponse> {
  const sp = new URLSearchParams()
  if (opts?.excludeOrdenCompraId) sp.set('excludeOrdenCompraId', opts.excludeOrdenCompraId)
  const q = sp.toString()
  const url = `/api/presupuestos/${presupuestoId}/disponible-orden-compra${q ? `?${q}` : ''}`
  const response = await fetch(url, { credentials: 'include' })
  const json = await response.json().catch(() => ({}))
  if (!response.ok) {
    const msg =
      typeof json.error === 'string' ? json.error : `Error al cargar disponibilidad (${response.status})`
    throw new Error(msg)
  }
  return json.data as DisponiblePresupuestoResponse
}

export interface LineaFormConPresupuesto {
  tipoPalletId: string
  cantidad: number
  precioUnitario: number
  presupuestoLineaId?: string | null
}

export function computeAgotaPresupuestoConEstaOrden(
  lineasMeta: DisponiblePresupuestoLinea[],
  productos: LineaFormConPresupuesto[]
): boolean {
  const porLinea = new Map<string, number>()
  for (const p of productos) {
    if (!p.presupuestoLineaId) continue
    porLinea.set(p.presupuestoLineaId, (porLinea.get(p.presupuestoLineaId) ?? 0) + (p.cantidad || 0))
  }
  for (const l of lineasMeta) {
    const add = porLinea.get(l.presupuestoLineaId) ?? 0
    if (l.cantidadComprometida + add !== l.cantidadPresupuesto) return false
  }
  return lineasMeta.length > 0
}
