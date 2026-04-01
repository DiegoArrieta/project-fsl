'use client'

import { AppErrorFallback } from '@/components/shared/app-error-fallback'

/**
 * Límite de errores del segmento raíz: captura errores de ejecución en páginas y layouts hijos.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <AppErrorFallback error={error} reset={reset} />
}
