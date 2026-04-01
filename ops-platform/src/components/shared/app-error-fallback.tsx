'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export interface AppErrorFallbackProps {
  error: Error & { digest?: string }
  reset: () => void
}

export function AppErrorFallback({ error, reset }: AppErrorFallbackProps) {
  useEffect(() => {
    console.error('[Error aplicación]', error)
  }, [error])

  const isDev = process.env.NODE_ENV === 'development'
  const digest = 'digest' in error && error.digest ? String(error.digest) : null

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="w-full max-w-lg border-destructive/20 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden />
          </div>
          <CardTitle className="text-xl">Algo salió mal</CardTitle>
          <CardDescription className="text-base">
            Ocurrió un error al mostrar esta pantalla. Puede intentar de nuevo o volver al inicio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {digest && (
            <p className="text-xs text-muted-foreground text-center font-mono break-all">
              Referencia: {digest}
            </p>
          )}
          {isDev && error.message ? (
            <details className="rounded-md border bg-muted/50 p-3 text-left">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                Detalle técnico (solo desarrollo)
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words text-xs text-destructive">
                {error.message}
              </pre>
            </details>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button type="button" onClick={() => reset()} className="w-full sm:w-auto gap-2">
            <RefreshCw className="h-4 w-4" aria-hidden />
            Reintentar
          </Button>
          <Button variant="outline" type="button" className="w-full sm:w-auto gap-2" asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4" aria-hidden />
              Ir al panel
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
