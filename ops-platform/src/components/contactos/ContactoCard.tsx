'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRutForDisplay } from '@/lib/validations/rut'
import { MapPin, Phone, Mail, Package } from 'lucide-react'
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{razonSocial}</h3>
          {nombreFantasia && (
            <p className="text-sm text-muted-foreground">{nombreFantasia}</p>
          )}
        </div>
        <Badge variant={activo ? 'default' : 'secondary'}>
          {activo ? 'Activo' : 'Inactivo'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">
          <span className="font-medium">RUT:</span> {rutFormateado}
        </div>

        {(direccion || ubicacion) && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              {direccion && <div>{direccion}</div>}
              {ubicacion && <div>{ubicacion}</div>}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {telefono && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-4 w-4" />
              <span>{telefono}</span>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              <span className="truncate max-w-[200px]">{email}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>
            {totalOperaciones} operación{totalOperaciones !== 1 ? 'es' : ''}
          </span>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/contactos/${id}`}>Editar</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/contactos/${id}`}>Ver →</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

