'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Package, Building2, ChevronRight, Edit } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface EntregaCardProps {
  id: string
  fechaHora: Date | string
  tipoEntrega: 'COMPLETA' | 'PARCIAL' | 'DEVOLUCION' | 'OTRO'
  cantidad: number
  unidad: string
  estado: 'PENDIENTE' | 'EN_TRANSITO' | 'COMPLETADA' | 'RECHAZADA'
  empresaNombre?: string | null
  empresaReceptoraNombre?: string | null
  descripcion?: string | null
  observaciones?: string | null
}

const tipoEntregaLabels: Record<string, string> = {
  COMPLETA: 'Completa',
  PARCIAL: 'Parcial',
  DEVOLUCION: 'Devolución',
  OTRO: 'Otro',
}

const tipoEntregaColors: Record<string, string> = {
  COMPLETA: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  PARCIAL: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  DEVOLUCION: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  OTRO: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

const estadoEntregaLabels: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_TRANSITO: 'En Tránsito',
  COMPLETADA: 'Completada',
  RECHAZADA: 'Rechazada',
}

const estadoEntregaColors: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  EN_TRANSITO: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  COMPLETADA: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  RECHAZADA: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export function EntregaCard({
  id,
  fechaHora,
  tipoEntrega,
  cantidad,
  unidad,
  estado,
  empresaNombre,
  empresaReceptoraNombre,
  descripcion,
  observaciones,
}: EntregaCardProps) {
  const fechaHoraDate = typeof fechaHora === 'string' ? new Date(fechaHora) : fechaHora

  return (
    <Card className="group hover:shadow-xl transition-all duration-200 border-l-4 border-l-primary/50 hover:border-l-primary">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Badge className={tipoEntregaColors[tipoEntrega]}>{tipoEntregaLabels[tipoEntrega]}</Badge>
            <Badge className={estadoEntregaColors[estado]}>{estadoEntregaLabels[estado]}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fecha y Hora */}
        <div className="flex items-start gap-2 p-3 bg-accent rounded-lg border border-border">
          <Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm space-y-0.5">
            <div className="font-medium">
              {format(fechaHoraDate, 'dd/MM/yyyy HH:mm')}
            </div>
          </div>
        </div>

        {/* Empresas */}
        <div className="space-y-2">
          {empresaNombre && (
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-950/30 rounded">
                <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-medium">De: {empresaNombre}</span>
            </div>
          )}
          {empresaReceptoraNombre && (
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-green-50 dark:bg-green-950/30 rounded">
                <Building2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-medium">A: {empresaReceptoraNombre}</span>
            </div>
          )}
        </div>

        {/* Cantidad */}
        <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <Package className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">
            {cantidad} {unidad}
          </span>
        </div>

        {/* Descripción */}
        {descripcion && (
          <div className="text-sm text-muted-foreground line-clamp-2">{descripcion}</div>
        )}

        {/* Observaciones */}
        {observaciones && (
          <div className="text-sm text-muted-foreground italic line-clamp-2">
            <strong>Obs:</strong> {observaciones}
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" asChild className="flex-1 hover:bg-accent hover:text-accent-foreground">
            <Link href={`/entregas/${id}/editar`}>
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
            <Link href={`/entregas/${id}`} className="flex items-center justify-center gap-1">
              Ver detalles
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

