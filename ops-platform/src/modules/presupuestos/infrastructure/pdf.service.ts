import puppeteer from 'puppeteer'
import Handlebars from 'handlebars'
import { prisma } from '@/lib/db'

/**
 * Servicio para generar PDFs de presupuestos usando Puppeteer y Handlebars
 */
export class PDFService {
  private static getDocumentoPdfStyles(): string {
    return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', sans-serif;
      font-size: 12px;
      color: #333;
      line-height: 1.6;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #2d5016;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #2d5016;
    }
    .header-info {
      text-align: right;
    }
    .header-info h1 {
      font-size: 20px;
      color: #2d5016;
      margin-bottom: 5px;
    }
    .presupuesto-info {
      margin-bottom: 30px;
    }
    .info-row {
      display: flex;
      margin-bottom: 8px;
    }
    .info-label {
      font-weight: bold;
      width: 120px;
    }
    .cliente-section {
      margin-bottom: 30px;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 5px;
    }
    .cliente-section h2 {
      font-size: 14px;
      color: #2d5016;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background-color: #2d5016;
      color: white;
      padding: 10px;
      text-align: left;
      font-weight: bold;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #ddd;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .totals {
      margin-top: 20px;
      text-align: right;
    }
    .total-row {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 8px;
      padding: 5px 0;
    }
    .total-label {
      font-weight: bold;
      width: 150px;
      text-align: right;
      margin-right: 20px;
    }
    .total-value {
      width: 150px;
      text-align: right;
      font-weight: bold;
    }
    .total-final {
      font-size: 16px;
      color: #2d5016;
      border-top: 2px solid #2d5016;
      padding-top: 10px;
      margin-top: 10px;
    }
    .observaciones {
      margin-top: 30px;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 5px;
    }
    .observaciones h3 {
      font-size: 14px;
      color: #2d5016;
      margin-bottom: 10px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 10px;
      color: #666;
    }
`
  }
  /**
   * Genera un PDF del presupuesto
   */
  static async generatePresupuestoPDF(presupuestoId: string): Promise<Buffer> {
    // Obtener presupuesto con relaciones
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

    // Preparar datos para la plantilla
    const templateData = {
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

    // Compilar plantilla HTML
    const htmlTemplate = this.getHTMLTemplate()
    const template = Handlebars.compile(htmlTemplate)
    const html = template(templateData)

    // Generar PDF con Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    try {
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      })

      return Buffer.from(pdf)
    } finally {
      await browser.close()
    }
  }

  /**
   * Plantilla HTML para el presupuesto
   */
  private static getHTMLTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presupuesto {{numero}}</title>
  <style>${this.getDocumentoPdfStyles()}</style>
</head>
<body>
  <div class="header">
    <div class="logo">🌲 Forestal Santa Lucía SpA</div>
    <div class="header-info">
      <h1>PRESUPUESTO</h1>
      <div><strong>N°:</strong> {{numero}}</div>
      <div><strong>Fecha:</strong> {{fecha}}</div>
    </div>
  </div>

  <div class="cliente-section">
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
      <div class="info-label">Dirección de Entrega:</div>
      <div>{{direccion}}</div>
    </div>
    {{#if ciudad}}
    <div class="info-row">
      <div class="info-label">Ciudad:</div>
      <div>{{ciudad}}</div>
    </div>
    {{/if}}
  </div>
  {{/if}}

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Tipo de Pallet</th>
        <th>Cantidad</th>
        <th>Precio Unitario</th>
        <th>Total</th>
        <th>Descripción</th>
      </tr>
    </thead>
    <tbody>
      {{#each lineas}}
      <tr>
        <td>{{numero}}</td>
        <td>{{tipoPallet}}</td>
        <td>{{cantidad}}</td>
        <td>{{precioUnitario}}</td>
        <td>{{total}}</td>
        <td>{{descripcion}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <div class="total-label">Subtotal:</div>
      <div class="total-value">{{subtotal}}</div>
    </div>
    <div class="total-row">
      <div class="total-label">IVA (19%):</div>
      <div class="total-value">{{iva}}</div>
    </div>
    <div class="total-row total-final">
      <div class="total-label">TOTAL:</div>
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
    <p>Forestal Santa Lucía SpA - Sistema de Gestión Operativa</p>
    <p>Este documento fue generado automáticamente</p>
  </div>
</body>
</html>
    `
  }
}

