import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { cerrarOperacionSchema } from '@/lib/validations/operacion'

/**
 * PATCH /api/operaciones/[id]/cerrar
 * Cierra una operación (requiere observación de cierre)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validar datos
    const validatedData = cerrarOperacionSchema.parse(body)

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

    // Verificar que no esté ya cerrada
    if (operacion.estadoFinanciero === 'CERRADA') {
      return NextResponse.json(
        { success: false, error: 'La operación ya está cerrada' },
        { status: 400 }
      )
    }

    // Cerrar operación
    const operacionCerrada = await prisma.operacion.update({
      where: { id },
      data: {
        estadoFinanciero: 'CERRADA',
        observacionCierre: validatedData.observacionCierre,
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
        documentos: true,
        pagos: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: operacionCerrada,
      message: 'Operación cerrada correctamente',
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

    console.error('Error al cerrar operación:', error)
    return NextResponse.json(
      { success: false, error: 'Error al cerrar operación' },
      { status: 500 }
    )
  }
}

