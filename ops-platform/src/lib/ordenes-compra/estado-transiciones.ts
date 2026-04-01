import type { EstadoOC } from '@prisma/client'

/**
 * Reglas de negocio para cambios de estado de orden de compra:
 * - BORRADOR → ENVIADA | CANCELADA
 * - ENVIADA → RECIBIDA | CANCELADA | BORRADOR (solo si aún no hay PDF generado)
 * - RECIBIDA → sin cambios (estado terminal operativo)
 * - CANCELADA → sin cambios
 */
export function esTransicionEstadoOcPermitida(
  actual: EstadoOC,
  siguiente: EstadoOC,
  ctx: { pdfGenerado: boolean }
): { ok: true } | { ok: false; mensaje: string } {
  if (actual === siguiente) return { ok: true }

  if (actual === 'CANCELADA') {
    return { ok: false, mensaje: 'No se puede reactivar una orden cancelada' }
  }

  if (actual === 'RECIBIDA') {
    return { ok: false, mensaje: 'Una orden RECIBIDA no puede cambiar de estado' }
  }

  if (actual === 'BORRADOR') {
    if (siguiente === 'ENVIADA' || siguiente === 'CANCELADA') return { ok: true }
    if (siguiente === 'RECIBIDA') {
      return {
        ok: false,
        mensaje: 'La orden debe estar ENVIADA antes de marcarla como RECIBIDA',
      }
    }
    if (siguiente === 'BORRADOR') return { ok: true }
    return { ok: false, mensaje: `Transición no permitida: ${actual} → ${siguiente}` }
  }

  if (actual === 'ENVIADA') {
    if (siguiente === 'RECIBIDA' || siguiente === 'CANCELADA') return { ok: true }
    if (siguiente === 'BORRADOR') {
      if (ctx.pdfGenerado) {
        return {
          ok: false,
          mensaje: 'No se puede volver a BORRADOR una orden con PDF generado',
        }
      }
      return { ok: true }
    }
    return { ok: false, mensaje: `Transición no permitida: ${actual} → ${siguiente}` }
  }

  return { ok: false, mensaje: `Transición no permitida: ${actual} → ${siguiente}` }
}
