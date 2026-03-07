import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { createOrdenCompraSchema } from '@/lib/validations/orden-compra'
import { generarNumeroOrdenCompra } from '@/lib/ordenes-compra/numero'

/**
 * GET /api/ordenes-compra
 * Lista órdenes de compra con filtros y paginación
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)
    const estado = searchParams.get('estado')
    const proveedorId = searchParams.get('proveedorId')
    const operacionId = searchParams.get('operacionId')
    const buscar = searchParams.get('buscar')

    // Construir filtros
    const where: any = {}

    if (estado && estado !== 'TODOS') {
      where.estado = estado
    }

    if (proveedorId) {
      where.proveedorId = proveedorId
    }

    if (operacionId) {
      where.operacionId = operacionId
    }

    if (buscar) {
      where.numero = {
        contains: buscar,
        mode: 'insensitive',
      }
    }

    // Contar total
    const total = await prisma.ordenCompra.count({ where })

    // Obtener órdenes con relaciones
    const ordenesCompra = await prisma.ordenCompra.findMany({
      where,
      include: {
        proveedor: true,
        operacion: true,
        lineas: {
          include: {
            tipoPallet: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    return NextResponse.json({
      success: true,
      data: ordenesCompra,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Error al listar órdenes de compra:', error)
    return NextResponse.json(
      { success: false, error: 'Error al listar órdenes de compra' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ordenes-compra
 * Crea una nueva orden de compra en estado BORRADOR
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos de entrada
    const validatedData = createOrdenCompraSchema.parse(body)

    // Generar número de orden de compra secuencial
    const ultimaOrden = await prisma.ordenCompra.findFirst({
      orderBy: { numero: 'desc' },
      select: { numero: true },
    })
    const numero = generarNumeroOrdenCompra(ultimaOrden?.numero || null)

    // Preparar datos para crear
    const ordenData: any = {
      numero,
      proveedorId: validatedData.proveedorId,
      fecha: new Date(validatedData.fecha),
      fechaEntrega: validatedData.fechaEntrega ? new Date(validatedData.fechaEntrega) : null,
      direccionEntrega: validatedData.direccionEntrega,
      observaciones: validatedData.observaciones,
      operacionId: validatedData.operacionId,
      estado: 'BORRADOR',
      pdfGenerado: false,
    }

    // Crear orden de compra con líneas
    const ordenCompra = await prisma.ordenCompra.create({
      data: {
        ...ordenData,
        lineas: {
          create: validatedData.productos.map((p) => ({
            tipoPalletId: p.tipoPalletId,
            cantidad: p.cantidad,
            precioUnitario: p.precioUnitario,
            descripcion: p.descripcion,
          })),
        },
      },
      include: {
        proveedor: true,
        operacion: true,
        lineas: {
          include: {
            tipoPallet: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: ordenCompra,
        message: 'Orden de compra creada correctamente',
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos de entrada inválidos',
          issues: error.issues,
        },
        { status: 400 }
      )
    }

    console.error('Error al crear orden de compra:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear orden de compra' },
      { status: 500 }
    )
  }
}




