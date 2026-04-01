import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getStorageProvider, MockStorageProvider } from '@/lib/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/documentos/[id]/signed-url?disposition=inline|attachment
 * Devuelve JSON `{ data: { url } }`: presign S3 o ruta a `/archivo` (mock).
 * El modal y la descarga obtienen la URL tras auth, sin depender del redirect en el cliente.
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
    const disposition = request.nextUrl.searchParams.get('disposition')
    const download = disposition === 'attachment'

    const documento = await prisma.documento.findUnique({
      where: { id },
      select: {
        id: true,
        archivoUrl: true,
        archivoNombre: true,
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
      const path = `/api/documentos/${id}/archivo${download ? '?download=1' : ''}`
      return NextResponse.json({ success: true, data: { url: path } })
    }

    const url = await storage.getDocumentUrl(documento.archivoUrl, 3600, {
      contentDisposition: download ? 'attachment' : 'inline',
      downloadFilename: download ? documento.archivoNombre : undefined,
    })

    return NextResponse.json({ success: true, data: { url } })
  } catch (error) {
    console.error('[documentos/signed-url]', error)
    return NextResponse.json(
      { success: false, error: 'Error al generar el enlace del documento' },
      { status: 500 }
    )
  }
}
