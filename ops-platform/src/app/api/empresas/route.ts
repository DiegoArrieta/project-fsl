import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { empresaSchema } from '@/lib/validations/empresa'
import { z } from 'zod'

/**
 * GET /api/empresas
 * Listar empresas con filtros y paginación
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const buscar = searchParams.get('buscar') || ''
    const tipoEmpresa = searchParams.get('tipoEmpresa')
    const estado = searchParams.get('estado')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const skip = (page - 1) * pageSize

    // Construir filtros
    const where: any = {}

    if (tipoEmpresa) {
      where.tipoEmpresa = tipoEmpresa
    }

    if (estado) {
      where.estado = estado
    }

    if (buscar) {
      where.OR = [
        { nombre: { contains: buscar, mode: 'insensitive' } },
        { rut: { contains: buscar.replace(/\./g, '') } },
        { contacto: { contains: buscar, mode: 'insensitive' } },
      ]
    }

    // Obtener total para paginación
    const total = await prisma.empresa.count({ where })

    // Obtener empresas
    const empresas = await prisma.empresa.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: {
            entregas: true,
            entregasReceptoras: true,
            proveedores: true,
            clientes: true,
          },
        },
      },
    })

    // Formatear respuesta
    const data = empresas.map((empresa) => ({
      id: empresa.id,
      nombre: empresa.nombre,
      rut: empresa.rut,
      tipoEmpresa: empresa.tipoEmpresa,
      contacto: empresa.contacto,
      direccion: empresa.direccion,
      telefono: empresa.telefono,
      email: empresa.email,
      estado: empresa.estado,
      totalEntregas: empresa._count.entregas + empresa._count.entregasReceptoras,
      totalProveedores: empresa._count.proveedores,
      totalClientes: empresa._count.clientes,
      createdAt: empresa.createdAt,
      updatedAt: empresa.updatedAt,
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
    console.error('Error al listar empresas:', error)
    return NextResponse.json(
      { success: false, error: 'Error al listar empresas' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/empresas
 * Crear nueva empresa
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = empresaSchema.parse(body)

    // Verificar que el RUT no exista
    const existingEmpresa = await prisma.empresa.findUnique({
      where: { rut: validatedData.rut },
    })

    if (existingEmpresa) {
      return NextResponse.json(
        { success: false, error: 'Ya existe una empresa con este RUT' },
        { status: 409 }
      )
    }

    // Crear empresa
    const empresa = await prisma.empresa.create({
      data: validatedData,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: empresa.id,
          nombre: empresa.nombre,
          rut: empresa.rut,
          message: 'Empresa creada correctamente',
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

    console.error('Error al crear empresa:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear empresa' },
      { status: 500 }
    )
  }
}

