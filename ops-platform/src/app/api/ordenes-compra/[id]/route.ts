import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { ordenCompraLineasConTipoPalletDetalle } from '@/lib/ordenes-compra/prisma-includes'
import { updateOrdenCompraSchema } from '@/lib/validations/orden-compra'
import {
  assertProductosContraPresupuesto,
  normalizarProductosSinPresupuesto,
  OrdenCompraPresupuestoError,
} from '@/lib/ordenes-compra/presupuesto-disponible'

/**
 * GET /api/ordenes-compra/[id]
 * Obtiene una orden de compra por ID con todas sus relaciones
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const ordenCompra = await prisma.ordenCompra.findUnique({
      where: { id },
      include: {
        proveedor: true,
        operacion: {
          include: {
            cliente: true,
          },
        },
        presupuesto: { select: { id: true, numero: true, estado: true } },
        ...ordenCompraLineasConTipoPalletDetalle,
      },
    })

    if (!ordenCompra) {
      return NextResponse.json(
        { success: false, error: 'Orden de compra no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: ordenCompra,
    })
  } catch (error) {
    console.error('Error al obtener orden de compra:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener orden de compra' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/ordenes-compra/[id]
 * Actualiza una orden de compra (solo si está en BORRADOR)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Verificar que la orden existe y está en BORRADOR
    const ordenExistente = await prisma.ordenCompra.findUnique({
      where: { id },
      include: {
        lineas: {
          select: {
            tipoPalletId: true,
            cantidad: true,
            presupuestoLineaId: true,
          },
        },
      },
    })

    if (!ordenExistente) {
      return NextResponse.json(
        { success: false, error: 'Orden de compra no encontrada' },
        { status: 404 }
      )
    }

    if (ordenExistente.estado !== 'BORRADOR') {
      return NextResponse.json(
        { success: false, error: 'Solo se pueden editar órdenes en estado BORRADOR' },
        { status: 400 }
      )
    }

    // Validar datos de entrada
    const validatedData = updateOrdenCompraSchema.parse(body)

    // Preparar datos para actualizar
    const updateData: any = {}

    if (validatedData.proveedorId) updateData.proveedorId = validatedData.proveedorId
    if (validatedData.fecha) updateData.fecha = new Date(validatedData.fecha)
    if (validatedData.fechaEntrega !== undefined) {
      updateData.fechaEntrega = validatedData.fechaEntrega ? new Date(validatedData.fechaEntrega) : null
    }
    if (validatedData.direccionEntrega !== undefined) updateData.direccionEntrega = validatedData.direccionEntrega
    if (validatedData.observaciones !== undefined) updateData.observaciones = validatedData.observaciones
    if (validatedData.operacionId !== undefined) updateData.operacionId = validatedData.operacionId
    if (validatedData.presupuestoId !== undefined) updateData.presupuestoId = validatedData.presupuestoId

    // Si se actualizan productos, eliminar existentes y crear nuevos
    if (validatedData.productos) {
      const presupuestoIdEfectivo =
        validatedData.presupuestoId !== undefined
          ? validatedData.presupuestoId
          : ordenExistente.presupuestoId

      const productosNormalizados = normalizarProductosSinPresupuesto(
        presupuestoIdEfectivo,
        validatedData.productos
      )

      if (presupuestoIdEfectivo) {
        await assertProductosContraPresupuesto({
          presupuestoId: presupuestoIdEfectivo,
          productos: productosNormalizados,
          excludeOrdenCompraId: id,
        })
      }

      await prisma.ordenCompraLinea.deleteMany({
        where: { ordenCompraId: id },
      })

      updateData.lineas = {
        create: productosNormalizados.map((p) => ({
          tipoPalletId: p.tipoPalletId,
          cantidad: p.cantidad,
          precioUnitario: p.precioUnitario,
          descripcion: p.descripcion,
          presupuestoLineaId: p.presupuestoLineaId ?? null,
        })),
      }
    }

    if (validatedData.productos === undefined && validatedData.presupuestoId !== undefined) {
      if (validatedData.presupuestoId === null) {
        await prisma.ordenCompraLinea.updateMany({
          where: { ordenCompraId: id },
          data: { presupuestoLineaId: null },
        })
      } else {
        const lineasActuales = ordenExistente.lineas.map((l) => ({
          tipoPalletId: l.tipoPalletId,
          cantidad: l.cantidad,
          presupuestoLineaId: l.presupuestoLineaId,
        }))
        const productosNorm = normalizarProductosSinPresupuesto(
          validatedData.presupuestoId,
          lineasActuales
        )
        await assertProductosContraPresupuesto({
          presupuestoId: validatedData.presupuestoId,
          productos: productosNorm,
          excludeOrdenCompraId: id,
        })
      }
    }

    // Actualizar orden
    const ordenCompra = await prisma.ordenCompra.update({
      where: { id },
      data: updateData,
      include: {
        proveedor: true,
        operacion: true,
        presupuesto: { select: { id: true, numero: true, estado: true } },
        ...ordenCompraLineasConTipoPalletDetalle,
      },
    })

    return NextResponse.json({
      success: true,
      data: ordenCompra,
      message: 'Orden de compra actualizada correctamente',
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

    if (error instanceof OrdenCompraPresupuestoError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    console.error('Error al actualizar orden de compra:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar orden de compra' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/ordenes-compra/[id]
 * Elimina una orden de compra (solo si está en BORRADOR)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar que la orden existe y está en BORRADOR
    const ordenExistente = await prisma.ordenCompra.findUnique({
      where: { id },
    })

    if (!ordenExistente) {
      return NextResponse.json(
        { success: false, error: 'Orden de compra no encontrada' },
        { status: 404 }
      )
    }

    if (ordenExistente.estado !== 'BORRADOR') {
      return NextResponse.json(
        { success: false, error: 'Solo se pueden eliminar órdenes en estado BORRADOR' },
        { status: 400 }
      )
    }

    // Eliminar líneas primero
    await prisma.ordenCompraLinea.deleteMany({
      where: { ordenCompraId: id },
    })

    // Eliminar orden
    await prisma.ordenCompra.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Orden de compra eliminada correctamente',
    })
  } catch (error) {
    console.error('Error al eliminar orden de compra:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar orden de compra' },
      { status: 500 }
    )
  }
}





