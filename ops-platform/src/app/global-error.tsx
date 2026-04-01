'use client'

import './globals.css'
import { AppErrorFallback } from '@/components/shared/app-error-fallback'

/**
 * Errores en el layout raíz (fuera del alcance de error.tsx). Incluye html/body propios.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen bg-background text-foreground">
        <AppErrorFallback error={error} reset={reset} />
      </body>
    </html>
  )
}
