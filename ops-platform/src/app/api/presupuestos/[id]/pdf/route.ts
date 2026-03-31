import { PresupuestosController } from '@/modules/presupuestos/api/presupuestos.controller'

const controller = new PresupuestosController()

/**
 * GET /api/presupuestos/:id/pdf
 * Genera el PDF del presupuesto
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return controller.generatePDF(id)
}

