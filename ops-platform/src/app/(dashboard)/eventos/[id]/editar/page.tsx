'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { EventoForm } from '@/components/eventos/EventoForm'
import { type EventoInput } from '@/lib/validations/evento'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function obtenerEvento(id: string) {
  const response = await fetch(`/api/eventos/${id}`)
  if (!response.ok) {
    throw new Error('Evento no encontrado')
  }
  const result = await response.json()
  return result.data
}

async function actualizarEvento(id: string, data: EventoInput) {
  const response = await fetch(`/api/eventos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al actualizar evento')
  }

  return response.json()
}

export default function EditarEventoPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: evento, isLoading } = useQuery({
    queryKey: ['evento', id],
    queryFn: () => obtenerEvento(id),
  })

  const mutation = useMutation({
    mutationFn: (data: EventoInput) => actualizarEvento(id, data),
    onSuccess: () => {
      toast.success('Evento actualizado correctamente')
      router.push(`/eventos/${id}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!evento) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Evento no encontrado</p>
          <Button asChild className="mt-4">
            <Link href="/eventos">Volver a Eventos</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/eventos/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Evento</h1>
          <p className="text-muted-foreground mt-2">Modifica los datos del evento</p>
        </div>
      </div>

      <EventoForm
        initialData={evento}
        onSubmit={async (data) => {
          await mutation.mutateAsync(data)
        }}
        onCancel={() => router.push(`/eventos/${id}`)}
        isLoading={mutation.isPending}
      />
    </div>
  )
}

