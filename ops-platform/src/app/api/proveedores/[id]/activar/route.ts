import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const activarSchema = z.object({
  activo: z.boolean(),
})

/**
 * PATCH /api/proveedores/[id]/activar
 * Activar o desactivar proveedor
 */
export async function PATCH(
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
    const { activo } = activarSchema.parse(body)

    // Verificar que el proveedor exista
    const proveedor = await prisma.proveedor.findUnique({
      where: { id },
    })

    if (!proveedor) {
      return NextResponse.json(
        { success: false, error: 'Proveedor no encontrado' },
        { status: 404 }
      )
    }

    // Validar que no se desactive si tiene operaciones abiertas
    if (!activo) {
      const operacionesAbiertas = await prisma.operacion.count({
        where: {
          proveedorId: id,
          estadoFinanciero: { not: 'CERRADA' },
        },
      })

      if (operacionesAbiertas > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `No se puede desactivar el proveedor. Tiene ${operacionesAbiertas} operación(es) abierta(s)`,
          },
          { status: 400 }
        )
      }
    }

    // Actualizar estado
    const updated = await prisma.proveedor.update({
      where: { id },
      data: { activo },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        activo: updated.activo,
        message: `Proveedor ${activo ? 'activado' : 'desactivado'} correctamente`,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error al actualizar estado del proveedor:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar estado del proveedor' },
      { status: 500 }
    )
  }
}

