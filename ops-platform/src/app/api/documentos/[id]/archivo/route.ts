import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getStorageProvider, MockStorageProvider } from '@/lib/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function contentDispositionAttachment(filename: string): string {
  const safe = filename.replace(/["\\\r\n]/g, '_').slice(0, 200) || 'documento'
  return `attachment; filename="${safe}"`
}

/**
 * GET /api/documentos/[id]/archivo
 * Redirige a URL firmada (S3) o sirve el binario (mock) para visualizar/descargar.
 * ?download=1 fuerza descarga cuando el storage lo permite.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const download = request.nextUrl.searchParams.get('download') === '1'

    const documento = await prisma.documento.findUnique({
      where: { id },
      select: {
        id: true,
        archivoUrl: true,
        archivoNombre: true,
        archivoTipo: true,
      },
    })

    if (!documento?.archivoUrl?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Documento sin archivo' },
        { status: 404 }
      )
    }

    const storage = getStorageProvider()

    if (storage instanceof MockStorageProvider) {
      try {
        const buffer = storage.readDocumentBuffer(documento.archivoUrl)
        return new NextResponse(new Uint8Array(buffer), {
          status: 200,
          headers: {
            'Content-Type': documento.archivoTipo || 'application/octet-stream',
            'Content-Disposition': download
              ? contentDispositionAttachment(documento.archivoNombre)
              : 'inline',
            'Cache-Control': 'private, no-store',
          },
        })
      } catch (e) {
        console.error('[documentos/archivo] mock read', e)
        return NextResponse.json(
          { success: false, error: 'No se pudo leer el archivo (mock o sesión reiniciada)' },
          { status: 404 }
        )
      }
    }

    const remoteUrl = await storage.getDocumentUrl(documento.archivoUrl, 3600, {
      contentDisposition: download ? 'attachment' : 'inline',
      downloadFilename: download ? documento.archivoNombre : undefined,
    })

    return NextResponse.redirect(remoteUrl, 307)
  } catch (error) {
    console.error('Error al servir archivo de documento:', error)
    return NextResponse.json(
      { success: false, error: 'Error al servir el archivo' },
      { status: 500 }
    )
  }
}
