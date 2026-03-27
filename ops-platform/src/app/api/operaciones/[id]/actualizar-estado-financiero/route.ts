import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { determinarEstadoFinanciero } from '@/lib/pagos/calculos'
import { calcularTotalesOperacion } from '@/lib/operaciones/calculos'

/**
 * PATCH /api/operaciones/[id]/actualizar-estado-financiero
 * Recalcula y actualiza el estado financiero de una operación
 */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Obtener operación con pagos y líneas
    const operacion = await prisma.operacion.findUnique({
      where: { id },
      include: {
        lineas: true,
        pagos: true,
      },
    })

    if (!operacion) {
      return NextResponse.json(
        { success: false, error: 'Operación no encontrada' },
        { status: 404 }
      )
    }

    // Calcular totales
    const totales = calcularTotalesOperacion(operacion.tipo, operacion.lineas)

    // Determinar nuevo estado financiero
    const nuevoEstadoFinanciero = determinarEstadoFinanciero(
      operacion.tipo,
      totales.totalVenta,
      totales.totalCompra,
      operacion.pagos
    )

    // Actualizar operación solo si cambió el estado
    if (nuevoEstadoFinanciero !== operacion.estadoFinanciero) {
      await prisma.operacion.update({
        where: { id },
        data: { estadoFinanciero: nuevoEstadoFinanciero },
      })

      return NextResponse.json({
        success: true,
        data: {
          estadoAnterior: operacion.estadoFinanciero,
          estadoNuevo: nuevoEstadoFinanciero,
        },
        message: 'Estado financiero actualizado correctamente',
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        estadoActual: operacion.estadoFinanciero,
      },
      message: 'Estado financiero sin cambios',
    })
  } catch (error) {
    console.error('Error al actualizar estado financiero:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar estado financiero' },
      { status: 500 }
    )
  }
}





