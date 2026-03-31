import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
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
    const buscar = searchParams.get('buscar')?.trim() || ''
    const estado = searchParams.get('estado')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const skip = (page - 1) * pageSize

    const where: Prisma.EntregaWhereInput = {}

    if (eventoId) {
      where.eventoId = eventoId
    }

    if (buscar) {
      const q = buscar.replace(/\./g, '')
      where.OR = [
        { origenRazonSocial: { contains: buscar, mode: 'insensitive' } },
        { origenRut: { contains: q, mode: 'insensitive' } },
        { receptorRazonSocial: { contains: buscar, mode: 'insensitive' } },
        { receptorRut: { contains: q, mode: 'insensitive' } },
      ]
    }

    if (estado) {
      where.estado = estado as Prisma.EntregaWhereInput['estado']
    }

    const total = await prisma.entrega.count({ where })

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
      },
    })

    const data = entregas.map((entrega) => ({
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

    const evento = await prisma.evento.findUnique({
      where: { id: validatedData.eventoId },
    })

    if (!evento) {
      return NextResponse.json(
        { success: false, error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    const entrega = await prisma.entrega.create({
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

    return NextResponse.json(
      {
        success: true,
        data: {
          id: entrega.id,
          evento: entrega.evento,
          origenRazonSocial: entrega.origenRazonSocial,
          origenRut: entrega.origenRut,
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
