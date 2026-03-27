/**
 * Helpers para adaptar respuestas de API de operaciones a la UI
 */

import type { OperacionLineaApi } from '@/types/operacion-api'

export function isDocumentoPresente(doc: {
  archivoUrl?: string | null
  presente?: boolean
}): boolean {
  if (typeof doc.presente === 'boolean') return doc.presente
  return Boolean(doc.archivoUrl)
}

export function calcularTotalesDesdeLineas(
  tipo: string,
  lineas: OperacionLineaApi[]
): {
  totalVenta: number
  totalCompra: number
  margenBruto: number
  margenPorcentual: number
  montoListado: number
} {
  let totalVenta = 0
  let totalCompra = 0
  let montoListado = 0

  for (const l of lineas) {
    const pu = Number(l.precioUnitario ?? 0)
    const pv = Number(l.precioVentaUnitario ?? 0)
    const pc = Number(l.precioCompraUnitario ?? 0)
    totalVenta += pv * l.cantidad
    totalCompra += pc * l.cantidad
    if (tipo === 'COMPRA') montoListado += pu * l.cantidad
    else montoListado += (pv || pu) * l.cantidad
  }

  const margenBruto = totalVenta - totalCompra
  const margenPorcentual = totalVenta > 0 ? (margenBruto / totalVenta) * 100 : 0

  return { totalVenta, totalCompra, margenBruto, margenPorcentual, montoListado }
}
