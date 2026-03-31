/**
 * PDF de órdenes de compra: mismo estilo visual que presupuestos (HTML + Puppeteer).
 */

import { buildOrdenCompraPdfHtml } from '@/lib/pdf/orden-compra-pdf-html'
import { renderHtmlToPdfBuffer } from '@/lib/pdf/render-html-to-pdf-buffer'
import type { DatosOrdenCompraPdf } from './pdf-types'

export type {
  DatosEmpresaPdf as DatosEmpresa,
  DatosProveedorPdf as DatosProveedor,
  LineaProductoPdf as LineaProducto,
  DatosOrdenCompraPdf as DatosOrdenCompra,
} from './pdf-types'

export async function generarPDFOrdenCompra(datos: DatosOrdenCompraPdf): Promise<Blob> {
  const html = buildOrdenCompraPdfHtml(datos)
  const buffer = await renderHtmlToPdfBuffer(html)
  return new Blob([buffer], { type: 'application/pdf' })
}

/**
 * Guarda un PDF en el servidor (placeholder - implementar según infraestructura)
 */
export async function guardarPDF(_blob: Blob, numero: string): Promise<string> {
  const url = `/uploads/ocs/${numero}.pdf`
  return url
}
