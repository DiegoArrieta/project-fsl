'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { SolicitudCotizacionForm } from '@/components/solicitudes-cotizacion/SolicitudCotizacionForm'
import type { CreateSolicitudCotizacionInput } from '@/lib/validations/solicitud-cotizacion'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function crear(payload: CreateSolicitudCotizacionInput) {
  const res = await fetch('/api/solicitudes-cotizacion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      observaciones: payload.observaciones === '' ? null : payload.observaciones,
      lineas: payload.lineas.map((l) => ({
        ...l,
        descripcion: l.descripcion === '' || !l.descripcion ? null : l.descripcion,
      })),
    }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error || 'Error al crear solicitud')
  }
  return res.json()
}

export default function NuevaSolicitudCotizacionPage() {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: crear,
    onSuccess: (json) => {
      toast.success('Solicitud creada')
      router.push(`/solicitudes-cotizacion/${json.data.id}`)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/solicitudes-cotizacion">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nueva solicitud a proveedor</h1>
          <p className="text-muted-foreground mt-2">Indica proveedor, fecha y cantidades por tipo de pallet.</p>
        </div>
      </div>

      <SolicitudCotizacionForm
        onSubmit={async (data) => {
          await mutation.mutateAsync(data)
        }}
        onCancel={() => router.push('/solicitudes-cotizacion')}
        isLoading={mutation.isPending}
      />
    </div>
  )
}
