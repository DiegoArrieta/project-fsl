import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { updateSolicitudCotizacionSchema } from '@/lib/validations/solicitud-cotizacion'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'

const includeRel = {
  proveedor: { select: { id: true, razonSocial: true, rut: true } },
  lineas: { include: { tipoPallet: true } },
} as const

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const row = await prisma.solicitudCotizacion.findUnique({
      where: { id },
      include: includeRel,
    })

    if (!row) {
      return NextResponse.json({ success: false, error: 'Solicitud no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: row })
  } catch (error) {
    console.error('Error al obtener solicitud de cotización:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener solicitud de cotización' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const data = updateSolicitudCotizacionSchema.parse(body)

    const existing = await prisma.solicitudCotizacion.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Solicitud no encontrada' }, { status: 404 })
    }
    if (existing.estado !== 'BORRADOR') {
      const cambiaMasQueEstado =
        data.lineas !== undefined ||
        data.proveedorId !== undefined ||
        data.fecha !== undefined ||
        data.observaciones !== undefined
      if (cambiaMasQueEstado) {
        return NextResponse.json(
          {
            success: false,
            error: 'Fuera de borrador solo se puede actualizar el estado del documento',
          },
          { status: 400 }
        )
      }
      if (data.estado === undefined) {
        return NextResponse.json(
          { success: false, error: 'Debe indicar el nuevo estado' },
          { status: 400 }
        )
      }
      const updated = await prisma.solicitudCotizacion.update({
        where: { id },
        data: { estado: data.estado },
        include: includeRel,
      })
      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Estado actualizado',
      })
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (data.proveedorId !== undefined && data.proveedorId !== existing.proveedorId) {
        const prov = await tx.proveedor.findUnique({
          where: { id: data.proveedorId },
          select: { id: true, activo: true },
        })
        if (!prov) {
          throw new Error('Proveedor no encontrado')
        }
        if (!prov.activo) {
          throw new Error('El proveedor está inactivo')
        }
      }

      if (data.lineas) {
        await tx.solicitudCotizacionLinea.deleteMany({ where: { solicitudCotizacionId: id } })
      }

      const patch: Prisma.SolicitudCotizacionUpdateInput = {}
      if (data.fecha !== undefined) patch.fecha = data.fecha
      if (data.observaciones !== undefined) patch.observaciones = data.observaciones
      if (data.estado !== undefined) patch.estado = data.estado
      if (data.proveedorId !== undefined) {
        patch.proveedor = { connect: { id: data.proveedorId } }
      }
      if (data.lineas) {
        patch.lineas = {
          create: data.lineas.map((l) => ({
            tipoPalletId: l.tipoPalletId,
            cantidad: l.cantidad,
            descripcion: l.descripcion ?? null,
          })),
        }
      }

      return tx.solicitudCotizacion.update({
        where: { id },
        data: patch,
        include: includeRel,
      })
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Solicitud actualizada',
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      )
    }
    const msg = error instanceof Error ? error.message : 'Error al actualizar'
    if (msg === 'Proveedor no encontrado' || msg === 'El proveedor está inactivo') {
      return NextResponse.json({ success: false, error: msg }, { status: 400 })
    }
    console.error('Error al actualizar solicitud de cotización:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar solicitud de cotización' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.solicitudCotizacion.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Solicitud no encontrada' }, { status: 404 })
    }
    if (existing.estado !== 'BORRADOR') {
      return NextResponse.json(
        { success: false, error: 'Solo se pueden eliminar solicitudes en borrador' },
        { status: 400 }
      )
    }

    await prisma.solicitudCotizacion.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Solicitud eliminada' })
  } catch (error) {
    console.error('Error al eliminar solicitud de cotización:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar solicitud de cotización' },
      { status: 500 }
    )
  }
}
