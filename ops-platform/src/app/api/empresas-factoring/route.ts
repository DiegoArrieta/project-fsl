import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createEmpresaFactoringSchema } from '@/lib/validations/empresa-factoring'

/**
 * GET /api/empresas-factoring?buscar=&activo=true&page=&pageSize=
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
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(sp.get('pageSize') || '50', 10)))

    const where: Prisma.EmpresaFactoringWhereInput = {}
    if (activoParam === 'true') where.activo = true
    if (activoParam === 'false') where.activo = false
    if (buscar) {
      where.OR = [
        { nombre: { contains: buscar, mode: 'insensitive' } },
        { rut: { contains: buscar.replace(/\./g, '') } },
        { contacto: { contains: buscar, mode: 'insensitive' } },
      ]
    }

    const skip = (page - 1) * pageSize
    const [total, rows] = await Promise.all([
      prisma.empresaFactoring.count({ where }),
      prisma.empresaFactoring.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { nombre: 'asc' },
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
    console.error('Error al listar empresas de factoring:', error)
    return NextResponse.json(
      { success: false, error: 'Error al listar empresas de factoring' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/empresas-factoring
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const data = createEmpresaFactoringSchema.parse(body)

    const row = await prisma.empresaFactoring.create({
      data: {
        nombre: data.nombre.trim(),
        rut: data.rut?.trim() || null,
        contacto: data.contacto?.trim() || null,
        telefono: data.telefono?.trim() || null,
        email: data.email?.trim() || null,
        notas: data.notas?.trim() || null,
        activo: data.activo ?? true,
      },
    })

    return NextResponse.json(
      { success: true, data: row, message: 'Empresa de factoring creada' },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      )
    }
    console.error('Error al crear empresa de factoring:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear empresa de factoring' },
      { status: 500 }
    )
  }
}
