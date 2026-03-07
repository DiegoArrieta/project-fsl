import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/operaciones/[id]/evento
 * Obtener evento asociado a una operación
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

    // Verificar que la operación exista
    const operacion = await prisma.operacion.findUnique({
      where: { id },
      select: {
        id: true,
        numero: true,
        eventoId: true,
      },
    })

    if (!operacion) {
      return NextResponse.json(
        { success: false, error: 'Operación no encontrada' },
        { status: 404 }
      )
    }

    if (!operacion.eventoId) {
      return NextResponse.json(
        { success: false, error: 'La operación no tiene un evento asociado' },
        { status: 404 }
      )
    }

    // Obtener evento con entregas
    const evento = await prisma.evento.findUnique({
      where: { id: operacion.eventoId },
      include: {
        entregas: {
          include: {
            empresa: {
              select: {
                id: true,
                nombre: true,
                tipoEmpresa: true,
              },
            },
            empresaReceptora: {
              select: {
                id: true,
                nombre: true,
                tipoEmpresa: true,
              },
            },
          },
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
        totalEntregas: evento._count.entregas,
        entregas: evento.entregas,
        createdAt: evento.createdAt,
        updatedAt: evento.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error al obtener evento de operación:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener evento de operación' },
      { status: 500 }
    )
  }
}

