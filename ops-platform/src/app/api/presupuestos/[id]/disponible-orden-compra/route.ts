import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getComprometidoPorPresupuestoLineaId } from '@/lib/ordenes-compra/presupuesto-disponible'

/**
 * GET /api/presupuestos/:id/disponible-orden-compra
 * Cantidades presupuestadas, comprometidas y disponibles por línea (para crear/editar OC).
 * Query: excludeOrdenCompraId — excluir una OC al recalcular (edición en borrador).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id: presupuestoId } = await params

    const presupuesto = await prisma.presupuesto.findUnique({
      where: { id: presupuestoId },
      include: {
        cliente: { select: { id: true, razonSocial: true } },
        lineas: {
          include: {
            tipoPallet: {
              include: {
                categoria: true,
                paises: { include: { pais: true } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!presupuesto) {
      return NextResponse.json({ success: false, error: 'Presupuesto no encontrado' }, { status: 404 })
    }

    if (presupuesto.estado === 'BORRADOR' || presupuesto.estado === 'RECHAZADO') {
      return NextResponse.json(
        {
          success: false,
          error: 'Solo presupuestos enviados o aceptados pueden usarse en órdenes de compra.',
        },
        { status: 400 }
      )
    }

    const excludeId = request.nextUrl.searchParams.get('excludeOrdenCompraId') ?? undefined
    const comprometido = await getComprometidoPorPresupuestoLineaId(presupuestoId, excludeId)

    const lineas = presupuesto.lineas.map((l) => {
      const comp = comprometido.get(l.id) ?? 0
      return {
        presupuestoLineaId: l.id,
        tipoPalletId: l.tipoPalletId,
        cantidadPresupuesto: l.cantidad,
        precioUnitarioPresupuesto: Number(l.precioUnitario),
        descripcion: l.descripcion,
        cantidadComprometida: comp,
        cantidadDisponible: Math.max(0, l.cantidad - comp),
        tipoPallet: l.tipoPallet,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        presupuesto: {
          id: presupuesto.id,
          numero: presupuesto.numero,
          estado: presupuesto.estado,
          clienteId: presupuesto.clienteId,
          cliente: presupuesto.cliente,
        },
        lineas,
      },
    })
  } catch (error) {
    console.error('Error disponible orden compra presupuesto:', error)
    return NextResponse.json(
      { success: false, error: 'Error al calcular disponibilidad' },
      { status: 500 }
    )
  }
}
