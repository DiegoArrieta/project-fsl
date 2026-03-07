import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { eventoEstadoSchema } from '@/lib/validations/evento'
import { z } from 'zod'

/**
 * PATCH /api/eventos/[id]/estado
 * Cambiar estado de evento
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
    const { estado } = eventoEstadoSchema.parse(body)

    // Verificar que el evento exista
    const evento = await prisma.evento.findUnique({
      where: { id },
    })

    if (!evento) {
      return NextResponse.json(
        { success: false, error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar estado
    const eventoActualizado = await prisma.evento.update({
      where: { id },
      data: { estado },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: eventoActualizado.id,
        numero: eventoActualizado.numero,
        estado: eventoActualizado.estado,
        message: 'Estado de evento actualizado correctamente',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error al actualizar estado de evento:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar estado de evento' },
      { status: 500 }
    )
  }
}

