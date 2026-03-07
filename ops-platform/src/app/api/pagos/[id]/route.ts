import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { updatePagoSchema } from '@/lib/validations/pago'
import { determinarEstadoFinanciero } from '@/lib/pagos/calculos'
import { calcularTotalesOperacion } from '@/lib/operaciones/calculos'

/**
 * GET /api/pagos/[id]
 * Obtiene un pago por ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pago = await prisma.pago.findUnique({
      where: { id },
      include: {
        operacion: {
          include: {
            proveedor: true,
            cliente: true,
          },
        },
      },
    })

    if (!pago) {
      return NextResponse.json(
        { success: false, error: 'Pago no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: pago,
    })
  } catch (error) {
    console.error('Error al obtener pago:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener pago' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/pagos/[id]
 * Actualiza un pago
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Verificar que el pago existe
    const pagoExistente = await prisma.pago.findUnique({
      where: { id },
      include: {
        operacion: {
          include: {
            lineas: true,
            pagos: true,
          },
        },
      },
    })

    if (!pagoExistente) {
      return NextResponse.json(
        { success: false, error: 'Pago no encontrado' },
        { status: 404 }
      )
    }

    // Validar datos de entrada
    const validatedData = updatePagoSchema.parse(body)

    // Preparar datos de actualización
    const updateData: any = {}

    if (validatedData.tipo) updateData.tipo = validatedData.tipo
    if (validatedData.monto !== undefined) updateData.monto = validatedData.monto
    if (validatedData.fechaPago !== undefined) {
      updateData.fechaPago = new Date(validatedData.fechaPago)
    }
    if (validatedData.metodoPago !== undefined) updateData.metodoPago = validatedData.metodoPago
    if (validatedData.referencia !== undefined) updateData.referencia = validatedData.referencia
    if (validatedData.banco !== undefined) updateData.banco = validatedData.banco
    if (validatedData.observaciones !== undefined)
      updateData.observaciones = validatedData.observaciones

    // Actualizar pago
    const pago = await prisma.pago.update({
      where: { id },
      data: updateData,
    })

    // Recalcular estado financiero de la operación
    const totales = calcularTotalesOperacion(
      pagoExistente.operacion.tipo,
      pagoExistente.operacion.lineas
    )
    const todosLosPagos = await prisma.pago.findMany({
      where: { operacionId: pagoExistente.operacionId },
    })

    const nuevoEstadoFinanciero = determinarEstadoFinanciero(
      pagoExistente.operacion.tipo,
      totales.totalVenta,
      totales.totalCompra,
      todosLosPagos
    )

    await prisma.operacion.update({
      where: { id: pagoExistente.operacionId },
      data: { estadoFinanciero: nuevoEstadoFinanciero },
    })

    return NextResponse.json({
      success: true,
      data: pago,
      message: 'Pago actualizado correctamente',
    })
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

    console.error('Error al actualizar pago:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar pago' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/pagos/[id]
 * Elimina un pago
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar que el pago existe
    const pago = await prisma.pago.findUnique({
      where: { id },
      include: {
        operacion: {
          include: {
            lineas: true,
          },
        },
      },
    })

    if (!pago) {
      return NextResponse.json(
        { success: false, error: 'Pago no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar pago
    await prisma.pago.delete({
      where: { id },
    })

    // Recalcular estado financiero de la operación
    const totales = calcularTotalesOperacion(pago.operacion.tipo, pago.operacion.lineas)
    const todosLosPagos = await prisma.pago.findMany({
      where: { operacionId: pago.operacionId },
    })

    const nuevoEstadoFinanciero = determinarEstadoFinanciero(
      pago.operacion.tipo,
      totales.totalVenta,
      totales.totalCompra,
      todosLosPagos
    )

    await prisma.operacion.update({
      where: { id: pago.operacionId },
      data: { estadoFinanciero: nuevoEstadoFinanciero },
    })

    return NextResponse.json({
      success: true,
      message: 'Pago eliminado correctamente',
    })
  } catch (error) {
    console.error('Error al eliminar pago:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar pago' },
      { status: 500 }
    )
  }
}

