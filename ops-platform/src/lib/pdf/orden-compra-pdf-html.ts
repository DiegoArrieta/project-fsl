import Handlebars from 'handlebars'
import type { DatosOrdenCompraPdf } from '@/lib/ordenes-compra/pdf-types'
import { getEmpresaPdfLogoDataUrl } from './empresa-logo-data-url'
import { getDocumentoPdfBaseStyles, getPdfFooterText } from './documento-pdf-styles'

function formatearRut(rut: string): string {
  if (!rut) return ''
  if (rut.includes('.')) return rut
  const partes = rut.split('-')
  if (partes.length !== 2) return rut
  const numeroFormateado = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${numeroFormateado}-${partes[1]}`
}

function formatearMoneda(monto: number): string {
  return `$${monto.toLocaleString('es-CL')}`
}

function fechaLarga(fecha: Date): string {
  return fecha.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const ORDEN_COMPRA_TEMPLATE = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{tituloDocumento}} {{numero}}</title>
  <style>{{{styles}}}</style>
</head>
<body>
  <div class="cabecera-doc">
    <div class="header">
      <div class="header-brand">
        {{#if logoDataUrl}}
        <img src="{{{logoDataUrl}}}" alt="Forestal Santa Lucía SpA" class="logo-img" />
        {{else}}
        <div class="logo logo--text">🌲 Forestal Santa Lucía SpA</div>
        {{/if}}
      </div>
      <div class="header-info">
        <h1>{{tituloDocumento}}</h1>
        <div><strong>N°:</strong> {{numero}}</div>
        <div><strong>Fecha:</strong> {{fecha}}</div>
        {{#if fechaEntrega}}
        <div><strong>Fecha entrega:</strong> {{fechaEntrega}}</div>
        {{/if}}
      </div>
    </div>
    <div class="empresa-emisor">
      <div><strong>{{empresa.razonSocial}}</strong></div>
      <div>RUT: {{empresa.rut}}</div>
      {{#if empresa.direccion}}<div>{{empresa.direccion}}</div>{{/if}}
      {{#if empresa.telefono}}<div>Tel: {{empresa.telefono}}</div>{{/if}}
      {{#if empresa.email}}<div>Email: {{empresa.email}}</div>{{/if}}
    </div>
  </div>

  <div class="counterparty-section">
    <h2>Proveedor</h2>
    <div><strong>{{proveedor.razonSocial}}</strong></div>
    <div>RUT: {{proveedor.rut}}</div>
    {{#if proveedor.direccion}}<div>{{proveedor.direccion}}</div>{{/if}}
    {{#if proveedor.telefono}}<div>Tel: {{proveedor.telefono}}</div>{{/if}}
    {{#if proveedor.email}}<div>Email: {{proveedor.email}}</div>{{/if}}
  </div>

  {{#if direccionEntrega}}
  <div class="presupuesto-info">
    <div class="info-row">
      <div class="info-label">Dirección de entrega</div>
      <div>{{direccionEntrega}}</div>
    </div>
  </div>
  {{/if}}

  <table>
    <thead>
      <tr>
        <th style="width:32px">#</th>
        <th style="width:72px">Código</th>
        <th>Producto</th>
        <th class="numeric" style="width:56px">Cant.</th>
        <th class="numeric" style="width:88px">P. unit.</th>
        <th class="numeric" style="width:88px">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      {{#each productos}}
      <tr>
        <td>{{numero}}</td>
        <td>{{codigo}}</td>
        <td>
          <strong>{{nombre}}</strong>
          {{#if descripcion}}<span class="line-detail">{{descripcion}}</span>{{/if}}
        </td>
        <td class="numeric">{{cantidad}}</td>
        <td class="numeric">{{precioUnitario}}</td>
        <td class="numeric">{{subtotal}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  {{#if muestraTotales}}
  <div class="totals">
    <div class="total-row total-final">
      <div class="total-label">TOTAL</div>
      <div class="total-value">{{total}}</div>
    </div>
  </div>
  {{/if}}

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
</html>`

export function buildOrdenCompraPdfHtml(datos: DatosOrdenCompraPdf): string {
  const tienePrecios = datos.productos.some((p) => p.precioUnitario !== undefined)
  let totalNum = 0
  const productos = datos.productos.map((p, i) => {
    const pu = p.precioUnitario ?? 0
    const sub = pu * p.cantidad
    if (p.precioUnitario !== undefined) totalNum += sub
    return {
      numero: i + 1,
      codigo: p.tipoPallet.codigo,
      nombre: p.tipoPallet.nombre,
      descripcion: (p.descripcion ?? '').trim(),
      cantidad: p.cantidad,
      precioUnitario: p.precioUnitario !== undefined ? formatearMoneda(p.precioUnitario) : '—',
      subtotal: p.precioUnitario !== undefined ? formatearMoneda(sub) : '—',
    }
  })

  const compile = Handlebars.compile(ORDEN_COMPRA_TEMPLATE)
  const footer = getPdfFooterText()
  const logoDataUrl = getEmpresaPdfLogoDataUrl()

  return compile({
    styles: getDocumentoPdfBaseStyles(),
    logoDataUrl,
    tituloDocumento: 'Orden de compra',
    numero: datos.numero,
    fecha: fechaLarga(datos.fecha),
    fechaEntrega: datos.fechaEntrega ? fechaLarga(datos.fechaEntrega) : null,
    empresa: {
      razonSocial: datos.empresa.razonSocial,
      rut: formatearRut(datos.empresa.rut),
      direccion: datos.empresa.direccion || '',
      telefono: datos.empresa.telefono || '',
      email: datos.empresa.email || '',
    },
    proveedor: {
      razonSocial: datos.proveedor.razonSocial,
      rut: formatearRut(datos.proveedor.rut),
      direccion: datos.proveedor.direccion || '',
      telefono: datos.proveedor.telefono || '',
      email: datos.proveedor.email || '',
    },
    direccionEntrega: datos.direccionEntrega?.trim() || '',
    observaciones: datos.observaciones?.trim() || '',
    productos,
    muestraTotales: tienePrecios,
    total: formatearMoneda(totalNum),
    footer,
  })
}
