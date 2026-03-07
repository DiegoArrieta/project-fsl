/**
 * Funciones de cálculo para operaciones
 * Incluye cálculo de totales, márgenes y validaciones de negocio
 */

// Tipo que soporta Decimal de Prisma sin importación directa
type DecimalLike = {
  toNumber(): number
}

interface ProductoCalculo {
  cantidad: number
  precioUnitario?: number | DecimalLike | null
  precioVentaUnitario?: number | DecimalLike | null
  precioCompraUnitario?: number | DecimalLike | null
}

/**
 * Convierte un valor Decimal de Prisma a number
 */
function toNumber(value: number | DecimalLike | null | undefined): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  // Si tiene método toNumber, es un Decimal
  if (typeof value === 'object' && 'toNumber' in value) {
    return value.toNumber()
  }
  return 0
}

interface ResultadoCalculoOperacion {
  totalVenta: number
  totalCompra: number
  margenBruto: number
  porcentajeMargen: number
}

/**
 * Calcula el total de una operación de COMPRA
 */
export function calcularTotalCompra(productos: ProductoCalculo[]): ResultadoCalculoOperacion {
  const totalCompra = productos.reduce((sum, p) => {
    return sum + (p.cantidad || 0) * toNumber(p.precioUnitario)
  }, 0)

  return {
    totalVenta: 0,
    totalCompra,
    margenBruto: 0,
    porcentajeMargen: 0,
  }
}

/**
 * Calcula totales y márgenes de una operación de VENTA (unificada)
 */
export function calcularTotalesVenta(productos: ProductoCalculo[]): ResultadoCalculoOperacion {
  const totalVenta = productos.reduce((sum, p) => {
    return sum + (p.cantidad || 0) * toNumber(p.precioVentaUnitario)
  }, 0)

  const totalCompra = productos.reduce((sum, p) => {
    return sum + (p.cantidad || 0) * toNumber(p.precioCompraUnitario)
  }, 0)

  const margenBruto = totalVenta - totalCompra
  const porcentajeMargen = totalVenta > 0 ? (margenBruto / totalVenta) * 100 : 0

  return {
    totalVenta,
    totalCompra,
    margenBruto,
    porcentajeMargen,
  }
}

/**
 * Calcula los totales de una operación según su tipo
 */
export function calcularTotalesOperacion(
  tipo: 'COMPRA' | 'VENTA_DIRECTA' | 'VENTA_COMISION',
  productos: ProductoCalculo[]
): ResultadoCalculoOperacion {
  if (tipo === 'COMPRA') {
    return calcularTotalCompra(productos)
  } else {
    return calcularTotalesVenta(productos)
  }
}

/**
 * Valida que el margen no sea negativo
 */
export function validarMargenPositivo(productos: ProductoCalculo[]): boolean {
  return productos.every((p) => {
    if (p.precioVentaUnitario !== undefined && p.precioCompraUnitario !== undefined) {
      return toNumber(p.precioVentaUnitario) >= toNumber(p.precioCompraUnitario)
    }
    return true
  })
}

/**
 * Genera el siguiente número de operación secuencial
 * Formato: OP-YYYY-NNNNN
 */
export function generarNumeroOperacion(ultimoNumero: string | null): string {
  const anioActual = new Date().getFullYear()
  
  if (!ultimoNumero) {
    // Primera operación del año
    return `OP-${anioActual}-00001`
  }

  // Extraer año y número del último número
  const match = ultimoNumero.match(/OP-(\d{4})-(\d{5})/)
  if (!match) {
    // Si no coincide el formato, empezar desde 1
    return `OP-${anioActual}-00001`
  }

  const [, anio, numero] = match
  const anioUltimo = parseInt(anio, 10)
  const numeroUltimo = parseInt(numero, 10)

  if (anioUltimo < anioActual) {
    // Nuevo año, reiniciar contador
    return `OP-${anioActual}-00001`
  }

  // Incrementar número
  const siguienteNumero = numeroUltimo + 1
  return `OP-${anioActual}-${siguienteNumero.toString().padStart(5, '0')}`
}

