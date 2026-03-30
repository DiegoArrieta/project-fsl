import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createFactoringSchema, updateFactoringSchema } from '@/lib/validations/factoring'
import {
  actualizarFactoringOperacion,
  crearFactoringOperacion,
} from '@/lib/factoring/operacion-factoring.service'

/**
 * POST /api/operaciones/:id/factoring
 * (Delega en el mismo servicio que POST /api/factoring)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: operacionId } = await params
    const body = await request.json()
    const data = createFactoringSchema.parse(body)

    const result = await crearFactoringOperacion(operacionId, data)
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status })
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: 'Factoring registrado correctamente',
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      )
    }
    console.error('Error al crear factoring:', error)
    return NextResponse.json({ success: false, error: 'Error al registrar factoring' }, { status: 500 })
  }
}

/**
 * PUT /api/operaciones/:id/factoring
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: operacionId } = await params
    const body = await request.json()
    const data = updateFactoringSchema.parse(body)

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay campos para actualizar' },
        { status: 400 }
      )
    }

    const result = await actualizarFactoringOperacion(operacionId, data)
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Factoring actualizado correctamente',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      )
    }
    console.error('Error al actualizar factoring:', error)
    return NextResponse.json({ success: false, error: 'Error al actualizar factoring' }, { status: 500 })
  }
}
