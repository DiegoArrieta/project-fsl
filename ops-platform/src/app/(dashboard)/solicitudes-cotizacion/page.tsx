'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Loader2, FileSpreadsheet } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface SolicitudCotizacionListRow {
  id: string
  numero: string
  fecha: string
  estado: string
  proveedor?: { razonSocial: string } | null
  lineas?: unknown[]
}

async function fetchLista(): Promise<{ data: SolicitudCotizacionListRow[] }> {
  const res = await fetch('/api/solicitudes-cotizacion?pageSize=100')
  if (!res.ok) throw new Error('Error al cargar solicitudes')
  return res.json()
}

const estadoLabels: Record<string, string> = {
  BORRADOR: 'Borrador',
  ENVIADO: 'Enviado',
  CERRADO: 'Cerrado',
}

export default function SolicitudesCotizacionPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['solicitudes-cotizacion'],
    queryFn: fetchLista,
  })

  const rows: SolicitudCotizacionListRow[] = data?.data ?? []

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Solicitudes a proveedores</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Documento genérico con cantidades por tipo de pallet (sin operación asociada).
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/solicitudes-cotizacion/nueva">
            <Plus className="h-5 w-5 mr-2" />
            Nueva solicitud
          </Link>
        </Button>
      </div>

      {error && (
        <p className="text-destructive text-sm">{(error as Error).message}</p>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden />
              <p>No hay solicitudes registradas.</p>
              <Button asChild className="mt-4">
                <Link href="/solicitudes-cotizacion/nueva">Crear la primera</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Líneas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono font-medium">{s.numero}</TableCell>
                      <TableCell>{s.proveedor?.razonSocial ?? '—'}</TableCell>
                      <TableCell>
                        {format(new Date(s.fecha), 'd MMM yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>{s.lineas?.length ?? 0}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{estadoLabels[s.estado] ?? s.estado}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/solicitudes-cotizacion/${s.id}`}>Ver</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
