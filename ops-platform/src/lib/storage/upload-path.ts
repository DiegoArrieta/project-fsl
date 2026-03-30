import { StorageError } from './types'

/** Raíces permitidas para `directory` en subidas transversales */
export const ALLOWED_UPLOAD_ROOTS = new Set([
  'general',
  'documentos',
  'operaciones',
  'ordenes-compra',
  'temp',
  'presupuestos',
  'tipos-pallet',
])

const MAX_SEGMENTS = 8
const MAX_SEGMENT_LEN = 120

/**
 * Valida y normaliza el directorio lógico (prefijo bajo el bucket).
 * Ej: "operaciones" → "operaciones"; "operaciones/2026/01" tras validar segmentos.
 */
export function normalizeUploadDirectory(input: string | null | undefined): string {
  const raw = (input ?? 'general').trim().replace(/^\/+/g, '').replace(/\/+$/g, '')
  if (!raw) return 'general'

  const parts = raw.split('/').filter(Boolean)
  if (parts.length > MAX_SEGMENTS) {
    throw new StorageError('Ruta de directorio demasiado profunda', 'INVALID_TYPE')
  }

  if (!ALLOWED_UPLOAD_ROOTS.has(parts[0])) {
    throw new StorageError(
      `Directorio no permitido: "${parts[0]}". Use uno de: ${[...ALLOWED_UPLOAD_ROOTS].join(', ')}`,
      'INVALID_TYPE'
    )
  }

  for (const p of parts) {
    if (p.length > MAX_SEGMENT_LEN) {
      throw new StorageError('Segmento de ruta demasiado largo', 'INVALID_TYPE')
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(p)) {
      throw new StorageError(
        'Cada segmento solo puede contener letras, números, punto, guion y guion bajo',
        'INVALID_TYPE'
      )
    }
  }

  return parts.join('/')
}
