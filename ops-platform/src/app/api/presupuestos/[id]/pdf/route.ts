import { NextRequest, NextResponse } from 'next/server'
import { PresupuestosController } from '@/modules/presupuestos/api/presupuestos.controller'

const controller = new PresupuestosController()

/**
 * GET /api/presupuestos/:id/pdf
 * Genera el PDF del presupuesto
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return controller.generatePDF(id)
}

