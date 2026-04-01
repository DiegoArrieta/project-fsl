import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { updateEstadoOrdenCompraSchema } from '@/lib/validations/orden-compra'
import { esTransicionEstadoOcPermitida } from '@/lib/ordenes-compra/estado-transiciones'
import { syncCostosOperacionDesdeOrdenesRecibidas } from '@/lib/operaciones/sync-costo-desde-ordenes-recibidas'

/**
 * PATCH /api/ordenes-compra/[id]/estado
 * Actualiza el estado de una orden de compra (transiciones válidas según estado-transiciones.ts).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validar datos
    const validatedData = updateEstadoOrdenCompraSchema.parse(body)

    // Verificar que la orden existe
    const ordenExistente = await prisma.ordenCompra.findUnique({
      where: { id },
    })

    if (!ordenExistente) {
      return NextResponse.json(
        { success: false, error: 'Orden de compra no encontrada' },
        { status: 404 }
      )
    }

    const estadoActual = ordenExistente.estado
    const nuevoEstado = validatedData.estado

    const transicion = esTransicionEstadoOcPermitida(estadoActual, nuevoEstado, {
      pdfGenerado: ordenExistente.pdfGenerado,
    })
    if (!transicion.ok) {
      return NextResponse.json({ success: false, error: transicion.mensaje }, { status: 400 })
    }

    // Actualizar estado
    const ordenActualizada = await prisma.ordenCompra.update({
      where: { id },
      data: {
        estado: nuevoEstado,
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

    if (nuevoEstado === 'RECIBIDA' && ordenExistente.operacionId) {
      await syncCostosOperacionDesdeOrdenesRecibidas(ordenExistente.operacionId)
    }

    return NextResponse.json({
      success: true,
      data: ordenActualizada,
      message: 'Estado de orden de compra actualizado correctamente',
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

    console.error('Error al actualizar estado:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar estado de orden de compra' },
      { status: 500 }
    )
  }
}





