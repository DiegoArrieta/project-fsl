import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  calcularEstadisticasOperaciones,
  calcularMetricasFinancieras,
  obtenerOperacionesPendientes,
} from '@/lib/dashboard/estadisticas'

/**
 * GET /api/dashboard/estadisticas
 * Obtiene estadísticas generales del dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const periodo = searchParams.get('periodo') || 'mes' // 'mes', 'trimestre', 'año', 'todo'

    // Calcular fecha de inicio según periodo
    const now = new Date()
    let fechaInicio: Date

    switch (periodo) {
      case 'mes':
        fechaInicio = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'trimestre':
        fechaInicio = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        break
      case 'año':
        fechaInicio = new Date(now.getFullYear(), 0, 1)
        break
      case 'todo':
        fechaInicio = new Date(2000, 0, 1) // Inicio arbitrario
        break
      default:
        fechaInicio = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Obtener operaciones del periodo
    const operaciones = await prisma.operacion.findMany({
      where: {
        fecha: {
          gte: fechaInicio,
        },
      },
      include: {
        lineas: true,
        pagos: true,
      },
    })

    // Calcular estadísticas
    const estadisticasOperaciones = calcularEstadisticasOperaciones(operaciones)
    const metricasFinancieras = calcularMetricasFinancieras(operaciones)
    const operacionesPendientes = obtenerOperacionesPendientes(operaciones)

    return NextResponse.json({
      success: true,
      data: {
        periodo,
        fechaInicio,
        fechaFin: now,
        estadisticasOperaciones,
        metricasFinancieras,
        operacionesPendientes,
      },
    })
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}





