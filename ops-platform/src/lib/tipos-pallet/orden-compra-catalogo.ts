export interface TipoPalletCategoriaCatalogo {
  id: string
  codigo: string
  nombre: string
}

export interface TipoPalletPaisCatalogo {
  pais: {
    id: string
    codigoIso: string
    nombre: string
  }
}

/** Item como lo devuelve GET /api/tipos-pallet (include categoria + paises) */
export interface TipoPalletCatalogoOc {
  id: string
  categoriaId: string
  codigo: string
  nombre: string
  descripcion: string | null
  dimensiones: string | null
  requiereCertificacion: boolean
  activo: boolean
  categoria: TipoPalletCategoriaCatalogo
  paises: TipoPalletPaisCatalogo[]
}

export function findTipoPalletCatalogoOc(
  catalogo: TipoPalletCatalogoOc[],
  tipoPalletId: string
): TipoPalletCatalogoOc | undefined {
  if (!tipoPalletId) return undefined
  return catalogo.find((t) => t.id === tipoPalletId)
}

export function formatPaisesTipoPalletOc(item: TipoPalletCatalogoOc | undefined): string {
  if (!item?.paises?.length) return '—'
  return item.paises.map((tp) => tp.pais.nombre || tp.pais.codigoIso).join(', ')
}

export function labelCertificacionTipoPalletOc(requiere: boolean): string {
  return requiere ? 'Sí (requerida)' : 'No'
}

/** Etiqueta en línea de producto cuando aplica certificación (NIMF 15). */
export const ETIQUETA_LINEA_CERTIFICACION_PALLET = 'NIMF 15'

/** Shape mínimo desde Prisma (líneas de orden de compra, etc.). */
export interface TipoPalletAtributosLineaInput {
  categoria: { nombre: string }
  dimensiones: string | null
  requiereCertificacion: boolean
  paises: Array<{ pais: { nombre: string; codigoIso: string } }>
}

/**
 * Una línea: categoría - medidas - [NIMF 15 si requiere certificación] - países.
 * Si no requiere certificado, el segmento de certificación no se incluye.
 */
export function formatTipoPalletAtributosLineaDesdeInput(input: TipoPalletAtributosLineaInput): string {
  const medidas = input.dimensiones?.trim() || '—'
  const paisesStr =
    input.paises?.length > 0
      ? input.paises.map((tp) => tp.pais.nombre || tp.pais.codigoIso).join(', ')
      : '—'
  const partes = [input.categoria.nombre, medidas]
  if (input.requiereCertificacion) partes.push(ETIQUETA_LINEA_CERTIFICACION_PALLET)
  partes.push(paisesStr)
  return partes.join(' - ')
}

export function formatTipoPalletAtributosLineaOc(tipo: TipoPalletCatalogoOc): string {
  return formatTipoPalletAtributosLineaDesdeInput({
    categoria: tipo.categoria,
    dimensiones: tipo.dimensiones,
    requiereCertificacion: tipo.requiereCertificacion,
    paises: tipo.paises,
  })
}

/** Texto plano para typeahead / accesibilidad del Select (Radix `textValue`). */
export function tipoPalletSelectTypeaheadText(tipo: TipoPalletCatalogoOc): string {
  return [
    tipo.codigo,
    tipo.nombre,
    formatTipoPalletAtributosLineaOc(tipo),
    tipo.descripcion ?? '',
  ]
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function fetchTiposPalletCatalogoOrdenCompra(): Promise<TipoPalletCatalogoOc[]> {
  const response = await fetch('/api/tipos-pallet?pageSize=500')
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(typeof body.error === 'string' ? body.error : 'Error al cargar tipos de pallet')
  }
  const json = await response.json()
  return (json.data ?? []) as TipoPalletCatalogoOc[]
}
