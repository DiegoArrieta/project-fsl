import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/eventos/[id]/entregas
 * Listar entregas de un evento
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
    })

    if (!evento) {
      return NextResponse.json(
        { success: false, error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    const entregas = await prisma.entrega.findMany({
      where: {
        eventoId: id,
      },
      orderBy: { fechaHora: 'desc' },
    })

    const data = entregas.map((entrega) => ({
      id: entrega.id,
      eventoId: entrega.eventoId,
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
    }))

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Error al listar entregas del evento:', error)
    return NextResponse.json(
      { success: false, error: 'Error al listar entregas del evento' },
      { status: 500 }
    )
  }
}
