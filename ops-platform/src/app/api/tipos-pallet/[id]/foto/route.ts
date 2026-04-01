import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getStorageProvider, MockStorageProvider } from '@/lib/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function contentDispositionAttachment(filename: string): string {
  const safe = filename.replace(/["\\\r\n]/g, '_').slice(0, 200) || 'pallet'
  return `attachment; filename="${safe}"`
}

function defaultDownloadName(
  fotoNombre: string | null,
  codigo: string,
  contentType: string | null
): string {
  if (fotoNombre?.trim()) return fotoNombre.trim()
  const ext = contentType?.toLowerCase().includes('png') ? 'png' : 'jpg'
  const c = codigo.replace(/[^a-zA-Z0-9_-]/g, '_') || 'pallet'
  return `pallet-${c}.${ext}`
}

/**
 * GET /api/tipos-pallet/:id/foto
 * Imagen inline (visor) o descarga con ?download=1.
 * Mock: cuerpo binario; S3: redirección a URL pública o firmada.
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

    const row = await prisma.tipoPallet.findUnique({
      where: { id },
      select: {
        fotoKey: true,
        fotoNombre: true,
        fotoContentType: true,
        codigo: true,
      },
    })

    if (!row?.fotoKey?.trim()) {
      return NextResponse.json({ success: false, error: 'Sin foto' }, { status: 404 })
    }

    const storage = getStorageProvider()
    const displayName = defaultDownloadName(row.fotoNombre, row.codigo, row.fotoContentType)
    const contentType = row.fotoContentType?.trim() || 'image/jpeg'

    if (storage instanceof MockStorageProvider) {
      try {
        const buffer = storage.readDocumentBuffer(row.fotoKey)
        return new NextResponse(new Uint8Array(buffer), {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': download
              ? contentDispositionAttachment(displayName)
              : 'inline',
            'Cache-Control': 'private, no-store',
          },
        })
      } catch (e) {
        console.error('[tipos-pallet/foto] mock', e)
        return NextResponse.json(
          { success: false, error: 'No se pudo leer la imagen' },
          { status: 404 }
        )
      }
    }

    const remoteUrl = await storage.getDocumentUrl(row.fotoKey, 3600, {
      contentDisposition: download ? 'attachment' : 'inline',
      downloadFilename: download ? displayName : undefined,
    })

    return NextResponse.redirect(remoteUrl, 307)
  } catch (error) {
    console.error('Error al resolver foto de tipo pallet:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener la imagen' }, { status: 500 })
  }
}
