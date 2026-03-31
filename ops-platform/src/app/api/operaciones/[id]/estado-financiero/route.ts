import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { updateEstadoFinancieroSchema } from '@/lib/validations/operacion'

/**
 * PATCH /api/operaciones/[id]/estado-financiero
 * Actualiza el estado financiero de una operación
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validar datos
    const validatedData = updateEstadoFinancieroSchema.parse(body)

    // Verificar que la operación existe
    const operacion = await prisma.operacion.findUnique({
      where: { id },
    })

    if (!operacion) {
      return NextResponse.json(
        { success: false, error: 'Operación no encontrada' },
        { status: 404 }
      )
    }

    // Si se está cerrando, no permitir volver atrás
    if (operacion.estadoFinanciero === 'CERRADA' && validatedData.estadoFinanciero !== 'CERRADA') {
      return NextResponse.json(
        { success: false, error: 'No se puede reabrir una operación cerrada' },
        { status: 400 }
      )
    }

    // Actualizar estado
    const operacionActualizada = await prisma.operacion.update({
      where: { id },
      data: {
        estadoFinanciero: validatedData.estadoFinanciero,
      },
      include: {
        cliente: true,
        proveedores: {
          include: { proveedor: true },
        },
        lineas: {
          include: {
            tipoPallet: true,
          },
        },
        pagos: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: operacionActualizada,
      message: 'Estado financiero actualizado correctamente',
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

    console.error('Error al actualizar estado financiero:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar estado financiero' },
      { status: 500 }
    )
  }
}

