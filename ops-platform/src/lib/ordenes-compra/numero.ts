/**
 * Función para generar número secuencial de Orden de Compra
 * Formato: OC-YYYY-NNNNN
 */

/**
 * Genera el siguiente número de orden de compra secuencial
 * Formato: OC-YYYY-NNNNN
 * Se reinicia cada año
 */
export function generarNumeroOrdenCompra(ultimoNumero: string | null): string {
  const anioActual = new Date().getFullYear()
  
  if (!ultimoNumero) {
    // Primera OC del año
    return `OC-${anioActual}-00001`
  }

  // Extraer año y número del último número
  const match = ultimoNumero.match(/OC-(\d{4})-(\d{5})/)
  if (!match) {
    // Si no coincide el formato, empezar desde 1
    return `OC-${anioActual}-00001`
  }

  const [, anio, numero] = match
  const anioUltimo = parseInt(anio, 10)
  const numeroUltimo = parseInt(numero, 10)

  if (anioUltimo < anioActual) {
    // Nuevo año, reiniciar contador
    return `OC-${anioActual}-00001`
  }

  // Incrementar número
  const siguienteNumero = numeroUltimo + 1
  return `OC-${anioActual}-${siguienteNumero.toString().padStart(5, '0')}`
}





