import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calcularResumenFinanciero } from '@/lib/pagos/calculos'
import { calcularTotalesOperacion } from '@/lib/operaciones/calculos'

/**
 * GET /api/pagos/resumen?operacionId=xxx
 * Obtiene el resumen financiero de una operación
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const operacionId = searchParams.get('operacionId')

    if (!operacionId) {
      return NextResponse.json(
        { success: false, error: 'operacionId es requerido' },
        { status: 400 }
      )
    }

    // Obtener operación con sus relaciones
    const operacion = await prisma.operacion.findUnique({
      where: { id: operacionId },
      include: {
        lineas: true,
        pagos: true,
        proveedor: true,
        cliente: true,
      },
    })

    if (!operacion) {
      return NextResponse.json(
        { success: false, error: 'Operación no encontrada' },
        { status: 404 }
      )
    }

    // Calcular totales de la operación
    const totales = calcularTotalesOperacion(operacion.tipo, operacion.lineas)

    // Calcular resumen financiero
    const resumen = calcularResumenFinanciero(
      totales.totalVenta,
      totales.totalCompra,
      operacion.pagos
    )

    // Construir respuesta detallada
    return NextResponse.json({
      success: true,
      data: {
        operacion: {
          id: operacion.id,
          numero: operacion.numero,
          tipo: operacion.tipo,
          estadoFinanciero: operacion.estadoFinanciero,
        },
        totales: {
          totalVenta: totales.totalVenta,
          totalCompra: totales.totalCompra,
          margenBruto: totales.margenBruto,
          porcentajeMargen: totales.porcentajeMargen,
        },
        resumen: {
          cobros: {
            total: resumen.totalCobros,
            pendiente: resumen.saldoCobros,
          },
          pagos: {
            total: resumen.totalPagos,
            pendiente: resumen.saldoPagos,
          },
          gastosAdicionales: {
            fletes: resumen.totalFletes,
            comisiones: resumen.totalComisiones,
            total: resumen.totalFletes + resumen.totalComisiones,
          },
          margenNeto: resumen.margenNeto,
          estadoSugerido: resumen.estadoSugerido,
        },
        pagos: operacion.pagos.map((p) => ({
          id: p.id,
          tipo: p.tipo,
          monto: p.monto,
          fechaPago: p.fechaPago,
          metodoPago: p.metodoPago,
          referencia: p.referencia,
          banco: p.banco,
        })),
      },
    })
  } catch (error) {
    console.error('Error al obtener resumen financiero:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener resumen financiero' },
      { status: 500 }
    )
  }
}

