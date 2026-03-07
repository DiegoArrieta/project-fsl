'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Calculator, ChevronRight, Edit, FileText } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface PresupuestoCardProps {
  id: string
  numero: string
  clienteNombre: string
  fecha: Date | string
  total: number
  estado: 'BORRADOR' | 'ENVIADO' | 'ACEPTADO' | 'RECHAZADO'
  ciudad?: string | null
}

const estadoLabels: Record<string, string> = {
  BORRADOR: 'Borrador',
  ENVIADO: 'Enviado',
  ACEPTADO: 'Aceptado',
  RECHAZADO: 'Rechazado',
}

const estadoColors: Record<string, string> = {
  BORRADOR: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  ENVIADO: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ACEPTADO: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  RECHAZADO: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export function PresupuestoCard({
  id,
  numero,
  clienteNombre,
  fecha,
  total,
  estado,
  ciudad,
}: PresupuestoCardProps) {
  const fechaDate = typeof fecha === 'string' ? new Date(fecha) : fecha

  return (
    <Card className="group hover:shadow-xl transition-all duration-200 border-l-4 border-l-primary/50 hover:border-l-primary">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
              {numero}
            </h3>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">{clienteNombre}</p>
        </div>
        <Badge className={`flex-shrink-0 ${estadoColors[estado]}`}>
          {estadoLabels[estado]}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(fechaDate, 'dd/MM/yyyy', { locale: es })}</span>
          </div>
          {ciudad && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{ciudad}</span>
            </div>
          )}
        </div>

        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Presupuesto</p>
          <p className="text-xl font-bold text-primary">
            {total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
          </p>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" asChild className="flex-1 hover:bg-accent">
            <Link href={`/presupuestos/${id}/editar`}>
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
            <Link href={`/presupuestos/${id}`} className="flex items-center justify-center gap-1">
              Detalles
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

