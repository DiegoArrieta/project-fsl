import { prisma } from '@/lib/db'

/**
 * Obtiene el id de la operación ligada al presupuesto (Operacion.presupuestoId es único).
 * Si aún no existe operación para ese presupuesto, devuelve null.
 */
export async function resolveOperacionIdFromPresupuestoId(
  presupuestoId: string
): Promise<string | null> {
  const operacion = await prisma.operacion.findUnique({
    where: { presupuestoId },
    select: { id: true },
  })
  return operacion?.id ?? null
}
