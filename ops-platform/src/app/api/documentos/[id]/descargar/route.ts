import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getStorageProvider } from '@/lib/storage'

/**
 * GET /api/documentos/[id]/descargar
 * Descarga un documento (archivo subido)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Obtener documento
    const documento = await prisma.documento.findUnique({
      where: { id },
      include: {
        operacion: {
          select: {
            numero: true,
          },
        },
      },
    })

    if (!documento) {
      return NextResponse.json(
        { success: false, error: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    // Obtener storage provider
    const storage = getStorageProvider()

    try {
      // Obtener URL del documento (en mocks, será una URL local; en S3, será signed URL)
      const url = await storage.getDocumentUrl(documento.archivoUrl)

      // Para mocks, podríamos retornar la URL directamente
      // Para S3, retornaríamos una signed URL

      // Por ahora, en desarrollo con mocks, retornamos un redirect a la URL
      // En producción con S3, esto funcionará con signed URLs

      return NextResponse.json({
        success: true,
        data: {
          id: documento.id,
          tipo: documento.tipo,
          nombre: documento.archivoNombre,
          url,
          operacion: documento.operacion.numero,
          downloadUrl: url,
        },
        message: 'Use el campo "downloadUrl" para descargar el archivo',
      })
    } catch (error) {
      console.error('Error al obtener URL del documento:', error)

      // Si falla obtener del storage, retornamos la info que tenemos
      return NextResponse.json({
        success: true,
        data: {
          id: documento.id,
          tipo: documento.tipo,
          nombre: documento.archivoNombre,
          size: Number(documento.archivoSize),
          contentType: documento.archivoTipo,
          operacion: documento.operacion.numero,
          uploadedAt: documento.uploadedAt,
        },
        message:
          'Archivo en storage mock. En producción con S3, aquí se generaría una signed URL.',
      })
    }
  } catch (error) {
    console.error('Error al descargar documento:', error)
    return NextResponse.json(
      { success: false, error: 'Error al descargar documento' },
      { status: 500 }
    )
  }
}




