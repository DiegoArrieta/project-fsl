import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createPaisSchema } from '@/lib/validations/pais'

/**
 * GET /api/paises?activo=true|false|all&buscar=&page=&pageSize=
 * Sin `activo`: solo países activos (compat. selects).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const sp = request.nextUrl.searchParams
    const buscar = sp.get('buscar')?.trim() || ''
    const activoParam = sp.get('activo')
    const listMode = sp.get('list') === '1' || activoParam !== null || !!buscar

    const where: Prisma.PaisWhereInput = {}
    if (activoParam === 'true') where.activo = true
    else if (activoParam === 'false') where.activo = false
    else if (activoParam === 'all') {
      // sin filtro
    } else {
      where.activo = true
    }

    if (buscar) {
      const q = buscar.replace(/\s/g, '').toUpperCase()
      where.OR = [
        { nombre: { contains: buscar, mode: 'insensitive' } },
        { codigoIso: { contains: q, mode: 'insensitive' } },
      ]
    }

    // Selects en formularios: GET sin parámetros → todos los activos, sin paginar
    if (!listMode) {
      const rows = await prisma.pais.findMany({
        where,
        orderBy: { nombre: 'asc' },
      })
      return NextResponse.json({ success: true, data: rows })
    }

    const page = Math.max(1, parseInt(sp.get('page') || '1', 10))
    const pageSize = Math.min(200, Math.max(1, parseInt(sp.get('pageSize') || '100', 10)))
    const skip = (page - 1) * pageSize
    const [total, rows] = await Promise.all([
      prisma.pais.count({ where }),
      prisma.pais.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ nombre: 'asc' }],
      }),
    ])

    return NextResponse.json({
      success: true,
      data: rows,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    })
  } catch (error) {
    console.error('Error al listar países:', error)
    return NextResponse.json({ success: false, error: 'Error al listar países' }, { status: 500 })
  }
}

/**
 * POST /api/paises
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const data = createPaisSchema.parse(body)

    const row = await prisma.pais.create({
      data: {
        codigoIso: data.codigoIso,
        nombre: data.nombre.trim(),
        activo: data.activo ?? true,
      },
    })

    return NextResponse.json({ success: true, data: row, message: 'País creado' }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      )
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Ya existe un país con ese código ISO' },
        { status: 409 }
      )
    }
    console.error('Error al crear país:', error)
    return NextResponse.json({ success: false, error: 'Error al crear país' }, { status: 500 })
  }
}
