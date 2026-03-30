import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { createPagoSchema } from '@/lib/validations/pago'
import {
  validarPagoParaOperacion,
  calcularMontoMaximo,
  determinarEstadoFinanciero,
} from '@/lib/pagos/calculos'
import { calcularTotalesOperacion } from '@/lib/operaciones/calculos'

/**
 * GET /api/pagos?operacionId=...
 * Lista pagos (filtrar por operacionId si se proporciona)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const operacionId = searchParams.get('operacionId')

    const where: Prisma.PagoWhereInput = operacionId ? { operacionId } : {}

    const pagos = await prisma.pago.findMany({
      where,
      include: {
        operacion: {
          select: {
            id: true,
            numero: true,
            tipo: true,
          },
        },
      },
      orderBy: {
        fechaPago: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: pagos,
    })
  } catch (error) {
    console.error('Error al listar pagos:', error)
    return NextResponse.json(
      { success: false, error: 'Error al listar pagos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/pagos
 * Crea un nuevo pago
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos de entrada
    const validatedData = createPagoSchema.parse(body)

    // Verificar que la operación existe
    const operacion = await prisma.operacion.findUnique({
      where: { id: validatedData.operacionId },
      include: {
        lineas: true,
        pagos: true,
        proveedores: { select: { id: true } },
      },
    })

    if (!operacion) {
      return NextResponse.json(
        { success: false, error: 'Operación no encontrada' },
        { status: 404 }
      )
    }

    // Validar que el pago sea coherente con el tipo de operación
    const tieneProveedor = (operacion.proveedores?.length ?? 0) > 0
    const validacion = validarPagoParaOperacion(
      operacion.tipo,
      validatedData.tipo,
      tieneProveedor,
      !!operacion.clienteId
    )

    if (!validacion.valido) {
      return NextResponse.json(
        { success: false, error: validacion.mensaje },
        { status: 400 }
      )
    }

    // Calcular totales de la operación
    const totales = calcularTotalesOperacion(operacion.tipo, operacion.lineas)

    // Validar que el monto no exceda el máximo permitido
    const montoMaximo = calcularMontoMaximo(
      validatedData.tipo,
      totales.totalVenta,
      totales.totalCompra,
      operacion.pagos
    )

    if (montoMaximo !== null && validatedData.monto > montoMaximo) {
      return NextResponse.json(
        {
          success: false,
          error: `El monto excede el saldo pendiente. Máximo permitido: $${montoMaximo.toLocaleString('es-CL')}`,
        },
        { status: 400 }
      )
    }

    // Crear el pago
    const pago = await prisma.pago.create({
      data: {
        operacionId: validatedData.operacionId,
        tipo: validatedData.tipo,
        monto: validatedData.monto,
        fechaPago: new Date(validatedData.fechaPago),
        metodoPago: validatedData.metodoPago,
        referencia: validatedData.referencia,
        banco: validatedData.banco,
        observaciones: validatedData.observaciones,
      },
    })

    // Recalcular estado financiero de la operación
    const todosLosPagos = await prisma.pago.findMany({
      where: { operacionId: operacion.id },
    })

    const nuevoEstadoFinanciero = determinarEstadoFinanciero(
      operacion.tipo,
      totales.totalVenta,
      totales.totalCompra,
      todosLosPagos
    )

    await prisma.operacion.update({
      where: { id: operacion.id },
      data: { estadoFinanciero: nuevoEstadoFinanciero },
    })

    return NextResponse.json(
      {
        success: true,
        data: pago,
        message: 'Pago registrado correctamente',
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

    console.error('Error al crear pago:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear pago' },
      { status: 500 }
    )
  }
}

