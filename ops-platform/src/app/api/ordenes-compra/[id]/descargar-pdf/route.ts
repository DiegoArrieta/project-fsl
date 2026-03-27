import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generarPDFOrdenCompra } from '@/lib/ordenes-compra/pdf'

/**
 * GET /api/ordenes-compra/[id]/descargar-pdf
 * Descarga el PDF de una orden de compra
 */
export async function GET(
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

    // Verificar que tiene al menos una línea de producto
    if (ordenCompra.lineas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'La orden no tiene productos' },
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

    // Convertir blob a buffer
    const buffer = Buffer.from(await pdfBlob.arrayBuffer())

    // Retornar PDF como descarga
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${ordenCompra.numero}.pdf"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error al descargar PDF:', error)
    return NextResponse.json(
      { success: false, error: 'Error al descargar PDF de orden de compra' },
      { status: 500 }
    )
  }
}





