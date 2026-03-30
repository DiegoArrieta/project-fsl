import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/categorias-pallet — catálogo para selects (activas)
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const rows = await prisma.categoriaPallet.findMany({
      where: { activo: true },
      orderBy: { codigo: 'asc' },
    })

    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error('Error al listar categorías pallet:', error)
    return NextResponse.json(
      { success: false, error: 'Error al listar categorías' },
      { status: 500 }
    )
  }
}
