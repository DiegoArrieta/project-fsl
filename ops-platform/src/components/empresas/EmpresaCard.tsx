'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRutForDisplay } from '@/lib/validations/rut'
import { MapPin, Phone, Mail, Building2, ChevronRight, Edit } from 'lucide-react'
import Link from 'next/link'

interface EmpresaCardProps {
  id: string
  nombre: string
  rut: string
  tipoEmpresa: 'PROVEEDOR' | 'CLIENTE' | 'TRANSPORTISTA' | 'OTRO'
  contacto?: string | null
  direccion?: string | null
  telefono?: string | null
  email?: string | null
  estado: 'ACTIVA' | 'INACTIVA'
  totalOperaciones?: number
}

const tipoEmpresaLabels: Record<string, string> = {
  PROVEEDOR: 'Proveedor',
  CLIENTE: 'Cliente',
  TRANSPORTISTA: 'Transportista',
  OTRO: 'Otro',
}

const tipoEmpresaColors: Record<string, string> = {
  PROVEEDOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  CLIENTE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  TRANSPORTISTA: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  OTRO: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

export function EmpresaCard({
  id,
  nombre,
  rut,
  tipoEmpresa,
  contacto,
  direccion,
  telefono,
  email,
  estado,
  totalOperaciones = 0,
}: EmpresaCardProps) {
  const rutFormateado = formatRutForDisplay(rut)

  return (
    <Card className="group hover:shadow-xl transition-all duration-200 border-l-4 border-l-primary/50 hover:border-l-primary">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
            {nombre}
          </h3>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">RUT</span>
            <span className="text-sm font-mono font-semibold">{rutFormateado}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <Badge variant={estado === 'ACTIVA' ? 'default' : 'secondary'} className="flex-shrink-0">
            {estado === 'ACTIVA' ? 'Activa' : 'Inactiva'}
          </Badge>
          <Badge className={`flex-shrink-0 ${tipoEmpresaColors[tipoEmpresa]}`}>
            {tipoEmpresaLabels[tipoEmpresa]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contacto */}
        {contacto && (
          <div className="flex items-start gap-2 p-3 bg-accent rounded-lg border border-border">
            <Building2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm font-medium">{contacto}</div>
          </div>
        )}

        {/* Ubicación */}
        {direccion && (
          <div className="flex items-start gap-2 p-3 bg-accent rounded-lg border border-border">
            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">{direccion}</div>
          </div>
        )}

        {/* Contacto */}
        <div className="space-y-2">
          {telefono && (
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-950/30 rounded">
                <Phone className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-medium">{telefono}</span>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-green-50 dark:bg-green-950/30 rounded">
                <Mail className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-medium truncate">{email}</span>
            </div>
          )}
        </div>

        {/* Operaciones */}
        {totalOperaciones > 0 && (
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">
              {totalOperaciones} operación{totalOperaciones !== 1 ? 'es' : ''}
            </span>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" asChild className="flex-1 hover:bg-accent hover:text-accent-foreground">
            <Link href={`/empresas/${id}/editar`}>
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
            <Link href={`/empresas/${id}`} className="flex items-center justify-center gap-1">
              Ver detalles
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

