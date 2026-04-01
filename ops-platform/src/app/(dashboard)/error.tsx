'use client'

import { Header } from '@/components/shared/Header'
import { Navbar } from '@/components/shared/Navbar'
import { AppErrorFallback } from '@/components/shared/app-error-fallback'

/**
 * Errores dentro del dashboard: se mantiene cabecera y menú.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      <Navbar />
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <AppErrorFallback error={error} reset={reset} />
      </main>
    </div>
  )
}
