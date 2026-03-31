import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { entregaSchema } from '@/lib/validations/entrega'
import { z } from 'zod'

/**
 * GET /api/entregas/[id]
 * Obtener entrega por ID
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

    const entrega = await prisma.entrega.findUnique({
      where: { id },
      include: {
        evento: {
          select: {
            id: true,
            numero: true,
            tipo: true,
            fechaInicio: true,
            estado: true,
          },
        },
      },
    })

    if (!entrega) {
      return NextResponse.json(
        { success: false, error: 'Entrega no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: entrega.id,
        evento: entrega.evento,
        origenRazonSocial: entrega.origenRazonSocial,
        origenRut: entrega.origenRut,
        receptorRazonSocial: entrega.receptorRazonSocial,
        receptorRut: entrega.receptorRut,
        fechaHora: entrega.fechaHora,
        tipoEntrega: entrega.tipoEntrega,
        descripcion: entrega.descripcion,
        cantidad: entrega.cantidad,
        unidad: entrega.unidad,
        estado: entrega.estado,
        observaciones: entrega.observaciones,
        createdAt: entrega.createdAt,
        updatedAt: entrega.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error al obtener entrega:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener entrega' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/entregas/[id]
 * Actualizar entrega
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
    const validatedData = entregaSchema.parse(body)

    const existingEntrega = await prisma.entrega.findUnique({
      where: { id },
    })

    if (!existingEntrega) {
      return NextResponse.json(
        { success: false, error: 'Entrega no encontrada' },
        { status: 404 }
      )
    }

    if (validatedData.eventoId !== existingEntrega.eventoId) {
      const evento = await prisma.evento.findUnique({
        where: { id: validatedData.eventoId },
      })

      if (!evento) {
        return NextResponse.json(
          { success: false, error: 'Evento no encontrado' },
          { status: 404 }
        )
      }
    }

    const entrega = await prisma.entrega.update({
      where: { id },
      data: {
        eventoId: validatedData.eventoId,
        origenRazonSocial: validatedData.origenRazonSocial.trim(),
        origenRut: validatedData.origenRut.trim(),
        receptorRazonSocial: validatedData.receptorRazonSocial?.trim() || null,
        receptorRut: validatedData.receptorRut?.trim() || null,
        fechaHora: validatedData.fechaHora,
        tipoEntrega: validatedData.tipoEntrega,
        descripcion: validatedData.descripcion ?? null,
        cantidad: validatedData.cantidad,
        unidad: validatedData.unidad,
        estado: validatedData.estado,
        observaciones: validatedData.observaciones ?? null,
      },
      include: {
        evento: {
          select: {
            id: true,
            numero: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: entrega.id,
        evento: entrega.evento,
        origenRazonSocial: entrega.origenRazonSocial,
        origenRut: entrega.origenRut,
        message: 'Entrega actualizada correctamente',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error al actualizar entrega:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar entrega' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/entregas/[id]
 * Eliminar entrega
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

    const entrega = await prisma.entrega.findUnique({
      where: { id },
    })

    if (!entrega) {
      return NextResponse.json(
        { success: false, error: 'Entrega no encontrada' },
        { status: 404 }
      )
    }

    await prisma.entrega.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Entrega eliminada correctamente',
    })
  } catch (error) {
    console.error('Error al eliminar entrega:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar entrega' },
      { status: 500 }
    )
  }
}
