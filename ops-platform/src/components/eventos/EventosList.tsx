'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EventoCard } from './EventoCard'
import { Search, Plus, Calendar, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Evento {
  id: string
  numero: string
  tipo: 'ENTREGA' | 'RECEPCION' | 'TRASLADO' | 'OTRO'
  fechaInicio: Date | string
  fechaFin?: Date | string | null
  ubicacion?: string | null
  descripcion?: string | null
  estado: 'PLANIFICADO' | 'EN_CURSO' | 'COMPLETADO' | 'CANCELADO'
  totalEntregas?: number
}

interface EventosResponse {
  success: boolean
  data: Evento[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

async function fetchEventos(
  buscar: string,
  tipo: string | null,
  estado: string | null
): Promise<EventosResponse> {
  const params = new URLSearchParams()
  if (buscar) params.set('buscar', buscar)
  if (tipo) params.set('tipo', tipo)
  if (estado) params.set('estado', estado)

  const response = await fetch(`/api/eventos?${params.toString()}`)

  if (!response.ok) {
    throw new Error('Error al cargar eventos')
  }

  return response.json()
}

export function EventosList() {
  const [buscar, setBuscar] = useState('')
  const [tipo, setTipo] = useState<string | null>(null)
  const [estado, setEstado] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['eventos', buscar, tipo, estado],
    queryFn: () => fetchEventos(buscar, tipo, estado),
  })

  if (error) {
    toast.error('Error al cargar eventos')
  }

  const eventos = data?.data || []
  const total = data?.meta.total || 0

  const LoadingState = () => (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando eventos...</p>
      </CardContent>
    </Card>
  )

  const EmptyState = () => (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-semibold mb-2">No hay eventos</p>
        <p className="text-muted-foreground text-center mb-4">
          {buscar || tipo || estado
            ? 'No se encontraron eventos con los filtros aplicados'
            : 'Comienza agregando tu primer evento'}
        </p>
        {!buscar && !tipo && !estado && (
          <Button asChild>
            <Link href="/eventos/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Evento
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los eventos de entrega, recepción y traslado
          </p>
        </div>
        <Button asChild>
          <Link href="/eventos/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Evento
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, ubicación..."
                  value={buscar}
                  onChange={(e) => setBuscar(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={tipo || 'all'}
              onValueChange={(value) => setTipo(value === 'all' ? null : value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="ENTREGA">Entrega</SelectItem>
                <SelectItem value="RECEPCION">Recepción</SelectItem>
                <SelectItem value="TRASLADO">Traslado</SelectItem>
                <SelectItem value="OTRO">Otro</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={estado || 'all'}
              onValueChange={(value) => setEstado(value === 'all' ? null : value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PLANIFICADO">Planificado</SelectItem>
                <SelectItem value="EN_CURSO">En Curso</SelectItem>
                <SelectItem value="COMPLETADO">Completado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <div>
        {isLoading ? (
          <LoadingState />
        ) : eventos.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Mostrando {eventos.length} de {total} evento{total !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventos.map((evento) => (
                <EventoCard key={evento.id} {...evento} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

