/**
 * Next.js puede exponer params dinámicos como string o string[].
 * Normaliza a un solo string para armar URLs de API de forma estable.
 */
export function segmentoRutaParam(value: string | string[] | undefined): string {
  if (value === undefined) return ''
  if (Array.isArray(value)) return value[0] ?? ''
  return value
}
