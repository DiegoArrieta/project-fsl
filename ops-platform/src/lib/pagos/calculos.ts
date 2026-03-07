/**
 * Funciones de cálculo financiero para operaciones
 */

// Tipo que soporta Decimal de Prisma sin importación directa
type DecimalLike = {
  toNumber(): number
}

interface Pago {
  tipo: 'PAGO_PROVEEDOR' | 'COBRO_CLIENTE' | 'PAGO_FLETE' | 'PAGO_COMISION'
  monto: number | DecimalLike
}

/**
 * Convierte un valor Decimal de Prisma a number
 */
function toNumber(value: number | DecimalLike): number {
  if (typeof value === 'number') return value
  // Si tiene método toNumber, es un Decimal
  if (typeof value === 'object' && 'toNumber' in value) {
    return value.toNumber()
  }
  return 0
}

interface ResumenFinanciero {
  totalCobros: number
  totalPagos: number
  totalFletes: number
  totalComisiones: number
  saldoCobros: number
  saldoPagos: number
  margenNeto: number
  estadoSugerido: 'PENDIENTE' | 'FACTURADA' | 'PAGADA'
}

/**
 * Calcula el resumen financiero de una operación
 */
export function calcularResumenFinanciero(
  precioVentaTotal: number,
  precioCompraTotal: number,
  pagos: Pago[]
): ResumenFinanciero {
  // Sumar pagos por tipo
  const totalCobros = pagos
    .filter((p) => p.tipo === 'COBRO_CLIENTE')
    .reduce((sum, p) => sum + toNumber(p.monto), 0)

  const totalPagos = pagos
    .filter((p) => p.tipo === 'PAGO_PROVEEDOR')
    .reduce((sum, p) => sum + toNumber(p.monto), 0)

  const totalFletes = pagos
    .filter((p) => p.tipo === 'PAGO_FLETE')
    .reduce((sum, p) => sum + toNumber(p.monto), 0)

  const totalComisiones = pagos
    .filter((p) => p.tipo === 'PAGO_COMISION')
    .reduce((sum, p) => sum + toNumber(p.monto), 0)

  // Calcular saldos pendientes
  const saldoCobros = precioVentaTotal - totalCobros
  const saldoPagos = precioCompraTotal - totalPagos

  // Calcular margen neto (considerando fletes y comisiones)
  const margenNeto = totalCobros - totalPagos - totalFletes - totalComisiones

  // Determinar estado sugerido
  let estadoSugerido: 'PENDIENTE' | 'FACTURADA' | 'PAGADA' = 'PENDIENTE'

  if (totalCobros > 0 && totalPagos === 0) {
    estadoSugerido = 'FACTURADA'
  } else if (totalCobros >= precioVentaTotal && totalPagos >= precioCompraTotal) {
    estadoSugerido = 'PAGADA'
  }

  return {
    totalCobros,
    totalPagos,
    totalFletes,
    totalComisiones,
    saldoCobros,
    saldoPagos,
    margenNeto,
    estadoSugerido,
  }
}

/**
 * Determina el estado financiero de una operación según los pagos
 */
export function determinarEstadoFinanciero(
  tipo: 'COMPRA' | 'VENTA_DIRECTA' | 'VENTA_COMISION',
  precioVentaTotal: number,
  precioCompraTotal: number,
  pagos: Pago[]
): 'PENDIENTE' | 'FACTURADA' | 'PAGADA' {
  const resumen = calcularResumenFinanciero(precioVentaTotal, precioCompraTotal, pagos)

  // Para operaciones de COMPRA, solo importa si se pagó al proveedor
  if (tipo === 'COMPRA') {
    if (resumen.totalPagos >= precioCompraTotal) {
      return 'PAGADA'
    }
    return 'PENDIENTE'
  }

  // Para operaciones de VENTA (DIRECTA o COMISION)
  // FACTURADA: Cliente ha pagado pero aún no se ha pagado al proveedor
  // PAGADA: Cliente ha pagado Y se ha pagado al proveedor
  if (resumen.totalCobros >= precioVentaTotal) {
    if (resumen.totalPagos >= precioCompraTotal) {
      return 'PAGADA'
    }
    return 'FACTURADA'
  }

  return 'PENDIENTE'
}

/**
 * Valida que un pago sea coherente con el tipo de operación
 */
export function validarPagoParaOperacion(
  tipoOperacion: 'COMPRA' | 'VENTA_DIRECTA' | 'VENTA_COMISION',
  tipoPago: 'PAGO_PROVEEDOR' | 'COBRO_CLIENTE' | 'PAGO_FLETE' | 'PAGO_COMISION',
  tieneProveedor: boolean,
  tieneCliente: boolean
): { valido: boolean; mensaje?: string } {
  // Validar COBRO_CLIENTE solo si hay cliente
  if (tipoPago === 'COBRO_CLIENTE') {
    if (!tieneCliente) {
      return {
        valido: false,
        mensaje: 'No se puede registrar un cobro sin cliente asociado',
      }
    }
  }

  // Validar PAGO_PROVEEDOR solo si hay proveedor
  if (tipoPago === 'PAGO_PROVEEDOR') {
    if (!tieneProveedor) {
      return {
        valido: false,
        mensaje: 'No se puede registrar un pago sin proveedor asociado',
      }
    }
  }

  // Validar COBRO_CLIENTE solo en operaciones de VENTA
  if (tipoPago === 'COBRO_CLIENTE' && tipoOperacion === 'COMPRA') {
    return {
      valido: false,
      mensaje: 'No se puede registrar un cobro a cliente en una operación de COMPRA',
    }
  }

  // PAGO_COMISION solo tiene sentido en VENTA_COMISION
  if (tipoPago === 'PAGO_COMISION' && tipoOperacion !== 'VENTA_COMISION') {
    return {
      valido: false,
      mensaje: 'Los pagos de comisión solo aplican a operaciones tipo VENTA_COMISION',
    }
  }

  return { valido: true }
}

/**
 * Calcula el monto máximo permitido para un tipo de pago
 */
export function calcularMontoMaximo(
  tipoPago: 'PAGO_PROVEEDOR' | 'COBRO_CLIENTE' | 'PAGO_FLETE' | 'PAGO_COMISION',
  precioVentaTotal: number,
  precioCompraTotal: number,
  pagosExistentes: Pago[]
): number | null {
  const resumen = calcularResumenFinanciero(precioVentaTotal, precioCompraTotal, pagosExistentes)

  switch (tipoPago) {
    case 'COBRO_CLIENTE':
      // No puede cobrar más de lo que debe el cliente
      return Math.max(0, resumen.saldoCobros)

    case 'PAGO_PROVEEDOR':
      // No puede pagar más de lo que debe al proveedor
      return Math.max(0, resumen.saldoPagos)

    case 'PAGO_FLETE':
    case 'PAGO_COMISION':
      // No hay límite específico (pueden ser gastos adicionales)
      return null

    default:
      return null
  }
}

