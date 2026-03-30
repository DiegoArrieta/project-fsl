import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createFactoringConOperacionSchema,
  updateFactoringConOperacionSchema,
} from '@/lib/validations/factoring'
import {
  actualizarFactoringOperacion,
  crearFactoringOperacion,
} from '@/lib/factoring/operacion-factoring.service'

/**
 * POST /api/factoring
 * Body: { operacionId, ...campos de createFactoringSchema }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createFactoringConOperacionSchema.parse(body)
    const { operacionId, ...data } = parsed

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
 * PUT /api/factoring
 * Body: { operacionId, ...campos parciales }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = updateFactoringConOperacionSchema.parse(body)
    const { operacionId, ...data } = parsed

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
