'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PresupuestoForm } from '@/components/presupuestos/PresupuestoForm'
import { type UpdatePresupuestoDto } from '@/modules/presupuestos/dto/create-presupuesto.dto'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { segmentoRutaParam } from '@/lib/presupuestos/segmento-ruta'
import { aceptarPresupuestoPorId } from '@/lib/presupuestos/aceptar-presupuesto-api'

async function obtenerPresupuesto(id: string) {
  const response = await fetch(`/api/presupuestos/${encodeURIComponent(id)}`, { credentials: 'include' })
  if (!response.ok) {
    throw new Error('Presupuesto no encontrado')
  }
  const result = await response.json()
  return result.data
}

async function actualizarPresupuesto(id: string, data: UpdatePresupuestoDto) {
  const response = await fetch(`/api/presupuestos/${encodeURIComponent(id)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al actualizar presupuesto')
  }

  return response.json()
}

export default function EditarPresupuestoPage() {
  const params = useParams()
  const router = useRouter()
  const id = segmentoRutaParam(params.id)
  const queryClient = useQueryClient()

  const { data: presupuesto, isLoading, error } = useQuery({
    queryKey: ['presupuesto', id],
    queryFn: () => obtenerPresupuesto(id),
    enabled: Boolean(id),
  })

  const mutation = useMutation({
    mutationFn: (data: UpdatePresupuestoDto) => actualizarPresupuesto(id, data),
    onSuccess: () => {
      toast.success('Presupuesto actualizado correctamente')
      queryClient.invalidateQueries({ queryKey: ['presupuesto', id] })
      router.push(`/presupuestos/${id}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const acceptMutation = useMutation({
    mutationFn: () => {
      const pid = presupuesto?.id ?? id
      if (!pid) {
        return Promise.reject(new Error('Presupuesto no cargado'))
      }
      return aceptarPresupuestoPorId(pid)
    },
    onSuccess: (response) => {
      toast.success('Presupuesto aceptado correctamente')
      queryClient.invalidateQueries({ queryKey: ['presupuesto', id] })
      queryClient.invalidateQueries({ queryKey: ['operaciones'] })
      router.push(`/operaciones/${response.data.operacionId}`)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  if (!id) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">La URL del presupuesto no es válida.</p>
          <Button asChild className="mt-4">
            <Link href="/presupuestos">Volver a Presupuestos</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !presupuesto) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Presupuesto no encontrado</p>
          <Button asChild className="mt-4">
            <Link href="/presupuestos">Volver a Presupuestos</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (presupuesto.estado !== 'BORRADOR') {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Este presupuesto no puede ser editado porque ya ha sido enviado o aceptado.</p>
          <Button asChild className="mt-4">
            <Link href={`/presupuestos/${presupuesto.id}`}>Volver al detalle</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/presupuestos/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Presupuesto {presupuesto.numero}</h1>
          <p className="text-muted-foreground mt-2">Modifica los ítems o información de la cotización</p>
        </div>
      </div>

      <PresupuestoForm
        initialData={presupuesto}
        onSubmit={async (data) => {
          await mutation.mutateAsync(data)
        }}
        onCancel={() => router.push(`/presupuestos/${presupuesto.id}`)}
        isLoading={mutation.isPending}
        footerExtra={
          <Button
            type="button"
            onClick={() => acceptMutation.mutate()}
            disabled={acceptMutation.isPending || mutation.isPending}
            className="bg-green-600 hover:bg-green-700 sm:min-w-48"
            aria-label="Aceptar presupuesto y crear operación de venta"
          >
            {acceptMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" aria-hidden />
            )}
            Aceptar y crear operación
          </Button>
        }
      />
    </div>
  )
}

