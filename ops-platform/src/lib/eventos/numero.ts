/**
 * Función para generar número secuencial de Evento
 * Formato: EV-YYYY-NNNNN
 */

/**
 * Genera el siguiente número de evento secuencial
 * Formato: EV-YYYY-NNNNN
 * Se reinicia cada año
 */
export function generarNumeroEvento(ultimoNumero: string | null): string {
  const anioActual = new Date().getFullYear()
  
  if (!ultimoNumero) {
    // Primer evento del año
    return `EV-${anioActual}-00001`
  }

  // Extraer año y número del último número
  const match = ultimoNumero.match(/EV-(\d{4})-(\d{5})/)
  if (!match) {
    // Si no coincide el formato, empezar desde 1
    return `EV-${anioActual}-00001`
  }

  const [, anio, numero] = match
  const anioUltimo = parseInt(anio, 10)
  const numeroUltimo = parseInt(numero, 10)

  if (anioUltimo < anioActual) {
    // Nuevo año, reiniciar contador
    return `EV-${anioActual}-00001`
  }

  // Incrementar número
  const siguienteNumero = numeroUltimo + 1
  return `EV-${anioActual}-${siguienteNumero.toString().padStart(5, '0')}`
}

