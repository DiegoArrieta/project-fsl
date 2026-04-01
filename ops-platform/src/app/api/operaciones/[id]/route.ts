import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { logPrismaKnownRequestError } from '@/lib/prisma/log-known-request-error'
import { updateOperacionSchema } from '@/lib/validations/operacion'
import { calcularTotalesOperacion } from '@/lib/operaciones/calculos'
import { buildDesgloseCompraOperacionLineas } from '@/lib/operaciones/desglose-compra-operacion'

/**
 * GET /api/operaciones/[id]
 * Obtiene una operación por ID con todas sus relaciones
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const operacion = await prisma.operacion.findUnique({
      where: { id },
      include: {
        cliente: true,
        evento: {
          select: {
            id: true,
            numero: true,
            tipo: true,
            fechaInicio: true,
            fechaFin: true,
            ubicacion: true,
            estado: true,
          },
        },
        proveedores: {
          include: {
            proveedor: true,
          },
        },
        lineas: {
          include: {
            tipoPallet: true,
          },
        },
        documentos: {
          orderBy: {
            uploadedAt: 'desc',
          },
        },
        pagos: {
          orderBy: {
            fechaPago: 'desc',
          },
        },
        factoring: {
          include: {
            empresaFactoring: true,
          },
        },
        ordenCompraGenerada: true,
        ordenesCompra: {
          where: { estado: 'RECIBIDA' },
          orderBy: { updatedAt: 'desc' },
          include: {
            proveedor: { select: { razonSocial: true, rut: true } },
            lineas: {
              include: {
                tipoPallet: { select: { nombre: true, codigo: true } },
              },
            },
          },
        },
      },
    })

    if (!operacion) {
      return NextResponse.json(
        { success: false, error: 'Operación no encontrada' },
        { status: 404 }
      )
    }

    const desgloseCompraPorLinea = buildDesgloseCompraOperacionLineas({
      lineasOperacion: operacion.lineas.map((l) => ({
        id: l.id,
        tipoPalletId: l.tipoPalletId,
        presupuestoLineaId: l.presupuestoLineaId,
        cantidad: l.cantidad,
      })),
      ordenesRecibidas: operacion.ordenesCompra.map((oc) => ({
        id: oc.id,
        numero: oc.numero,
        proveedor: { razonSocial: oc.proveedor.razonSocial },
        lineas: oc.lineas,
      })),
    })

    return NextResponse.json({
      success: true,
      data: {
        ...operacion,
        desgloseCompraPorLinea,
      },
    })
  } catch (error) {
    logPrismaKnownRequestError('Error al obtener operación', error)
    console.error('Error al obtener operación:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener operación' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/operaciones/[id]
 * Actualiza una operación
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Verificar que la operación existe y no está cerrada
    const operacionExistente = await prisma.operacion.findUnique({
      where: { id },
      include: {
        lineas: true,
      },
    })

    if (!operacionExistente) {
      return NextResponse.json(
        { success: false, error: 'Operación no encontrada' },
        { status: 404 }
      )
    }

    if (operacionExistente.estadoFinanciero === 'CERRADA') {
      return NextResponse.json(
        { success: false, error: 'No se puede editar una operación cerrada' },
        { status: 400 }
      )
    }

    // Validar datos de entrada
    const validatedData = updateOperacionSchema.parse(body)

    // Preparar datos para actualizar
    const updateData: any = {}

    if (validatedData.tipo) updateData.tipo = validatedData.tipo
    if (validatedData.fecha) updateData.fecha = new Date(validatedData.fecha)
    if (validatedData.direccionEntrega !== undefined) updateData.direccionEntrega = validatedData.direccionEntrega
    if (validatedData.ordenCompraCliente !== undefined) updateData.ordenCompraCliente = validatedData.ordenCompraCliente
    if (validatedData.observaciones !== undefined) updateData.observaciones = validatedData.observaciones
    if (validatedData.clienteId !== undefined) updateData.clienteId = validatedData.clienteId
    if (validatedData.eventoId !== undefined) updateData.eventoId = validatedData.eventoId || null

    // Si se actualizan proveedores
    if (validatedData.proveedores !== undefined) {
      // Eliminar proveedores existentes y crear nuevos
      await prisma.operacionProveedor.deleteMany({
        where: { operacionId: id },
      })
      updateData.proveedores = {
        create: validatedData.proveedores.map((proveedorId) => ({
          proveedorId: proveedorId,
        })),
      }
    }

    // Si se actualizan productos, recalcular totales
    if (validatedData.productos) {
      const tipo = validatedData.tipo || operacionExistente.tipo
      const totales = calcularTotalesOperacion(tipo, validatedData.productos)

      if (tipo === 'COMPRA') {
        updateData.totalCompra = totales.totalCompra
      } else {
        const totalesVenta = totales as any
        updateData.totalVenta = totalesVenta.totalVenta
        updateData.totalCompra = totalesVenta.totalCompra
        updateData.margenBruto = totalesVenta.margenBruto
        updateData.margenPorcentual = totalesVenta.margenPorcentual
      }

      // Eliminar productos existentes y crear nuevos
      await prisma.operacionLinea.deleteMany({
        where: { operacionId: id },
      })

      updateData.lineas = {
        create: validatedData.productos.map((p: any) => ({
          tipoPalletId: p.tipoPalletId,
          cantidad: p.cantidad,
          precioUnitario: p.precioUnitario,
          precioVentaUnitario: p.precioVentaUnitario,
          precioCompraUnitario: p.precioCompraUnitario,
          cantidadEntregada: p.cantidadEntregada || 0,
          cantidadDanada: p.cantidadDanada || 0,
        })),
      }
    }

    // Actualizar operación
    const operacion = await prisma.operacion.update({
      where: { id },
      data: updateData,
      include: {
        cliente: true,
        evento: {
          select: {
            id: true,
            numero: true,
            tipo: true,
            fechaInicio: true,
            fechaFin: true,
            ubicacion: true,
            estado: true,
          },
        },
        proveedores: {
          include: {
            proveedor: true,
          },
        },
        lineas: {
          include: {
            tipoPallet: true,
          },
        },
        documentos: true,
        pagos: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: operacion,
      message: 'Operación actualizada correctamente',
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

    logPrismaKnownRequestError('Error al actualizar operación', error)
    console.error('Error al actualizar operación:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar operación' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/operaciones/[id]
 * Elimina una operación (solo si no tiene documentos ni pagos)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar que la operación existe
    const operacion = await prisma.operacion.findUnique({
      where: { id },
      include: {
        documentos: true,
        pagos: true,
      },
    })

    if (!operacion) {
      return NextResponse.json(
        { success: false, error: 'Operación no encontrada' },
        { status: 404 }
      )
    }

    if (operacion.estadoFinanciero === 'CERRADA') {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar una operación cerrada' },
        { status: 400 }
      )
    }

    // Verificar que no tenga documentos ni pagos
    if (operacion.documentos.length > 0 || operacion.pagos.length > 0) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar una operación con documentos o pagos asociados' },
        { status: 400 }
      )
    }

    const ordenesCompraAsociadas = await prisma.ordenCompra.count({
      where: { operacionId: id },
    })

    if (ordenesCompraAsociadas > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'No se puede eliminar: existen órdenes de compra asociadas a esta operación. Elimínelas o desvincúlelas primero.',
        },
        { status: 400 }
      )
    }

    // Eliminar proveedores, productos y operación
    // Los proveedores y productos se eliminarán automáticamente por CASCADE
    await prisma.operacion.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Operación eliminada correctamente',
    })
  } catch (error) {
    logPrismaKnownRequestError('Error al eliminar operación', error)
    console.error('Error al eliminar operación:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar operación' },
      { status: 500 }
    )
  }
}

