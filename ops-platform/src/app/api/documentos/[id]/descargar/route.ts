import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * GET /api/documentos/[id]/descargar
 * Mantiene compatibilidad: redirige a GET /api/documentos/[id]/archivo?download=1.
 * La vista previa y la descarga comparten esa ruta; el presign (o mock) se resuelve allí en cada petición.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const dest = new URL(request.url)
  dest.pathname = `/api/documentos/${id}/archivo`
  dest.search = ''
  dest.searchParams.set('download', '1')
  return NextResponse.redirect(dest, 307)
}
