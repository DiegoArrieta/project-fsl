import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { eventoSchema } from '@/lib/validations/evento'
import { z } from 'zod'

/**
 * GET /api/eventos/[id]
 * Obtener evento por ID con entregas
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

    const evento = await prisma.evento.findUnique({
      where: { id },
      include: {
        operacion: {
          select: {
            id: true,
            numero: true,
            tipo: true,
            fecha: true,
          },
        },
        entregas: {
          orderBy: { fechaHora: 'desc' },
        },
        _count: {
          select: {
            entregas: true,
          },
        },
      },
    })

    if (!evento) {
      return NextResponse.json(
        { success: false, error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: evento.id,
        numero: evento.numero,
        tipo: evento.tipo,
        fechaInicio: evento.fechaInicio,
        fechaFin: evento.fechaFin,
        ubicacion: evento.ubicacion,
        descripcion: evento.descripcion,
        estado: evento.estado,
        operacion: evento.operacion,
        totalEntregas: evento._count.entregas,
        entregas: evento.entregas,
        createdAt: evento.createdAt,
        updatedAt: evento.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error al obtener evento:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener evento' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/eventos/[id]
 * Actualizar evento (solo si no está COMPLETADO)
 */
export async function PUT(
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
    const validatedData = eventoSchema.parse(body)

    // Verificar que el evento exista
    const existingEvento = await prisma.evento.findUnique({
      where: { id },
    })

    if (!existingEvento) {
      return NextResponse.json(
        { success: false, error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    // No permitir editar si está COMPLETADO
    if (existingEvento.estado === 'COMPLETADO') {
      return NextResponse.json(
        { success: false, error: 'No se puede editar un evento completado' },
        { status: 400 }
      )
    }

    // No permitir cambiar el número
    const { numero, ...dataToUpdate } = validatedData

    // Actualizar evento
    const evento = await prisma.evento.update({
      where: { id },
      data: dataToUpdate,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: evento.id,
        numero: evento.numero,
        tipo: evento.tipo,
        message: 'Evento actualizado correctamente',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error al actualizar evento:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar evento' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/eventos/[id]
 * Eliminar evento (solo si no tiene entregas)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Verificar que el evento exista
    const evento = await prisma.evento.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            entregas: true,
          },
        },
      },
    })

    if (!evento) {
      return NextResponse.json(
        { success: false, error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    // No permitir eliminar si tiene entregas
    if (evento._count.entregas > 0) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar un evento que tiene entregas asociadas' },
        { status: 400 }
      )
    }

    // Eliminar evento
    await prisma.evento.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Evento eliminado correctamente',
    })
  } catch (error) {
    console.error('Error al eliminar evento:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar evento' },
      { status: 500 }
    )
  }
}

