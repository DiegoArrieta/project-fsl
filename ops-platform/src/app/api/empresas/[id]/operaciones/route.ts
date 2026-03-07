import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/empresas/[id]/operaciones
 * Obtener operaciones asociadas a una empresa (a través de proveedores/clientes)
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

    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const skip = (page - 1) * pageSize

    // Verificar que la empresa exista
    const empresa = await prisma.empresa.findUnique({
      where: { id },
    })

    if (!empresa) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 404 }
      )
    }

    // Obtener operaciones a través de proveedores
    const operacionesProveedor = await prisma.operacion.findMany({
      where: {
        proveedores: {
          some: {
            proveedor: {
              empresaId: id,
            },
          },
        },
      },
      skip,
      take: pageSize,
      orderBy: { fecha: 'desc' },
      include: {
        cliente: {
          select: {
            id: true,
            razonSocial: true,
          },
        },
        proveedores: {
          include: {
            proveedor: {
              select: {
                id: true,
                razonSocial: true,
              },
            },
          },
        },
      },
    })

    // Obtener operaciones a través de clientes
    const operacionesCliente = await prisma.operacion.findMany({
      where: {
        cliente: {
          empresaId: id,
        },
      },
      skip,
      take: pageSize,
      orderBy: { fecha: 'desc' },
      include: {
        cliente: {
          select: {
            id: true,
            razonSocial: true,
          },
        },
        proveedores: {
          include: {
            proveedor: {
              select: {
                id: true,
                razonSocial: true,
              },
            },
          },
        },
      },
    })

    // Combinar y eliminar duplicados
    const todasOperaciones = [
      ...operacionesProveedor,
      ...operacionesCliente.filter(
        (op) => !operacionesProveedor.some((opProv) => opProv.id === op.id)
      ),
    ]

    const total = todasOperaciones.length

    // Formatear respuesta
    const data = todasOperaciones.map((operacion) => ({
      id: operacion.id,
      numero: operacion.numero,
      tipo: operacion.tipo,
      fecha: operacion.fecha,
      estadoDocumental: operacion.estadoDocumental,
      estadoFinanciero: operacion.estadoFinanciero,
      cliente: operacion.cliente,
      proveedores: operacion.proveedores.map((op) => op.proveedor),
    }))

    return NextResponse.json({
      success: true,
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Error al obtener operaciones de empresa:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener operaciones de empresa' },
      { status: 500 }
    )
  }
}

