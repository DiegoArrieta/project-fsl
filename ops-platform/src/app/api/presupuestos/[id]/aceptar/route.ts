import { NextRequest, NextResponse } from 'next/server'
import { PresupuestosController } from '@/modules/presupuestos/api/presupuestos.controller'

const controller = new PresupuestosController()

/**
 * POST /api/presupuestos/:id/aceptar
 * Acepta un presupuesto y crea una operación asociada
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return controller.aceptar(id)
}

