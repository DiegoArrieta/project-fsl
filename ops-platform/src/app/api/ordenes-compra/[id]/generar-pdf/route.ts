import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generarPDFOrdenCompra, guardarPDF } from '@/lib/ordenes-compra/pdf'

/**
 * POST /api/ordenes-compra/[id]/generar-pdf
 * Genera el PDF de una orden de compra y actualiza su estado a ENVIADA
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Obtener orden de compra con todos los datos necesarios
    const ordenCompra = await prisma.ordenCompra.findUnique({
      where: { id },
      include: {
        proveedor: true,
        lineas: {
          include: {
            tipoPallet: true,
          },
        },
      },
    })

    if (!ordenCompra) {
      return NextResponse.json(
        { success: false, error: 'Orden de compra no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que está en BORRADOR
    if (ordenCompra.estado !== 'BORRADOR') {
      return NextResponse.json(
        { success: false, error: 'Solo se puede generar PDF de órdenes en BORRADOR' },
        { status: 400 }
      )
    }

    // Verificar que tiene al menos una línea de producto
    if (ordenCompra.lineas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'La orden debe tener al menos un producto' },
        { status: 400 }
      )
    }

    // Datos de la empresa (FSL)
    const datosEmpresa = {
      razonSocial: 'Forestal Santa Lucía SpA',
      rut: '77442030-4',
      direccion: 'Puerto Montt, Chile',
      telefono: '+56 9 1234 5678',
      email: 'contacto@forestalsantalucia.cl',
    }

    // Preparar datos para el PDF
    const datosPDF = {
      numero: ordenCompra.numero,
      fecha: ordenCompra.fecha,
      fechaEntrega: ordenCompra.fechaEntrega || undefined,
      direccionEntrega: ordenCompra.direccionEntrega || undefined,
      observaciones: ordenCompra.observaciones || undefined,
      empresa: datosEmpresa,
      proveedor: {
        razonSocial: ordenCompra.proveedor.razonSocial,
        rut: ordenCompra.proveedor.rut,
        direccion: ordenCompra.proveedor.direccion || undefined,
        telefono: ordenCompra.proveedor.telefono || undefined,
        email: ordenCompra.proveedor.email || undefined,
      },
      productos: ordenCompra.lineas.map((linea) => ({
        tipoPallet: {
          codigo: linea.tipoPallet.codigo,
          nombre: linea.tipoPallet.nombre,
        },
        cantidad: linea.cantidad,
        precioUnitario: linea.precioUnitario ? Number(linea.precioUnitario) : undefined,
        descripcion: linea.descripcion || undefined,
      })),
    }

    // Generar PDF
    const pdfBlob = generarPDFOrdenCompra(datosPDF)

    // Guardar PDF (en producción, subirías a storage)
    const pdfUrl = await guardarPDF(pdfBlob, ordenCompra.numero)

    // Actualizar orden: marcar PDF como generado y cambiar estado a ENVIADA
    const ordenActualizada = await prisma.ordenCompra.update({
      where: { id },
      data: {
        pdfGenerado: true,
        pdfUrl,
        estado: 'ENVIADA',
      },
      include: {
        proveedor: true,
        operacion: true,
        lineas: {
          include: {
            tipoPallet: true,
          },
        },
      },
    })

    // Convertir blob a base64 para enviar en respuesta
    const buffer = await pdfBlob.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    return NextResponse.json({
      success: true,
      data: ordenActualizada,
      pdf: {
        url: pdfUrl,
        base64: `data:application/pdf;base64,${base64}`,
      },
      message: 'PDF generado correctamente',
    })
  } catch (error) {
    console.error('Error al generar PDF:', error)
    return NextResponse.json(
      { success: false, error: 'Error al generar PDF de orden de compra' },
      { status: 500 }
    )
  }
}





