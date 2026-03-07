'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { EventoForm } from '@/components/eventos/EventoForm'
import { EntregaCard } from '@/components/entregas/EntregaCard'
import { type EventoInput } from '@/lib/validations/evento'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

async function obtenerEvento(id: string) {
  const response = await fetch(`/api/eventos/${id}`)
  if (!response.ok) {
    throw new Error('Evento no encontrado')
  }
  const result = await response.json()
  return result.data
}

async function obtenerEntregas(eventoId: string) {
  const response = await fetch(`/api/eventos/${eventoId}/entregas`)
  if (!response.ok) {
    return []
  }
  const result = await response.json()
  return result.data || []
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

const tipoEventoLabels: Record<string, string> = {
  ENTREGA: 'Entrega',
  RECEPCION: 'Recepción',
  TRASLADO: 'Traslado',
  OTRO: 'Otro',
}

const estadoEventoLabels: Record<string, string> = {
  PLANIFICADO: 'Planificado',
  EN_CURSO: 'En Curso',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
}

export default function EventoDetallePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: evento, isLoading } = useQuery({
    queryKey: ['evento', id],
    queryFn: () => obtenerEvento(id),
  })

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas', id],
    queryFn: () => obtenerEntregas(id),
    enabled: !!evento,
  })

  const mutation = useMutation({
    mutationFn: (data: EventoInput) => actualizarEvento(id, data),
    onSuccess: () => {
      toast.success('Evento actualizado correctamente')
      router.push('/eventos')
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

  const fechaInicio = evento.fechaInicio
    ? typeof evento.fechaInicio === 'string'
      ? new Date(evento.fechaInicio)
      : evento.fechaInicio
    : null
  const fechaFin = evento.fechaFin
    ? typeof evento.fechaFin === 'string'
      ? new Date(evento.fechaFin)
      : evento.fechaFin
    : null

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/eventos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{evento.numero}</h1>
          <p className="text-muted-foreground mt-2">
            {tipoEventoLabels[evento.tipo]} | {estadoEventoLabels[evento.estado]}
          </p>
        </div>
        <Badge>{estadoEventoLabels[evento.estado]}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <EventoForm
            initialData={evento}
            onSubmit={async (data) => {
              await mutation.mutateAsync(data)
            }}
            onCancel={() => router.push('/eventos')}
            isLoading={mutation.isPending}
          />

          {/* Entregas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Entregas ({entregas.length})</CardTitle>
              <Button asChild size="sm">
                <Link href={`/eventos/${id}/entregas/nueva`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Entrega
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {entregas.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay entregas registradas para este evento
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entregas.map((entrega: any) => (
                    <EntregaCard key={entrega.id} {...entrega} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fechaInicio && (
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
                  <p className="text-lg font-semibold">
                    {format(fechaInicio, 'dd/MM/yyyy')}
                  </p>
                </div>
              )}
              {fechaFin && (
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Fin</p>
                  <p className="text-lg font-semibold">
                    {format(fechaFin, 'dd/MM/yyyy')}
                  </p>
                </div>
              )}
              {evento.ubicacion && (
                <div>
                  <p className="text-sm text-muted-foreground">Ubicación</p>
                  <p className="text-lg font-semibold">{evento.ubicacion}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Total de Entregas</p>
                <p className="text-2xl font-bold">{entregas.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

