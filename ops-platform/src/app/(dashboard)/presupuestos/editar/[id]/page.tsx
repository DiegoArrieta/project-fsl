'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { segmentoRutaParam } from '@/lib/presupuestos/segmento-ruta'

/**
 * Compatibilidad: algunos enlaces o favoritos usan /presupuestos/editar/:id
 * La ruta canónica es /presupuestos/:id/editar
 */
export default function PresupuestoEditarRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const rawId = segmentoRutaParam(params.id)

  useEffect(() => {
    if (!rawId) return
    router.replace(`/presupuestos/${encodeURIComponent(rawId)}/editar`)
  }, [rawId, router])

  if (!rawId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[240px] gap-2 text-sm text-muted-foreground">
        <p>Falta el identificador del presupuesto en la URL.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[240px] gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      <p className="text-sm">Redirigiendo al editor…</p>
    </div>
  )
}
