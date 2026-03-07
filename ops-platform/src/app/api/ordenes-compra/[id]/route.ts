import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { updateOrdenCompraSchema } from '@/lib/validations/orden-compra'

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
        lineas: {
          include: {
            tipoPallet: true,
          },
        },
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
        lineas: true,
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

    // Si se actualizan productos, eliminar existentes y crear nuevos
    if (validatedData.productos) {
      await prisma.ordenCompraLinea.deleteMany({
        where: { ordenCompraId: id },
      })

      updateData.lineas = {
        create: validatedData.productos.map((p: any) => ({
          tipoPalletId: p.tipoPalletId,
          cantidad: p.cantidad,
          precioUnitario: p.precioUnitario,
          descripcion: p.descripcion,
        })),
      }
    }

    // Actualizar orden
    const ordenCompra = await prisma.ordenCompra.update({
      where: { id },
      data: updateData,
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




