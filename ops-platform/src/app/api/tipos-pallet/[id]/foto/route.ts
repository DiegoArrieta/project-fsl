import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getStorageProvider } from '@/lib/storage'

/**
 * GET /api/tipos-pallet/:id/foto
 * Redirección a URL firmada (S3) o URL mock para mostrar la imagen en <img src="...">
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
    const row = await prisma.tipoPallet.findUnique({
      where: { id },
      select: { fotoKey: true },
    })

    if (!row?.fotoKey) {
      return NextResponse.json({ success: false, error: 'Sin foto' }, { status: 404 })
    }

    const storage = getStorageProvider()
    const url = await storage.getDocumentUrl(row.fotoKey)

    return NextResponse.redirect(url)
  } catch (error) {
    console.error('Error al resolver foto de tipo pallet:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener la imagen' }, { status: 500 })
  }
}
