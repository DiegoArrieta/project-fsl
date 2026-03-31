import Handlebars from 'handlebars'
import { prisma } from '@/lib/db'
import { getEmpresaPdfLogoDataUrl } from '@/lib/pdf/empresa-logo-data-url'
import { PRESUPUESTO_PDF_EMISOR_DATOS } from '@/lib/pdf/presupuesto-emisor-datos'
import { getDocumentoPdfBaseStyles, getPdfFooterText } from '@/lib/pdf/documento-pdf-styles'
import { renderHtmlToPdfBuffer } from '@/lib/pdf/render-html-to-pdf-buffer'
import { ETIQUETA_LINEA_CERTIFICACION_PALLET } from '@/lib/tipos-pallet/orden-compra-catalogo'

function textoPaisesLineaPresupuesto(
  paises: Array<{ pais: { nombre: string; codigoIso: string } }> | null | undefined
): string {
  if (!paises?.length) return '—'
  return paises.map((x) => x.pais.nombre || x.pais.codigoIso).join(', ')
}

/**
 * Servicio para generar PDFs de presupuestos (HTML + Handlebars + Puppeteer).
 * Estilos homologados con órdenes de compra (`documento-pdf-styles`).
 */
export class PDFService {
  /**
   * Genera un PDF del presupuesto
   */
  static async generatePresupuestoPDF(presupuestoId: string): Promise<Buffer> {
    const presupuesto = await prisma.presupuesto.findUnique({
      where: { id: presupuestoId },
      include: {
        cliente: true,
        lineas: {
          include: {
            tipoPallet: {
              include: {
                categoria: true,
                paises: { include: { pais: true } },
              },
            },
          },
        },
      },
    })

    if (!presupuesto) {
      throw new Error('Presupuesto no encontrado')
    }

    const lineas = presupuesto.lineas.map((linea, index) => {
      const tp = linea.tipoPallet
      const comentario = (linea.descripcion ?? '').trim()
      return {
        numero: index + 1,
        codigo: tp.codigo,
        nombre: tp.nombre,
        categoria: tp.categoria?.nombre ?? '—',
        dimensiones: tp.dimensiones?.trim() || '—',
        nimf15: Boolean(tp.requiereCertificacion),
        etiquetaNimf: ETIQUETA_LINEA_CERTIFICACION_PALLET,
        paises: textoPaisesLineaPresupuesto(tp.paises),
        comentario,
        cantidad: linea.cantidad,
        precioUnitario: linea.precioUnitario.toNumber().toLocaleString('es-CL', {
          style: 'currency',
          currency: 'CLP',
        }),
        total: linea.precioUnitario.mul(linea.cantidad).toNumber().toLocaleString('es-CL', {
          style: 'currency',
          currency: 'CLP',
        }),
      }
    })

    const logoDataUrl = getEmpresaPdfLogoDataUrl()

    const templateData = {
      styles: getDocumentoPdfBaseStyles(),
      footer: getPdfFooterText(),
      logoDataUrl,
      numero: presupuesto.numero,
      fecha: presupuesto.fecha.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      emisora: { ...PRESUPUESTO_PDF_EMISOR_DATOS },
      cliente: {
        razonSocial: presupuesto.cliente.razonSocial,
        rut: presupuesto.cliente.rut,
        direccion: presupuesto.cliente.direccion,
        ciudad: presupuesto.cliente.ciudad,
        telefono: presupuesto.cliente.telefono,
        email: presupuesto.cliente.email,
      },
      direccion: presupuesto.direccion,
      ciudad: presupuesto.ciudad,
      observaciones: presupuesto.observaciones,
      lineas,
      subtotal: presupuesto.subtotal.toNumber().toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP',
      }),
      iva: presupuesto.iva.toNumber().toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP',
      }),
      total: presupuesto.total.toNumber().toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP',
      }),
    }

    const htmlTemplate = PDFService.getHTMLTemplate()
    const template = Handlebars.compile(htmlTemplate)
    const html = template(templateData)

    return renderHtmlToPdfBuffer(html)
  }

  private static getHTMLTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presupuesto {{numero}}</title>
  <style>{{{styles}}}</style>
