import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { entregaSchema } from '@/lib/validations/entrega'
import { z } from 'zod'

/**
 * GET /api/entregas
 * Listar entregas con filtros (principalmente por evento)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const eventoId = searchParams.get('eventoId')
    const empresaId = searchParams.get('empresaId')
    const estado = searchParams.get('estado')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const skip = (page - 1) * pageSize

    // Construir filtros
    const where: any = {}

    if (eventoId) {
      where.eventoId = eventoId
    }

    if (empresaId) {
      where.OR = [
        { empresaId },
        { empresaReceptoraId: empresaId },
      ]
    }

    if (estado) {
      where.estado = estado
    }

    // Obtener total para paginación
    const total = await prisma.entrega.count({ where })

    // Obtener entregas
    const entregas = await prisma.entrega.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { fechaHora: 'desc' },
      include: {
        evento: {
          select: {
            id: true,
            numero: true,
            tipo: true,
          },
        },
        empresa: {
          select: {
            id: true,
            nombre: true,
            tipoEmpresa: true,
            rut: true,
          },
        },
        empresaReceptora: {
          select: {
            id: true,
            nombre: true,
            tipoEmpresa: true,
            rut: true,
          },
        },
      },
    })

    // Formatear respuesta
    const data = entregas.map((entrega) => ({
      id: entrega.id,
      evento: entrega.evento,
      empresa: entrega.empresa,
      empresaReceptora: entrega.empresaReceptora,
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
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Error al listar entregas:', error)
    return NextResponse.json(
      { success: false, error: 'Error al listar entregas' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/entregas
 * Crear nueva entrega
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = entregaSchema.parse(body)

    // Verificar que el evento exista
    const evento = await prisma.evento.findUnique({
      where: { id: validatedData.eventoId },
    })

    if (!evento) {
      return NextResponse.json(
        { success: false, error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que la empresa exista
    const empresa = await prisma.empresa.findUnique({
      where: { id: validatedData.empresaId },
    })

    if (!empresa) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 404 }
      )
    }

    // Verificar empresa receptora si se proporciona
    if (validatedData.empresaReceptoraId) {
      const empresaReceptora = await prisma.empresa.findUnique({
        where: { id: validatedData.empresaReceptoraId },
      })

      if (!empresaReceptora) {
        return NextResponse.json(
          { success: false, error: 'Empresa receptora no encontrada' },
          { status: 404 }
        )
      }
    }

    // Crear entrega
    const entrega = await prisma.entrega.create({
      data: validatedData,
      include: {
        evento: {
          select: {
            id: true,
            numero: true,
          },
        },
        empresa: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: entrega.id,
          evento: entrega.evento,
          empresa: entrega.empresa,
          message: 'Entrega creada correctamente',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error al crear entrega:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear entrega' },
      { status: 500 }
    )
  }
}

