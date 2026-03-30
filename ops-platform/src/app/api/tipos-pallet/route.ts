import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createTipoPalletSchema } from '@/lib/validations/tipo-pallet'

const includeTipos = {
  categoria: true,
  paises: { include: { pais: true } },
} as const

/**
 * GET /api/tipos-pallet
 * Sin autenticación: solo tipos activos (compat. selects en flujos públicos si aplica).
 * Con sesión: ?activo=true|false|all&buscar=&page=&pageSize=
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const sp = request.nextUrl.searchParams
    const buscar = sp.get('buscar')?.trim() || ''
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(sp.get('pageSize') || '100', 10)))

    const where: Prisma.TipoPalletWhereInput = {}

    if (!session) {
      where.activo = true
    } else {
      const activoParam = sp.get('activo')
      if (activoParam === 'true') where.activo = true
      else if (activoParam === 'false') where.activo = false
      else if (activoParam === 'all' || activoParam === '') {
        // sin filtrar activo
      } else {
        where.activo = true
      }
    }

    if (buscar) {
      where.OR = [
        { codigo: { contains: buscar, mode: 'insensitive' } },
        { nombre: { contains: buscar, mode: 'insensitive' } },
        { dimensiones: { contains: buscar, mode: 'insensitive' } },
        { categoria: { nombre: { contains: buscar, mode: 'insensitive' } } },
      ]
    }

    const skip = (page - 1) * pageSize
    const [total, rows] = await Promise.all([
      prisma.tipoPallet.count({ where }),
      prisma.tipoPallet.findMany({
        where,
        include: includeTipos,
        skip: session ? skip : undefined,
        take: session ? pageSize : undefined,
        orderBy: [{ categoria: { codigo: 'asc' } }, { codigo: 'asc' }],
      }),
    ])

    if (!session) {
      return NextResponse.json({ success: true, data: rows })
    }

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
    console.error('Error al listar tipos de pallet:', error)
    return NextResponse.json(
      { success: false, error: 'Error al listar tipos de pallet' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tipos-pallet
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const data = createTipoPalletSchema.parse(body)

    const categoria = await prisma.categoriaPallet.findFirst({
      where: { id: data.categoriaId, activo: true },
    })
    if (!categoria) {
      return NextResponse.json(
        { success: false, error: 'Categoría no válida o inactiva' },
        { status: 400 }
      )
    }

    const paisesCount = await prisma.pais.count({
      where: { id: { in: data.paisIds }, activo: true },
    })
    if (paisesCount !== data.paisIds.length) {
      return NextResponse.json({ success: false, error: 'Uno o más países no son válidos' }, { status: 400 })
    }

    const row = await prisma.tipoPallet.create({
      data: {
        categoriaId: data.categoriaId,
        codigo: data.codigo,
        nombre: data.nombre.trim(),
        descripcion: data.descripcion?.trim() || null,
        dimensiones: data.dimensiones?.trim() || null,
        fotoKey: data.fotoKey?.trim() || null,
        fotoNombre: data.fotoNombre?.trim() || null,
        fotoContentType: data.fotoContentType?.trim() || null,
        fotoSize: data.fotoSize ?? null,
        requiereCertificacion: data.requiereCertificacion ?? false,
        activo: data.activo ?? true,
        paises: {
          create: data.paisIds.map((paisId) => ({ paisId })),
        },
      },
      include: includeTipos,
    })

    return NextResponse.json(
      { success: true, data: row, message: 'Tipo de pallet creado' },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      )
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Ya existe un tipo con ese código en la misma categoría' },
        { status: 409 }
      )
    }
    console.error('Error al crear tipo de pallet:', error)
    return NextResponse.json({ success: false, error: 'Error al crear tipo de pallet' }, { status: 500 })
  }
}