</head>
<body>
  <div class="header">
    <div class="header-brand">
      {{#if logoDataUrl}}
      <img src="{{{logoDataUrl}}}" alt="Forestal Santa Lucía SpA" class="logo-img" />
      {{else}}
      <div class="logo logo--text">🌲 Forestal Santa Lucía SpA</div>
      {{/if}}
    </div>
    <div class="header-info">
      <h1>Presupuesto</h1>
      <div><strong>N°:</strong> {{numero}}</div>
      <div><strong>Fecha:</strong> {{fecha}}</div>
    </div>
  </div>

  <div class="counterparty-dual">
    <div class="counterparty-section counterparty-section--emisora">
      <h2>Empresa</h2>
      <div><strong>{{emisora.nombre}}</strong></div>
      <div>RUT: {{emisora.rut}}</div>
      <div>{{emisora.tema}}</div>
      <div>{{emisora.direccion}}</div>
      <div>Tel: {{emisora.fono}}</div>
      <div>Email: {{emisora.email}}</div>
    </div>
    <div class="counterparty-section counterparty-section--cliente">
      <h2>Cliente</h2>
      <div><strong>{{cliente.razonSocial}}</strong></div>
      <div>RUT: {{cliente.rut}}</div>
      {{#if cliente.direccion}}
      <div>{{cliente.direccion}}</div>
      {{/if}}
      {{#if cliente.ciudad}}
      <div>{{cliente.ciudad}}</div>
      {{/if}}
      {{#if cliente.telefono}}
      <div>Tel: {{cliente.telefono}}</div>
      {{/if}}
      {{#if cliente.email}}
      <div>Email: {{cliente.email}}</div>
      {{/if}}
    </div>
  </div>

  {{#if direccion}}
  <div class="presupuesto-info">
    <div class="info-row">
      <div class="info-label">Dirección de entrega</div>
      <div>{{direccion}}</div>
    </div>
    {{#if ciudad}}
    <div class="info-row">
      <div class="info-label">Ciudad</div>
      <div>{{ciudad}}</div>
    </div>
    {{/if}}
  </div>
  {{/if}}

  <table>
    <thead>
      <tr>
        <th style="width:36px">#</th>
        <th>Producto</th>
        <th class="numeric" style="width:64px">Cantidad</th>
        <th class="numeric" style="width:96px">Precio unitario</th>
        <th class="numeric" style="width:96px">Total</th>
      </tr>
    </thead>
    <tbody>
      {{#each lineas}}
      <tr>
        <td>{{numero}}</td>
        <td>
          <div class="producto-cell">
            <div class="producto-codigo-nombre">{{codigo}} — {{nombre}}</div>
            <div class="line-detail"><strong>Categoría:</strong> {{categoria}}</div>
            <div class="line-detail"><strong>Dimensiones:</strong> {{dimensiones}}</div>
            {{#if nimf15}}
            <div class="line-detail"><strong>Certificación:</strong> {{etiquetaNimf}}</div>
            {{/if}}
            <div class="line-detail"><strong>País(es):</strong> {{paises}}</div>
            {{#if comentario}}
            <div class="producto-comentario"><strong>Comentario:</strong> {{comentario}}</div>
            {{/if}}
          </div>
        </td>
        <td class="numeric">{{cantidad}}</td>
        <td class="numeric">{{precioUnitario}}</td>
        <td class="numeric">{{total}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <div class="total-label">Subtotal</div>
      <div class="total-value">{{subtotal}}</div>
    </div>
    <div class="total-row">
      <div class="total-label">IVA (19%)</div>
      <div class="total-value">{{iva}}</div>
    </div>
    <div class="total-row total-final">
      <div class="total-label">Total</div>
      <div class="total-value">{{total}}</div>
    </div>
  </div>

  {{#if observaciones}}
  <div class="observaciones">
    <h3>Observaciones</h3>
    <p>{{observaciones}}</p>
  </div>
  {{/if}}

  <div class="footer">
    <p>{{footer.linea1}}</p>
    <p>{{footer.linea2}}</p>
  </div>
</body>
</html>
    `
  }
}
