'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Package, ChevronRight, Edit } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface EventoCardProps {
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

const tipoEventoLabels: Record<string, string> = {
  ENTREGA: 'Entrega',
  RECEPCION: 'Recepción',
  TRASLADO: 'Traslado',
  OTRO: 'Otro',
}

const tipoEventoColors: Record<string, string> = {
  ENTREGA: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  RECEPCION: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  TRASLADO: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  OTRO: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

const estadoEventoLabels: Record<string, string> = {
  PLANIFICADO: 'Planificado',
  EN_CURSO: 'En Curso',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
}

const estadoEventoColors: Record<string, string> = {
  PLANIFICADO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  EN_CURSO: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  COMPLETADO: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CANCELADO: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export function EventoCard({
  id,
  numero,
  tipo,
  fechaInicio,
  fechaFin,
  ubicacion,
  descripcion,
  estado,
  totalEntregas = 0,
}: EventoCardProps) {
  const fechaInicioDate = typeof fechaInicio === 'string' ? new Date(fechaInicio) : fechaInicio
  const fechaFinDate = fechaFin ? (typeof fechaFin === 'string' ? new Date(fechaFin) : fechaFin) : null

  return (
    <Card className="group hover:shadow-xl transition-all duration-200 border-l-4 border-l-primary/50 hover:border-l-primary">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
            {numero}
          </h3>
          <div className="flex items-center gap-2 pt-1">
            <Badge className={tipoEventoColors[tipo]}>{tipoEventoLabels[tipo]}</Badge>
            <Badge className={estadoEventoColors[estado]}>{estadoEventoLabels[estado]}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fechas */}
        <div className="flex items-start gap-2 p-3 bg-accent rounded-lg border border-border">
          <Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm space-y-0.5">
            <div className="font-medium">
              Inicio: {format(fechaInicioDate, 'dd/MM/yyyy')}
            </div>
            {fechaFinDate && (
              <div className="text-muted-foreground">
                Fin: {format(fechaFinDate, 'dd/MM/yyyy')}
              </div>
            )}
          </div>
        </div>

        {/* Ubicación */}
        {ubicacion && (
          <div className="flex items-start gap-2 p-3 bg-accent rounded-lg border border-border">
            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">{ubicacion}</div>
          </div>
        )}

        {/* Descripción */}
        {descripcion && (
          <div className="text-sm text-muted-foreground line-clamp-2">{descripcion}</div>
        )}

        {/* Entregas */}
        {totalEntregas > 0 && (
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <Package className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">
              {totalEntregas} entrega{totalEntregas !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" asChild className="flex-1 hover:bg-accent hover:text-accent-foreground">
            <Link href={`/eventos/${id}/editar`}>
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Editar
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            <Link href={`/eventos/${id}`} className="flex items-center justify-center gap-1">
              Ver detalles
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

