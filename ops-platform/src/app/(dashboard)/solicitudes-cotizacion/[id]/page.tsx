'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SolicitudCotizacionForm } from '@/components/solicitudes-cotizacion/SolicitudCotizacionForm'
import type { CreateSolicitudCotizacionInput } from '@/lib/validations/solicitud-cotizacion'
import { toast } from 'sonner'
import { ArrowLeft, FileDown, Loader2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

async function fetchOne(id: string) {
  const res = await fetch(`/api/solicitudes-cotizacion/${id}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error || 'No encontrado')
  }
  return res.json()
}

const estadoLabels: Record<string, string> = {
  BORRADOR: 'Borrador',
  ENVIADO: 'Enviado',
  CERRADO: 'Cerrado',
}

export default function SolicitudCotizacionDetallePage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = params.id as string

  const { data, isLoading, error } = useQuery({
    queryKey: ['solicitud-cotizacion', id],
    queryFn: () => fetchOne(id),
    enabled: Boolean(id),
  })

  const s = data?.data

  const updateMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch(`/api/solicitudes-cotizacion/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error || 'Error al guardar')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Actualizado')
      queryClient.invalidateQueries({ queryKey: ['solicitud-cotizacion', id] })
      queryClient.invalidateQueries({ queryKey: ['solicitudes-cotizacion'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/solicitudes-cotizacion/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error || 'Error al eliminar')
      }
    },
    onSuccess: () => {
      toast.success('Solicitud eliminada')
      queryClient.invalidateQueries({ queryKey: ['solicitudes-cotizacion'] })
      router.push('/solicitudes-cotizacion')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const handleDownloadPDF = async () => {
    try {
      toast.loading('Generando PDF...')
      const response = await fetch(`/api/solicitudes-cotizacion/${id}/pdf`)
      if (!response.ok) throw new Error('Error al generar PDF')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Cotizacion-${s?.numero ?? id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast.dismiss()
      toast.success('PDF descargado')
    } catch {
      toast.dismiss()
      toast.error('Error al descargar PDF')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    )
  }

  if (error || !s) {
    return (
      <div className="container mx-auto py-8 text-center space-y-4">
        <p className="text-destructive">{(error as Error)?.message ?? 'No encontrado'}</p>
        <Button asChild>
          <Link href="/solicitudes-cotizacion">Volver</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/solicitudes-cotizacion">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-mono">{s.numero}</h1>
            <p className="text-muted-foreground mt-1">{s.proveedor?.razonSocial}</p>
          </div>
          <Badge variant="outline">{estadoLabels[s.estado] ?? s.estado}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleDownloadPDF}>
            <FileDown className="h-4 w-4 mr-2" aria-hidden />
            PDF
          </Button>
          {s.estado === 'BORRADOR' && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (confirm('¿Eliminar esta solicitud?')) deleteMutation.mutate()
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {s.estado === 'BORRADOR' ? (
        <SolicitudCotizacionForm
          initialData={{
            proveedorId: s.proveedorId,
            fecha: s.fecha,
            observaciones: s.observaciones,
            estado: s.estado,
            lineas: s.lineas.map(
              (l: { tipoPalletId: string; cantidad: number; descripcion: string | null }) => ({
                tipoPalletId: l.tipoPalletId,
                cantidad: l.cantidad,
                descripcion: l.descripcion,
              })
            ),
          }}
          bloquearProveedor={false}
          onSubmit={async (data: CreateSolicitudCotizacionInput) => {
            await updateMutation.mutateAsync({
              proveedorId: data.proveedorId,
              fecha: data.fecha,
              observaciones: data.observaciones === '' ? null : data.observaciones,
              estado: data.estado,
              lineas: data.lineas.map((l) => ({
                tipoPalletId: l.tipoPalletId,
                cantidad: l.cantidad,
                descripcion: l.descripcion === '' || !l.descripcion ? null : l.descripcion,
              })),
            })
          }}
          onCancel={() => router.push('/solicitudes-cotizacion')}
          isLoading={updateMutation.isPending}
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Fecha:</span>{' '}
                {format(new Date(s.fecha), "d 'de' MMMM yyyy", { locale: es })}
              </p>
              {s.observaciones && (
                <p className="whitespace-pre-wrap">
                  <span className="text-muted-foreground">Observaciones:</span> {s.observaciones}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-muted-foreground">Estado:</span>
                <Select
                  value={s.estado}
                  disabled={updateMutation.isPending}
                  onValueChange={(v) => {
                    if (v !== s.estado) updateMutation.mutate({ estado: v })
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BORRADOR">Borrador</SelectItem>
                    <SelectItem value="ENVIADO">Enviado</SelectItem>
                    <SelectItem value="CERRADO">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Líneas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead>Nota</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {s.lineas.map(
                    (l: {
                      id: string
                      tipoPalletId: string
                      cantidad: number
                      descripcion: string | null
                      tipoPallet?: { nombre: string }
                    }) => (
                    <TableRow key={l.id}>
                      <TableCell>{l.tipoPallet?.nombre ?? l.tipoPalletId}</TableCell>
                      <TableCell className="text-right">{l.cantidad}</TableCell>
                      <TableCell className="text-muted-foreground">{l.descripcion ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
