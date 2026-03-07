import { NextRequest, NextResponse } from 'next/server'
import { PresupuestosController } from '@/modules/presupuestos/api/presupuestos.controller'

const controller = new PresupuestosController()

/**
 * GET /api/presupuestos/:id
 * Obtiene un presupuesto por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return controller.getById(id)
}

/**
 * PUT /api/presupuestos/:id
 * Actualiza un presupuesto
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return controller.update(id, request)
}

