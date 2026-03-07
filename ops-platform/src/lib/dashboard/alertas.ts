/**
 * Sistema de alertas y detección de pendientes
 */

interface Operacion {
  id: string
  numero: string
  tipo: 'COMPRA' | 'VENTA_DIRECTA' | 'VENTA_COMISION'
  fecha: Date
  estadoDocumental: 'INCOMPLETA' | 'COMPLETA'
  estadoFinanciero: 'PENDIENTE' | 'FACTURADA' | 'PAGADA' | 'CERRADA'
  proveedor?: { razonSocial: string } | null
  cliente?: { razonSocial: string } | null
}

interface DocumentoFaltante {
  operacionId: string
  operacionNumero: string
  documentosObligatorios: string[]
  documentosFaltantes: string[]
}

export type TipoAlerta =
  | 'DOCUMENTOS_INCOMPLETOS'
  | 'PAGO_PENDIENTE'
  | 'FACTURADA_SIN_PAGAR'
  | 'OPERACION_ANTIGUA'

export interface Alerta {
  id: string
  tipo: TipoAlerta
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA'
  titulo: string
  descripcion: string
  operacionId: string
  operacionNumero: string
  fechaOperacion: Date
  enlace: string
}

/**
 * Genera alertas de documentos incompletos
 */
export function generarAlertasDocumentosIncompletos(
  operaciones: Operacion[],
  documentosFaltantes: DocumentoFaltante[]
): Alerta[] {
  const alertas: Alerta[] = []

  documentosFaltantes.forEach((doc) => {
    const operacion = operaciones.find((op) => op.id === doc.operacionId)
    if (!operacion || operacion.estadoFinanciero === 'CERRADA') return

    // Calcular días desde la operación
    const diasDesdeOperacion = Math.floor(
      (new Date().getTime() - new Date(operacion.fecha).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Prioridad según antigüedad
    let prioridad: 'ALTA' | 'MEDIA' | 'BAJA' = 'BAJA'
    if (diasDesdeOperacion > 15) prioridad = 'ALTA'
    else if (diasDesdeOperacion > 7) prioridad = 'MEDIA'

    alertas.push({
      id: `doc-${operacion.id}`,
      tipo: 'DOCUMENTOS_INCOMPLETOS',
      prioridad,
      titulo: `Documentos faltantes en ${operacion.numero}`,
      descripcion: `Faltan ${doc.documentosFaltantes.length} documento(s): ${doc.documentosFaltantes.join(', ')}`,
      operacionId: operacion.id,
      operacionNumero: operacion.numero,
      fechaOperacion: operacion.fecha,
      enlace: `/operaciones/${operacion.id}`,
    })
  })

  return alertas
}

/**
 * Genera alertas de pagos pendientes
 */
export function generarAlertasPagosPendientes(operaciones: Operacion[]): Alerta[] {
  const alertas: Alerta[] = []

  operaciones
    .filter((op) => op.estadoFinanciero === 'PENDIENTE' && op.estadoDocumental === 'COMPLETA')
    .forEach((operacion) => {
      const diasDesdeOperacion = Math.floor(
        (new Date().getTime() - new Date(operacion.fecha).getTime()) / (1000 * 60 * 60 * 24)
      )

      let prioridad: 'ALTA' | 'MEDIA' | 'BAJA' = 'MEDIA'
      if (diasDesdeOperacion > 30) prioridad = 'ALTA'

      const entidad =
        operacion.tipo === 'COMPRA'
          ? operacion.proveedor?.razonSocial || 'Proveedor'
          : operacion.cliente?.razonSocial || 'Cliente'

      alertas.push({
        id: `pago-${operacion.id}`,
        tipo: 'PAGO_PENDIENTE',
        prioridad,
        titulo: `Pago pendiente en ${operacion.numero}`,
        descripcion: `${entidad} - ${diasDesdeOperacion} días desde la operación`,
        operacionId: operacion.id,
        operacionNumero: operacion.numero,
        fechaOperacion: operacion.fecha,
        enlace: `/operaciones/${operacion.id}`,
      })
    })

  return alertas
}

/**
 * Genera alertas de operaciones facturadas sin pagar al proveedor
 */
export function generarAlertasFacturadasSinPagar(operaciones: Operacion[]): Alerta[] {
  const alertas: Alerta[] = []

  operaciones
    .filter((op) => op.estadoFinanciero === 'FACTURADA')
    .forEach((operacion) => {
      const diasDesdeOperacion = Math.floor(
        (new Date().getTime() - new Date(operacion.fecha).getTime()) / (1000 * 60 * 60 * 24)
      )

      let prioridad: 'ALTA' | 'MEDIA' | 'BAJA' = 'MEDIA'
      if (diasDesdeOperacion > 20) prioridad = 'ALTA'

      alertas.push({
        id: `facturada-${operacion.id}`,
        tipo: 'FACTURADA_SIN_PAGAR',
        prioridad,
        titulo: `Falta pagar proveedor en ${operacion.numero}`,
        descripcion: `Cliente pagó pero falta pagar a ${operacion.proveedor?.razonSocial || 'proveedor'}`,
        operacionId: operacion.id,
        operacionNumero: operacion.numero,
        fechaOperacion: operacion.fecha,
        enlace: `/operaciones/${operacion.id}`,
      })
    })

  return alertas
}

/**
 * Genera alertas de operaciones antiguas sin cerrar
 */
export function generarAlertasOperacionesAntiguas(operaciones: Operacion[]): Alerta[] {
  const alertas: Alerta[] = []
  const DIAS_UMBRAL = 60

  operaciones
    .filter((op) => op.estadoFinanciero !== 'CERRADA')
    .forEach((operacion) => {
      const diasDesdeOperacion = Math.floor(
        (new Date().getTime() - new Date(operacion.fecha).getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diasDesdeOperacion > DIAS_UMBRAL) {
        alertas.push({
          id: `antigua-${operacion.id}`,
          tipo: 'OPERACION_ANTIGUA',
          prioridad: 'ALTA',
          titulo: `Operación antigua sin cerrar: ${operacion.numero}`,
          descripcion: `${diasDesdeOperacion} días desde la operación. Considere cerrarla.`,
          operacionId: operacion.id,
          operacionNumero: operacion.numero,
          fechaOperacion: operacion.fecha,
          enlace: `/operaciones/${operacion.id}`,
        })
      }
    })

  return alertas
}

/**
 * Genera todas las alertas del sistema
 */
export function generarTodasLasAlertas(
  operaciones: Operacion[],
  documentosFaltantes: DocumentoFaltante[]
): Alerta[] {
  const alertas: Alerta[] = []

  alertas.push(...generarAlertasDocumentosIncompletos(operaciones, documentosFaltantes))
  alertas.push(...generarAlertasPagosPendientes(operaciones))
  alertas.push(...generarAlertasFacturadasSinPagar(operaciones))
  alertas.push(...generarAlertasOperacionesAntiguas(operaciones))

  // Ordenar por prioridad (ALTA primero) y luego por fecha de operación
  return alertas.sort((a, b) => {
    const prioridadOrder = { ALTA: 0, MEDIA: 1, BAJA: 2 }
    if (prioridadOrder[a.prioridad] !== prioridadOrder[b.prioridad]) {
      return prioridadOrder[a.prioridad] - prioridadOrder[b.prioridad]
    }
    return new Date(a.fechaOperacion).getTime() - new Date(b.fechaOperacion).getTime()
  })
}

