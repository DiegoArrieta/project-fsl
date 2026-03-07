import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { createOperacionSchema } from '@/lib/validations/operacion'
import { calcularTotalesOperacion, generarNumeroOperacion } from '@/lib/operaciones/calculos'

/**
 * GET /api/operaciones
 * Lista operaciones con filtros y paginación
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)
    const tipo = searchParams.get('tipo')
    const estadoDocumental = searchParams.get('estadoDocumental')
    const estadoFinanciero = searchParams.get('estadoFinanciero')
    const buscar = searchParams.get('buscar')
    const clienteId = searchParams.get('clienteId')
    const proveedorId = searchParams.get('proveedorId')

    // Construir filtros
    const where: any = {}

    if (tipo && tipo !== 'TODAS') {
      where.tipo = tipo
    }

    if (estadoDocumental && estadoDocumental !== 'TODOS') {
      where.estadoDocumental = estadoDocumental
    }

    if (estadoFinanciero && estadoFinanciero !== 'TODOS') {
      where.estadoFinanciero = estadoFinanciero
    }

    if (buscar) {
      where.numero = {
        contains: buscar,
        mode: 'insensitive',
      }
    }

    if (clienteId) {
      where.clienteId = clienteId
    }

    if (proveedorId) {
      where.proveedores = {
        some: {
          proveedorId: proveedorId,
        },
      }
    }

    // Contar total
    const total = await prisma.operacion.count({ where })

    // Obtener operaciones con relaciones
    const operaciones = await prisma.operacion.findMany({
      where,
      include: {
        cliente: true,
        evento: {
          select: {
            id: true,
            numero: true,
            tipo: true,
            fechaInicio: true,
            estado: true,
          },
        },
        proveedores: {
          include: {
            proveedor: true,
          },
        },
        lineas: {
          include: {
            tipoPallet: true,
          },
        },
        documentos: true,
        pagos: true,
        ordenCompraGenerada: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    return NextResponse.json({
      success: true,
      data: operaciones,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Error al listar operaciones:', error)
    return NextResponse.json(
      { success: false, error: 'Error al listar operaciones' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/operaciones
 * Crea una nueva operación
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos de entrada
    const validatedData = createOperacionSchema.parse(body)

    // Generar número de operación secuencial
    const ultimaOperacion = await prisma.operacion.findFirst({
      orderBy: { numero: 'desc' },
      select: { numero: true },
    })
    const numero = generarNumeroOperacion(ultimaOperacion?.numero || null)

    // Calcular totales según tipo de operación
    const totales = calcularTotalesOperacion(validatedData.tipo, validatedData.productos)

    // Preparar datos para crear
    const operacionData: any = {
      numero,
      tipo: validatedData.tipo,
      fecha: new Date(validatedData.fecha),
      direccionEntrega: validatedData.direccionEntrega,
      ordenCompraCliente: validatedData.ordenCompraCliente,
      observaciones: validatedData.observaciones,
      estadoDocumental: 'INCOMPLETA',
      estadoFinanciero: 'PENDIENTE',
    }

    // Agregar cliente si aplica
    if (validatedData.clienteId) {
      operacionData.clienteId = validatedData.clienteId
    }

    // Agregar evento si aplica
    if (validatedData.eventoId) {
      operacionData.eventoId = validatedData.eventoId
    }

    // Agregar totales según tipo
    if (validatedData.tipo === 'COMPRA') {
      operacionData.totalCompra = totales.totalCompra
    } else {
      const totalesVenta = totales as any
      operacionData.totalVenta = totalesVenta.totalVenta
      operacionData.totalCompra = totalesVenta.totalCompra
      operacionData.margenBruto = totalesVenta.margenBruto
      operacionData.margenPorcentual = totalesVenta.margenPorcentual
    }

    // Crear operación con productos y proveedores
    const operacion = await prisma.operacion.create({
      data: {
        ...operacionData,
        proveedores: {
          create: validatedData.proveedores?.map((proveedorId) => ({
            proveedorId: proveedorId,
          })) || [],
        },
        lineas: {
          create: validatedData.productos.map((p) => ({
            tipoPalletId: p.tipoPalletId,
            cantidad: p.cantidad,
            precioUnitario: p.precioUnitario,
            precioVentaUnitario: p.precioVentaUnitario,
            precioCompraUnitario: p.precioCompraUnitario,
            cantidadEntregada: 0,
            cantidadDanada: 0,
          })),
        },
      },
      include: {
        cliente: true,
        proveedores: {
          include: {
            proveedor: true,
          },
        },
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
        data: operacion,
        message: 'Operación creada correctamente',
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

    console.error('Error al crear operación:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear operación' },
      { status: 500 }
    )
  }
}

