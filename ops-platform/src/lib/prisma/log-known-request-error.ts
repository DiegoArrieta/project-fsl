import { Prisma } from '@prisma/client'

/**
 * Registra PrismaClientKnownRequestError con `meta` serializado.
 * Útil para P2022 cuando el mensaje muestra "(not available)" y el nombre real va en meta.
 */
export function logPrismaKnownRequestError(context: string, error: unknown): void {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return
  console.error(
    `${context} [Prisma ${error.code}] meta:`,
    JSON.stringify(error.meta, null, 2)
  )
  if (error.code === 'P2022')
    console.error(
      `${context}: P2022 — columna o relación ausente en BD respecto al schema; revisar migrate deploy.`
    )
}
