import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { eventoSchema } from '@/lib/validations/evento'
import { generarNumeroEvento } from '@/lib/eventos/numero'
import { z } from 'zod'

/**
 * GET /api/eventos
 * Listar eventos con filtros y paginación
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const buscar = searchParams.get('buscar') || ''
    const tipo = searchParams.get('tipo')
    const estado = searchParams.get('estado')
    const operacionId = searchParams.get('operacionId')
    const fechaDesde = searchParams.get('fechaDesde')
    const fechaHasta = searchParams.get('fechaHasta')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const skip = (page - 1) * pageSize

    // Construir filtros
    const where: any = {}

    if (tipo) {
      where.tipo = tipo
    }

    if (estado) {
      where.estado = estado
    }

    if (operacionId) {
      where.operacionId = operacionId
    }

    if (fechaDesde || fechaHasta) {
      where.fechaInicio = {}
      if (fechaDesde) {
        where.fechaInicio.gte = new Date(fechaDesde)
      }
      if (fechaHasta) {
        where.fechaInicio.lte = new Date(fechaHasta)
      }
    }

    if (buscar) {
      where.OR = [
        { numero: { contains: buscar, mode: 'insensitive' } },
        { descripcion: { contains: buscar, mode: 'insensitive' } },
        { ubicacion: { contains: buscar, mode: 'insensitive' } },
      ]
    }

    // Obtener total para paginación
    const total = await prisma.evento.count({ where })

    // Obtener eventos
    const eventos = await prisma.evento.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { fechaInicio: 'desc' },
      include: {
        operacion: {
          select: {
            id: true,
            numero: true,
            tipo: true,
          },
        },
        _count: {
          select: {
            entregas: true,
          },
        },
      },
    })

    // Formatear respuesta
    const data = eventos.map((evento) => ({
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
      createdAt: evento.createdAt,
      updatedAt: evento.updatedAt,
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
    console.error('Error al listar eventos:', error)
    return NextResponse.json(
      { success: false, error: 'Error al listar eventos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/eventos
 * Crear nuevo evento
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = eventoSchema.parse(body)

    // Generar número secuencial
    const ultimoEvento = await prisma.evento.findFirst({
      orderBy: { numero: 'desc' },
      select: { numero: true },
    })

    const numero = generarNumeroEvento(ultimoEvento?.numero || null)

    // Verificar que el número no exista (por si acaso)
    const numeroExiste = await prisma.evento.findUnique({
      where: { numero },
    })

    if (numeroExiste) {
      // Si existe, generar siguiente
      const nuevoNumero = generarNumeroEvento(numero)
      validatedData.numero = nuevoNumero
    } else {
      validatedData.numero = numero
    }

    // Crear evento
    const evento = await prisma.evento.create({
      data: validatedData,
      include: {
        operacion: {
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
          id: evento.id,
          numero: evento.numero,
          tipo: evento.tipo,
          message: 'Evento creado correctamente',
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

    console.error('Error al crear evento:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear evento' },
      { status: 500 }
    )
  }
}

