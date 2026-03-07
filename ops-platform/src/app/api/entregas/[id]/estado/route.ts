import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { entregaEstadoSchema } from '@/lib/validations/entrega'
import { z } from 'zod'

/**
 * PATCH /api/entregas/[id]/estado
 * Cambiar estado de entrega
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
    const { estado } = entregaEstadoSchema.parse(body)

    // Verificar que la entrega exista
    const entrega = await prisma.entrega.findUnique({
      where: { id },
    })

    if (!entrega) {
      return NextResponse.json(
        { success: false, error: 'Entrega no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar estado
    const entregaActualizada = await prisma.entrega.update({
      where: { id },
      data: { estado },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: entregaActualizada.id,
        estado: entregaActualizada.estado,
        message: 'Estado de entrega actualizado correctamente',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error al actualizar estado de entrega:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar estado de entrega' },
      { status: 500 }
    )
  }
}

