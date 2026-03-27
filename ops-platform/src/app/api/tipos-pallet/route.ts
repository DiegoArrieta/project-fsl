import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/tipos-pallet
 * Lista todos los tipos de pallet activos
 */
export async function GET() {
  try {
    const tiposPallet = await prisma.tipoPallet.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        codigo: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: tiposPallet,
    })
  } catch (error) {
    console.error('Error al listar tipos de pallet:', error)
    return NextResponse.json(
      { success: false, error: 'Error al listar tipos de pallet' },
      { status: 500 }
    )
  }
}





