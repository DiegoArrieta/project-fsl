import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { updateEstadoDocumentalSchema } from '@/lib/validations/operacion'

/**
 * PATCH /api/operaciones/[id]/estado-documental
 * Actualiza el estado documental de una operación
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validar datos
    const validatedData = updateEstadoDocumentalSchema.parse(body)

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

    // Actualizar estado
    const operacionActualizada = await prisma.operacion.update({
      where: { id },
      data: {
        estadoDocumental: validatedData.estadoDocumental,
      },
      include: {
        cliente: true,
        proveedor: true,
        lineas: {
          include: {
            tipoPallet: true,
          },
        },
        documentos: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: operacionActualizada,
      message: 'Estado documental actualizado correctamente',
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

    console.error('Error al actualizar estado documental:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar estado documental' },
      { status: 500 }
    )
  }
}

