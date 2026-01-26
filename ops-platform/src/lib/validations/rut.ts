/**
 * Utilidades para validación de RUT chileno
 * El RUT se almacena sin puntos, solo con guión antes del dígito verificador
 * Formato de almacenamiento: 12345678-9
 * Formato de visualización: 12.345.678-9
 */

/**
 * Normaliza un RUT eliminando puntos y espacios, manteniendo solo el guión antes del dígito verificador
 * @param rut - RUT en cualquier formato (con o sin puntos)
 * @returns RUT normalizado sin puntos (ej: 77442030-4)
 */
export function normalizeRut(rut: string): string {
  // Eliminar puntos, espacios y convertir a mayúsculas
  const cleaned = rut.replace(/\./g, '').replace(/\s/g, '').toUpperCase()
  return cleaned
}

/**
 * Valida el formato de un RUT (debe tener guión antes del dígito verificador)
 * @param rut - RUT normalizado (sin puntos)
 * @returns true si el formato es válido
 */
export function validateRutFormat(rut: string): boolean {
  // Formato: números seguidos de guión y dígito verificador (K o número)
  const rutRegex = /^\d{7,8}-[\dK]$/
  return rutRegex.test(rut)
}

/**
 * Calcula el dígito verificador de un RUT
 * @param rutBody - Cuerpo del RUT sin guión ni dígito verificador (ej: 77442030)
 * @returns Dígito verificador calculado (K o número)
 */
export function calculateVerifierDigit(rutBody: string): string {
  let sum = 0
  let multiplier = 2

  // Recorrer el RUT de derecha a izquierda
  for (let i = rutBody.length - 1; i >= 0; i--) {
    sum += parseInt(rutBody[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const remainder = sum % 11
  const verifier = 11 - remainder

  if (verifier === 11) return '0'
  if (verifier === 10) return 'K'
  return verifier.toString()
}

/**
 * Valida un RUT chileno completo (formato y dígito verificador)
 * @param rut - RUT normalizado (sin puntos, con guión)
 * @returns true si el RUT es válido
 */
export function validateRut(rut: string): boolean {
  // Normalizar el RUT
  const normalized = normalizeRut(rut)

  // Validar formato
  if (!validateRutFormat(normalized)) {
    return false
  }

  // Separar cuerpo y dígito verificador
  const [rutBody, verifierDigit] = normalized.split('-')

  // Calcular dígito verificador esperado
  const calculatedDigit = calculateVerifierDigit(rutBody)

  // Comparar (case insensitive)
  return calculatedDigit.toUpperCase() === verifierDigit.toUpperCase()
}

/**
 * Formatea un RUT para visualización (agrega puntos)
 * @param rut - RUT normalizado (sin puntos)
 * @returns RUT formateado con puntos (ej: 77.442.030-4)
 */
export function formatRutForDisplay(rut: string): string {
  const normalized = normalizeRut(rut)
  const [rutBody, verifierDigit] = normalized.split('-')

  // Agregar puntos cada 3 dígitos desde la derecha
  const formattedBody = rutBody.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return `${formattedBody}-${verifierDigit}`
}

