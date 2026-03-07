/**
 * Funciones para calcular estadísticas del dashboard
 */

type DecimalLike = {
  toNumber(): number
}

function toNumber(value: number | DecimalLike | null | undefined): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'object' && 'toNumber' in value) {
    return value.toNumber()
  }
  return 0
}

interface Operacion {
  tipo: 'COMPRA' | 'VENTA_DIRECTA' | 'VENTA_COMISION'
  estadoDocumental: 'INCOMPLETA' | 'COMPLETA'
  estadoFinanciero: 'PENDIENTE' | 'FACTURADA' | 'PAGADA' | 'CERRADA'
  lineas: {
    cantidad: number
    precioUnitario?: number | DecimalLike | null
    precioVentaUnitario?: number | DecimalLike | null
    precioCompraUnitario?: number | DecimalLike | null
  }[]
  pagos: {
    tipo: 'PAGO_PROVEEDOR' | 'COBRO_CLIENTE' | 'PAGO_FLETE' | 'PAGO_COMISION'
    monto: number | DecimalLike
  }[]
}

/**
 * Calcula estadísticas generales de operaciones
 */
export function calcularEstadisticasOperaciones(operaciones: Operacion[]) {
  const total = operaciones.length
  const porTipo = {
    compra: operaciones.filter((op) => op.tipo === 'COMPRA').length,
    ventaDirecta: operaciones.filter((op) => op.tipo === 'VENTA_DIRECTA').length,
    ventaComision: operaciones.filter((op) => op.tipo === 'VENTA_COMISION').length,
  }

  const porEstadoDocumental = {
    incompleta: operaciones.filter((op) => op.estadoDocumental === 'INCOMPLETA').length,
    completa: operaciones.filter((op) => op.estadoDocumental === 'COMPLETA').length,
  }

  const porEstadoFinanciero = {
    pendiente: operaciones.filter((op) => op.estadoFinanciero === 'PENDIENTE').length,
    facturada: operaciones.filter((op) => op.estadoFinanciero === 'FACTURADA').length,
    pagada: operaciones.filter((op) => op.estadoFinanciero === 'PAGADA').length,
    cerrada: operaciones.filter((op) => op.estadoFinanciero === 'CERRADA').length,
  }

  return {
    total,
    porTipo,
    porEstadoDocumental,
    porEstadoFinanciero,
  }
}

/**
 * Calcula métricas financieras del mes actual
 */
export function calcularMetricasFinancieras(operaciones: Operacion[]) {
  let totalIngresos = 0
  let totalCostos = 0
  let totalCobrado = 0
  let totalPagado = 0

  operaciones.forEach((op) => {
    // Calcular ingresos y costos según tipo de operación
    if (op.tipo === 'COMPRA') {
      const totalCompra = op.lineas.reduce(
        (sum, l) => sum + l.cantidad * toNumber(l.precioUnitario),
        0
      )
      totalCostos += totalCompra
    } else {
      // VENTA_DIRECTA o VENTA_COMISION
      const totalVenta = op.lineas.reduce(
        (sum, l) => sum + l.cantidad * toNumber(l.precioVentaUnitario),
        0
      )
      const totalCompra = op.lineas.reduce(
        (sum, l) => sum + l.cantidad * toNumber(l.precioCompraUnitario),
        0
      )
      totalIngresos += totalVenta
      totalCostos += totalCompra
    }

    // Calcular cobros y pagos reales
    op.pagos.forEach((pago) => {
      const monto = toNumber(pago.monto)
      if (pago.tipo === 'COBRO_CLIENTE') {
        totalCobrado += monto
      } else if (pago.tipo === 'PAGO_PROVEEDOR') {
        totalPagado += monto
      }
    })
  })

  const margenBruto = totalIngresos - totalCostos
  const porcentajeMargen = totalIngresos > 0 ? (margenBruto / totalIngresos) * 100 : 0
  const pendienteCobro = totalIngresos - totalCobrado
  const pendientePago = totalCostos - totalPagado

  return {
    totalIngresos,
    totalCostos,
    margenBruto,
    porcentajeMargen,
    totalCobrado,
    totalPagado,
    pendienteCobro,
    pendientePago,
  }
}

/**
 * Obtiene operaciones que requieren atención
 */
export function obtenerOperacionesPendientes(operaciones: Operacion[]) {
  return {
    documentosIncompletos: operaciones.filter(
      (op) => op.estadoDocumental === 'INCOMPLETA' && op.estadoFinanciero !== 'CERRADA'
    ).length,
    pagoPendiente: operaciones.filter(
      (op) => op.estadoFinanciero === 'PENDIENTE' && op.estadoDocumental === 'COMPLETA'
    ).length,
    facturadas: operaciones.filter((op) => op.estadoFinanciero === 'FACTURADA').length,
  }
}

