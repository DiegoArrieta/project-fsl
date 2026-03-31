import Handlebars from 'handlebars'
import { prisma } from '@/lib/db'
import { getDocumentoPdfBaseStyles, getPdfFooterText } from '@/lib/pdf/documento-pdf-styles'
import { renderHtmlToPdfBuffer } from '@/lib/pdf/render-html-to-pdf-buffer'

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
            tipoPallet: true,
          },
        },
      },
    })

    if (!presupuesto) {
      throw new Error('Presupuesto no encontrado')
    }

    const templateData = {
      styles: getDocumentoPdfBaseStyles(),
      footer: getPdfFooterText(),
      numero: presupuesto.numero,
      fecha: presupuesto.fecha.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
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
      lineas: presupuesto.lineas.map((linea, index) => ({
        numero: index + 1,
        tipoPallet: linea.tipoPallet.nombre,
        cantidad: linea.cantidad,
        precioUnitario: linea.precioUnitario.toNumber().toLocaleString('es-CL', {
          style: 'currency',
          currency: 'CLP',
        }),
        total: linea.precioUnitario.mul(linea.cantidad).toNumber().toLocaleString('es-CL', {
          style: 'currency',
          currency: 'CLP',
        }),
        descripcion: linea.descripcion || '',
      })),
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
    <div class="logo">🌲 Forestal Santa Lucía SpA</div>
    <div class="header-info">
      <h1>Presupuesto</h1>
      <div><strong>N°:</strong> {{numero}}</div>
      <div><strong>Fecha:</strong> {{fecha}}</div>
    </div>
  </div>

  <div class="counterparty-section">
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
        <th>#</th>
        <th>Tipo de pallet</th>
        <th class="numeric">Cantidad</th>
        <th class="numeric">Precio unitario</th>
        <th class="numeric">Total</th>
        <th>Descripción</th>
      </tr>
    </thead>
    <tbody>
      {{#each lineas}}
      <tr>
        <td>{{numero}}</td>
        <td>{{tipoPallet}}</td>
        <td class="numeric">{{cantidad}}</td>
        <td class="numeric">{{precioUnitario}}</td>
        <td class="numeric">{{total}}</td>
        <td>{{descripcion}}</td>
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
