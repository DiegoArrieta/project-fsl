'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRutForDisplay } from '@/lib/validations/rut'
import { MapPin, Phone, Mail, Package, ChevronRight, Edit } from 'lucide-react'
import Link from 'next/link'

interface ContactoCardProps {
  id: string
  rut: string
  razonSocial: string
  nombreFantasia?: string | null
  direccion?: string | null
  comuna?: string | null
  ciudad?: string | null
  telefono?: string | null
  email?: string | null
  activo: boolean
  totalOperaciones: number
  tipo: 'proveedor' | 'cliente'
}

export function ContactoCard({
  id,
  rut,
  razonSocial,
  nombreFantasia,
  direccion,
  comuna,
  ciudad,
  telefono,
  email,
  activo,
  totalOperaciones,
  tipo: _tipo,
}: ContactoCardProps) {
  const rutFormateado = formatRutForDisplay(rut)
  const ubicacion = [comuna, ciudad].filter(Boolean).join(', ')

  return (
    <Card className="group hover:shadow-xl transition-all duration-200 border-l-4 border-l-primary/50 hover:border-l-primary">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
            {razonSocial}
          </h3>
          {nombreFantasia && <p className="text-sm text-muted-foreground font-medium">{nombreFantasia}</p>}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">RUT</span>
            <span className="text-sm font-mono font-semibold">{rutFormateado}</span>
          </div>
        </div>
        <Badge variant={activo ? 'default' : 'secondary'} className="flex-shrink-0">
          {activo ? 'Activo' : 'Inactivo'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ubicación */}
        {(direccion || ubicacion) && (
          <div className="flex items-start gap-2 p-3 bg-accent rounded-lg border border-border">
            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-0.5">
              {direccion && <div className="font-medium">{direccion}</div>}
              {ubicacion && <div className="text-muted-foreground">{ubicacion}</div>}
            </div>
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
        <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <Package className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">
            {totalOperaciones} operación{totalOperaciones !== 1 ? 'es' : ''}
          </span>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" asChild className="flex-1 hover:bg-accent hover:text-accent-foreground">
            <Link href={`/contactos/${id}?tipo=${_tipo}`}>
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
            <Link href={`/contactos/${id}?tipo=${_tipo}`} className="flex items-center justify-center gap-1">
              Ver detalles
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
