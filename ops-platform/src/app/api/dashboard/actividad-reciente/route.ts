import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/dashboard/actividad-reciente
 * Obtiene la actividad reciente del sistema
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limite = parseInt(searchParams.get('limite') || '10', 10)

    // Obtener operaciones recientes
    const operacionesRecientes = await prisma.operacion.findMany({
      take: limite,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        proveedor: {
          select: {
            razonSocial: true,
          },
        },
        cliente: {
          select: {
            razonSocial: true,
          },
        },
      },
    })

    // Obtener documentos recientes
    const documentosRecientes = await prisma.documento.findMany({
      take: limite,
      orderBy: {
        uploadedAt: 'desc',
      },
      include: {
        operacion: {
          select: {
            numero: true,
          },
        },
      },
    })

    // Obtener pagos recientes
    const pagosRecientes = await prisma.pago.findMany({
      take: limite,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        operacion: {
          select: {
            numero: true,
          },
        },
      },
    })

    // Construir timeline unificado de actividad
    const actividad = [
      ...operacionesRecientes.map((op) => ({
        tipo: 'operacion' as const,
        id: op.id,
        fecha: op.createdAt,
        descripcion: `Nueva operación ${op.numero}`,
        entidad:
          op.tipo === 'COMPRA'
            ? op.proveedor?.razonSocial || 'Sin proveedor'
            : op.cliente?.razonSocial || 'Sin cliente',
        enlace: `/operaciones/${op.id}`,
      })),
      ...documentosRecientes.map((doc) => ({
        tipo: 'documento' as const,
        id: doc.id,
        fecha: doc.uploadedAt,
        descripcion: `Documento subido: ${doc.tipo}`,
        entidad: doc.operacion.numero,
        enlace: `/operaciones/${doc.operacionId}`,
      })),
      ...pagosRecientes.map((pago) => ({
        tipo: 'pago' as const,
        id: pago.id,
        fecha: pago.createdAt,
        descripcion: `Pago registrado: ${pago.tipo}`,
        entidad: pago.operacion.numero,
        enlace: `/operaciones/${pago.operacionId}`,
      })),
    ]

    // Ordenar por fecha descendente y limitar
    actividad.sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
    const actividadLimitada = actividad.slice(0, limite)

    return NextResponse.json({
      success: true,
      data: actividadLimitada,
    })
  } catch (error) {
    console.error('Error al obtener actividad reciente:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener actividad reciente' },
      { status: 500 }
    )
  }
}




