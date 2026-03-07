/**
 * Funciones para detección de documentos obligatorios y estado documental
 */

interface Producto {
  tipoPalletId: string
  tipoPallet?: {
    requiereCertificacion: boolean
  }
}

interface DocumentoOperacion {
  tipo: string
  esObligatorio: boolean
}

/**
 * Determina qué documentos son obligatorios según el tipo de operación
 */
export function obtenerDocumentosObligatorios(
  tipo: 'COMPRA' | 'VENTA_DIRECTA' | 'VENTA_COMISION',
  productos: Producto[]
): string[] {
  const documentosObligatorios: string[] = []

  switch (tipo) {
    case 'COMPRA':
      documentosObligatorios.push('ORDEN_COMPRA') // OC de FSL al proveedor
      documentosObligatorios.push('GUIA_RECEPCION') // Guía de recepción
      break

    case 'VENTA_DIRECTA':
    case 'VENTA_COMISION':
      documentosObligatorios.push('ORDEN_COMPRA_CLIENTE') // OC del cliente a FSL
      documentosObligatorios.push('ORDEN_COMPRA') // OC de FSL al proveedor
      documentosObligatorios.push('GUIA_DESPACHO') // Guía de despacho
      documentosObligatorios.push('FACTURA') // Factura
      break
  }

  // Verificar si algún producto requiere certificación NIMF-15
  const requiereCertificacion = productos.some((p) => p.tipoPallet?.requiereCertificacion)
  if (requiereCertificacion) {
    documentosObligatorios.push('CERTIFICADO_NIMF15')
  }

  return documentosObligatorios
}

/**
 * Determina el estado documental de una operación
 */
export function calcularEstadoDocumental(
  documentosObligatorios: string[],
  documentosPresentes: DocumentoOperacion[]
): 'INCOMPLETA' | 'COMPLETA' {
  const tiposPresentes = documentosPresentes
    .filter((d) => d.esObligatorio)
    .map((d) => d.tipo)

  const todosPresentos = documentosObligatorios.every((tipo) => tiposPresentes.includes(tipo))

  return todosPresentos ? 'COMPLETA' : 'INCOMPLETA'
}

/**
 * Obtiene la lista de documentos faltantes
 */
export function obtenerDocumentosFaltantes(
  documentosObligatorios: string[],
  documentosPresentes: DocumentoOperacion[]
): string[] {
  const tiposPresentes = documentosPresentes
    .filter((d) => d.esObligatorio)
    .map((d) => d.tipo)

  return documentosObligatorios.filter((tipo) => !tiposPresentes.includes(tipo))
}

/**
 * Obtiene nombre legible del tipo de documento
 */
export function getNombreDocumento(tipo: string): string {
  const nombres: Record<string, string> = {
    ORDEN_COMPRA: 'Orden de Compra',
    ORDEN_COMPRA_CLIENTE: 'Orden de Compra del Cliente',
    GUIA_DESPACHO: 'Guía de Despacho',
    GUIA_RECEPCION: 'Guía de Recepción',
    FACTURA: 'Factura',
    CERTIFICADO_NIMF15: 'Certificado NIMF-15',
    OTRO: 'Otro Documento',
  }
  return nombres[tipo] || tipo
}

