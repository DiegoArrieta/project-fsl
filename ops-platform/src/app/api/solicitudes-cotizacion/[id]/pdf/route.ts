import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PDFService } from '@/modules/presupuestos/infrastructure/pdf.service'

/**
 * GET /api/solicitudes-cotizacion/:id/pdf
 * Genera el PDF de la solicitud de cotización (misma matriz que presupuesto).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const pdfBuffer = await PDFService.generateSolicitudCotizacionPDF(id)

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="cotizacion-${id}.pdf"`,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al generar PDF'
    console.error('Error al generar PDF cotización:', error)
    if (message.includes('no encontrada')) {
      return NextResponse.json({ success: false, error: message }, { status: 404 })
    }
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
