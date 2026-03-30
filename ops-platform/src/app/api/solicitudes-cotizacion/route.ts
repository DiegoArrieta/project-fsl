import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createSolicitudCotizacionSchema } from '@/lib/validations/solicitud-cotizacion'
import { SequenceService } from '@/modules/sequences/sequence.service'
import { z } from 'zod'
import type { EstadoSolicitudCotizacion, Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const sp = request.nextUrl.searchParams
    const page = parseInt(sp.get('page') || '1', 10)
    const pageSize = parseInt(sp.get('pageSize') || '20', 10)
    const proveedorId = sp.get('proveedorId') || undefined
    const estado = sp.get('estado') as EstadoSolicitudCotizacion | undefined
    const buscar = sp.get('buscar') || undefined

    const where: Prisma.SolicitudCotizacionWhereInput = {}
    if (proveedorId) where.proveedorId = proveedorId
    if (estado) where.estado = estado
    if (buscar) {
      where.numero = { contains: buscar, mode: 'insensitive' }
    }

    const [total, rows] = await Promise.all([
      prisma.solicitudCotizacion.count({ where }),
      prisma.solicitudCotizacion.findMany({
        where,
        include: {
          proveedor: { select: { id: true, razonSocial: true, rut: true } },
          lineas: { include: { tipoPallet: { select: { id: true, nombre: true, codigo: true } } } },
        },
        orderBy: { fecha: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return NextResponse.json({
      success: true,
      data: rows,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Error al listar solicitudes de cotización:', error)
    return NextResponse.json(
      { success: false, error: 'Error al listar solicitudes de cotización' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const data = createSolicitudCotizacionSchema.parse(body)

    const proveedor = await prisma.proveedor.findUnique({
      where: { id: data.proveedorId },
      select: { id: true, activo: true },
    })
    if (!proveedor) {
      return NextResponse.json({ success: false, error: 'Proveedor no encontrado' }, { status: 404 })
    }
    if (!proveedor.activo) {
      return NextResponse.json({ success: false, error: 'El proveedor está inactivo' }, { status: 400 })
    }

    const created = await prisma.$transaction(async (tx) => {
      const numero = await SequenceService.getNextSequence('SOLICITUD_COTIZACION', tx)
      const estado = data.estado ?? 'BORRADOR'

      return tx.solicitudCotizacion.create({
        data: {
          numero,
          proveedorId: data.proveedorId,
          fecha: data.fecha,
          observaciones: data.observaciones ?? null,
          estado,
          lineas: {
            create: data.lineas.map((l) => ({
              tipoPalletId: l.tipoPalletId,
              cantidad: l.cantidad,
              descripcion: l.descripcion ?? null,
            })),
          },
        },
        include: {
          proveedor: { select: { id: true, razonSocial: true, rut: true } },
          lineas: { include: { tipoPallet: true } },
        },
      })
    })

    return NextResponse.json(
      { success: true, data: created, message: 'Solicitud de cotización creada' },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      )
    }
    console.error('Error al crear solicitud de cotización:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear solicitud de cotización' },
      { status: 500 }
    )
  }
}
