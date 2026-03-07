import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { empresaEstadoSchema } from '@/lib/validations/empresa'
import { z } from 'zod'

/**
 * PATCH /api/empresas/[id]/activar
 * Activar/desactivar empresa
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { estado } = empresaEstadoSchema.parse(body)

    // Verificar que la empresa exista
    const empresa = await prisma.empresa.findUnique({
      where: { id },
    })

    if (!empresa) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar estado
    const empresaActualizada = await prisma.empresa.update({
      where: { id },
      data: { estado },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: empresaActualizada.id,
        nombre: empresaActualizada.nombre,
        estado: empresaActualizada.estado,
        message: `Empresa ${estado === 'ACTIVA' ? 'activada' : 'desactivada'} correctamente`,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error al actualizar estado de empresa:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar estado de empresa' },
      { status: 500 }
    )
  }
}

