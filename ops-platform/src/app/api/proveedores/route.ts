import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { proveedorSchema } from '@/lib/validations/contacto'
import { z } from 'zod'

/**
 * GET /api/proveedores
 * Listar proveedores con filtros y paginación
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const buscar = searchParams.get('buscar') || ''
    const activo = searchParams.get('activo')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const skip = (page - 1) * pageSize

    // Construir filtros
    const where: any = {}

    if (activo !== null) {
      where.activo = activo === 'true'
    }

    if (buscar) {
      where.OR = [
        { razonSocial: { contains: buscar, mode: 'insensitive' } },
        { nombreFantasia: { contains: buscar, mode: 'insensitive' } },
        { rut: { contains: buscar.replace(/\./g, '') } },
      ]
    }

    // Obtener total para paginación
    const total = await prisma.proveedor.count({ where })

    // Obtener proveedores
    const proveedores = await prisma.proveedor.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { razonSocial: 'asc' },
      include: {
        _count: {
          select: { operaciones: true },
        },
      },
    })

    // Formatear respuesta
    const data = proveedores.map((proveedor) => ({
      id: proveedor.id,
      rut: proveedor.rut,
      razonSocial: proveedor.razonSocial,
      nombreFantasia: proveedor.nombreFantasia,
      direccion: proveedor.direccion,
      comuna: proveedor.comuna,
      ciudad: proveedor.ciudad,
      telefono: proveedor.telefono,
      email: proveedor.email,
      activo: proveedor.activo,
      totalOperaciones: proveedor._count.operaciones,
      createdAt: proveedor.createdAt,
      updatedAt: proveedor.updatedAt,
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
    console.error('Error al listar proveedores:', error)
    return NextResponse.json(
      { success: false, error: 'Error al listar proveedores' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/proveedores
 * Crear nuevo proveedor
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = proveedorSchema.parse(body)

    // Verificar que el RUT no exista
    const existingProveedor = await prisma.proveedor.findUnique({
      where: { rut: validatedData.rut },
    })

    if (existingProveedor) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un proveedor con este RUT' },
        { status: 409 }
      )
    }

    // Crear proveedor
    const proveedor = await prisma.proveedor.create({
      data: validatedData,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: proveedor.id,
          rut: proveedor.rut,
          razonSocial: proveedor.razonSocial,
          message: 'Proveedor creado correctamente',
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

    console.error('Error al crear proveedor:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear proveedor' },
      { status: 500 }
    )
  }
}

