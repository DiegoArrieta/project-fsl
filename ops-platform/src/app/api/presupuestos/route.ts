import { NextRequest, NextResponse } from 'next/server'
import { PresupuestosController } from '@/modules/presupuestos/api/presupuestos.controller'

const controller = new PresupuestosController()

/**
 * GET /api/presupuestos
 * Lista presupuestos con filtros y paginación
 */
export async function GET(request: NextRequest) {
  return controller.list(request)
}

/**
 * POST /api/presupuestos
 * Crea un nuevo presupuesto
 */
export async function POST(request: NextRequest) {
  return controller.create(request)
}

