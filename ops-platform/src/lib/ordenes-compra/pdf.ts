/**
 * Generación de PDF para Órdenes de Compra
 * Utiliza jsPDF para crear documentos profesionales
 */

import { jsPDF } from 'jspdf'

interface DatosEmpresa {
  razonSocial: string
  rut: string
  direccion: string
  telefono?: string
  email?: string
}

interface DatosProveedor {
  razonSocial: string
  rut: string
  direccion?: string
  telefono?: string
  email?: string
}

interface LineaProducto {
  tipoPallet: {
    codigo: string
    nombre: string
  }
  cantidad: number
  precioUnitario?: number
  descripcion?: string
}

interface DatosOrdenCompra {
  numero: string
  fecha: Date
  fechaEntrega?: Date
  direccionEntrega?: string
  observaciones?: string
  empresa: DatosEmpresa
  proveedor: DatosProveedor
  productos: LineaProducto[]
}

/**
 * Formatea un RUT para mostrar con puntos
 */
function formatearRut(rut: string): string {
  if (!rut) return ''
  
  // Si ya tiene formato (con puntos), retornar tal cual
  if (rut.includes('.')) return rut
  
  // Separar número y dígito verificador
  const partes = rut.split('-')
  if (partes.length !== 2) return rut
  
  const numero = partes[0]
  const dv = partes[1]
  
  // Agregar puntos
  const numeroFormateado = numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  
  return `${numeroFormateado}-${dv}`
}

/**
 * Formatea una fecha a formato DD/MM/YYYY
 */
function formatearFecha(fecha: Date): string {
  const dia = fecha.getDate().toString().padStart(2, '0')
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0')
  const anio = fecha.getFullYear()
  return `${dia}/${mes}/${anio}`
}

/**
 * Formatea un número como moneda chilena
 */
function formatearMoneda(monto: number): string {
  return `$${monto.toLocaleString('es-CL')}`
}

/**
 * Genera un PDF de orden de compra
 */
export function generarPDFOrdenCompra(datos: DatosOrdenCompra): Blob {
  const doc = new jsPDF()
  
  // Configuración de fuente
  doc.setFont('helvetica')
  
  // Encabezado - Logo y datos de la empresa
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(datos.empresa.razonSocial, 20, 20)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`RUT: ${formatearRut(datos.empresa.rut)}`, 20, 28)
  doc.text(datos.empresa.direccion, 20, 34)
  if (datos.empresa.telefono) doc.text(`Tel: ${datos.empresa.telefono}`, 20, 40)
  if (datos.empresa.email) doc.text(`Email: ${datos.empresa.email}`, 20, 46)
  
  // Título del documento
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('ORDEN DE COMPRA', 105, 60, { align: 'center' })
  
  // Número y fecha
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`N°: ${datos.numero}`, 150, 70)
  doc.setFont('helvetica', 'normal')
  doc.text(`Fecha: ${formatearFecha(datos.fecha)}`, 150, 77)
  if (datos.fechaEntrega) {
    doc.text(`Fecha Entrega: ${formatearFecha(datos.fechaEntrega)}`, 150, 84)
  }
  
  // Datos del proveedor
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('PROVEEDOR:', 20, 80)
  doc.setFont('helvetica', 'normal')
  doc.text(datos.proveedor.razonSocial, 20, 87)
  doc.text(`RUT: ${formatearRut(datos.proveedor.rut)}`, 20, 94)
  if (datos.proveedor.direccion) doc.text(datos.proveedor.direccion, 20, 101)
  if (datos.proveedor.telefono) doc.text(`Tel: ${datos.proveedor.telefono}`, 20, 108)
  if (datos.proveedor.email) doc.text(`Email: ${datos.proveedor.email}`, 20, 115)
  
  // Dirección de entrega
  if (datos.direccionEntrega) {
    doc.setFont('helvetica', 'bold')
    doc.text('DIRECCIÓN DE ENTREGA:', 20, 128)
    doc.setFont('helvetica', 'normal')
    doc.text(datos.direccionEntrega, 20, 135)
  }
  
  // Tabla de productos
  const inicioTabla = datos.direccionEntrega ? 145 : 128
  
  // Encabezados de tabla
  doc.setFillColor(230, 230, 230)
  doc.rect(20, inicioTabla, 170, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('CÓDIGO', 22, inicioTabla + 5)
  doc.text('DESCRIPCIÓN', 55, inicioTabla + 5)
  doc.text('CANTIDAD', 120, inicioTabla + 5)
  doc.text('P. UNITARIO', 145, inicioTabla + 5)
  doc.text('SUBTOTAL', 175, inicioTabla + 5)
  
  // Líneas de productos
  doc.setFont('helvetica', 'normal')
  let yPos = inicioTabla + 13
  let totalGeneral = 0
  
  datos.productos.forEach((producto, index) => {
    // Verificar si necesitamos nueva página
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    
    const subtotal = (producto.precioUnitario || 0) * producto.cantidad
    totalGeneral += subtotal
    
    doc.text(producto.tipoPallet.codigo, 22, yPos)
    doc.text(producto.tipoPallet.nombre, 55, yPos)
    doc.text(producto.cantidad.toString(), 120, yPos)
    
    if (producto.precioUnitario !== undefined) {
      doc.text(formatearMoneda(producto.precioUnitario), 145, yPos)
      doc.text(formatearMoneda(subtotal), 175, yPos)
    } else {
      doc.text('-', 145, yPos)
      doc.text('-', 175, yPos)
    }
    
    if (producto.descripcion) {
      yPos += 5
      doc.setFontSize(8)
      doc.text(producto.descripcion, 55, yPos)
      doc.setFontSize(10)
    }
    
    yPos += 7
    
    // Línea separadora
    if (index < datos.productos.length - 1) {
      doc.setDrawColor(200, 200, 200)
      doc.line(20, yPos - 2, 190, yPos - 2)
    }
  })
  
  // Total general (solo si hay precios)
  if (datos.productos.some(p => p.precioUnitario !== undefined)) {
    yPos += 5
    doc.setDrawColor(0, 0, 0)
    doc.line(20, yPos, 190, yPos)
    yPos += 7
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('TOTAL:', 145, yPos)
    doc.text(formatearMoneda(totalGeneral), 175, yPos)
  }
  
  // Observaciones
  if (datos.observaciones) {
    yPos += 15
    
    // Verificar si necesitamos nueva página
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('OBSERVACIONES:', 20, yPos)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const lineasObservaciones = doc.splitTextToSize(datos.observaciones, 170)
    doc.text(lineasObservaciones, 20, yPos + 7)
  }
  
  // Footer
  const totalPaginas = doc.getNumberOfPages()
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Página ${i} de ${totalPaginas} - Orden de Compra ${datos.numero}`,
      105,
      285,
      { align: 'center' }
    )
  }
  
  // Generar blob
  return doc.output('blob')
}

/**
 * Guarda un PDF en el servidor (placeholder - implementar según infraestructura)
 */
export async function guardarPDF(_blob: Blob, numero: string): Promise<string> {
  // TODO: Implementar según infraestructura (S3, storage local, etc.)
  // Por ahora retornamos una URL mock
  
  // En producción, aquí subirías el blob a tu storage y retornarías la URL
  const url = `/uploads/ocs/${numero}.pdf`
  
  return url
}

