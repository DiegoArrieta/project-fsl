import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { clienteSchema } from '@/lib/validations/contacto'
import { z } from 'zod'

/**
 * GET /api/clientes
 * Listar clientes con filtros y paginación
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
    const total = await prisma.cliente.count({ where })

    // Obtener clientes
    const clientes = await prisma.cliente.findMany({
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
    const data = clientes.map((cliente) => ({
      id: cliente.id,
      rut: cliente.rut,
      razonSocial: cliente.razonSocial,
      nombreFantasia: cliente.nombreFantasia,
      direccion: cliente.direccion,
      comuna: cliente.comuna,
      ciudad: cliente.ciudad,
      telefono: cliente.telefono,
      email: cliente.email,
      activo: cliente.activo,
      totalOperaciones: cliente._count.operaciones,
      createdAt: cliente.createdAt,
      updatedAt: cliente.updatedAt,
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
    console.error('Error al listar clientes:', error)
    return NextResponse.json(
      { success: false, error: 'Error al listar clientes' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/clientes
 * Crear nuevo cliente
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = clienteSchema.parse(body)

    // Verificar que el RUT no exista
    const existingCliente = await prisma.cliente.findUnique({
      where: { rut: validatedData.rut },
    })

    if (existingCliente) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un cliente con este RUT' },
        { status: 409 }
      )
    }

    // Crear cliente
    const cliente = await prisma.cliente.create({
      data: validatedData,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: cliente.id,
          rut: cliente.rut,
          razonSocial: cliente.razonSocial,
          message: 'Cliente creado correctamente',
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

    console.error('Error al crear cliente:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear cliente' },
      { status: 500 }
    )
  }
}

