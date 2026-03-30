'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, RefreshCw, Download, ChevronRight, FileText, Building2, Package, Calendar, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { mapOrdenCompraApiToUi, type OrdenCompraUi } from '@/lib/ordenes-compra/ui-map'

async function fetchOrdenesCompra(filtros: { buscar: string; estado: string }): Promise<OrdenCompraUi[]> {
  const params = new URLSearchParams()
  if (filtros.buscar.trim()) params.set('buscar', filtros.buscar.trim())
  if (filtros.estado !== 'TODOS') params.set('estado', filtros.estado)
  const qs = params.toString()
  const response = await fetch(`/api/ordenes-compra${qs ? `?${qs}` : ''}`)
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || 'Error al cargar órdenes de compra')
  }
  const json = await response.json()
  const raw = json.data as Parameters<typeof mapOrdenCompraApiToUi>[0][]
  return (raw ?? []).map((row) => mapOrdenCompraApiToUi(row))
}

export default function OrdenesCompraPage() {
  const [filtros, setFiltros] = useState({
    buscar: '',
    estado: 'TODOS',
  })
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set())

  const {
    data: ordenes = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ordenes-compra', filtros.buscar, filtros.estado],
    queryFn: () => fetchOrdenesCompra(filtros),
  })

  const handleDescargarPDF = async (id: string, numero: string) => {
    try {
      setDownloadingIds((prev) => new Set(prev).add(id))
      toast.loading('Generando PDF...', { id: `download-${id}` })

      const response = await fetch(`/api/ordenes-compra/${id}/descargar-pdf`)

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        throw new Error(errBody.error || 'Error al descargar PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${numero}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('PDF descargado correctamente', { id: `download-${id}` })
    } catch (e: unknown) {
      console.error('Error al descargar PDF:', e)
      const message = e instanceof Error ? e.message : 'Error al descargar PDF'
      toast.error(message, { id: `download-${id}` })
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const getEstadoBadge = (estado: string) => {
    const estados: Record<string, { label: string; className: string; icon: JSX.Element }> = {
      BORRADOR: {
        label: 'Borrador',
        className: 'bg-slate-500 hover:bg-slate-600 border-0',
        icon: <FileText className="h-3.5 w-3.5" />,
      },
      ENVIADA: {
        label: 'Enviada',
        className: 'bg-yellow-500 hover:bg-yellow-600 border-0',
        icon: <FileText className="h-3.5 w-3.5" />,
      },
      RECIBIDA: {
        label: 'Recibida',
        className: 'bg-green-600 hover:bg-green-700 border-0',
        icon: <FileText className="h-3.5 w-3.5" />,
      },
      CANCELADA: {
        label: 'Cancelada',
        className: 'bg-red-600 hover:bg-red-700 border-0',
        icon: <FileText className="h-3.5 w-3.5" />,
      },
    }
    const config = estados[estado] || estados.BORRADOR
    return (
      <Badge className={`${config.className} gap-1.5 font-semibold`}>
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-destructive text-sm">{(error as Error).message}</p>
        <Button type="button" variant="outline" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">Órdenes de Compra</h1>
          <p className="text-lg text-muted-foreground">Gestiona las órdenes de compra a proveedores</p>
        </div>
        <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
          <Link href="/ordenes-compra/nueva">
            <Plus className="h-5 w-5 mr-2" />
            Nueva OC
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card className="shadow-lg border-none">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número de OC..."
                value={filtros.buscar}
                onChange={(e) => setFiltros({ ...filtros, buscar: e.target.value })}
                className="pl-10"
              />
            </div>
            <Button variant="outline" type="button" onClick={() => setFiltros({ buscar: '', estado: 'TODOS' })}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de OC */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-medium">
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Cargando…
              </span>
            ) : (
              <>
                Mostrando <span className="font-bold text-foreground">{ordenes.length}</span> órdenes de compra
              </>
            )}
          </p>
        </div>

        <div className="space-y-4">
          {ordenes.map((oc) => (
            <Card
              key={oc.id}
              className="group hover:shadow-xl transition-all duration-200 border-l-4 border-l-primary/50 hover:border-l-primary"
            >
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    {/* Encabezado */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-xl text-primary">{oc.numero}</span>
                      {getEstadoBadge(oc.estado)}
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                        <Calendar className="h-4 w-4" aria-hidden />
                        {format(new Date(oc.fecha), "d 'de' MMM yyyy", { locale: es })}
                      </div>
                    </div>

                    {/* Proveedor */}
                    {oc.proveedor && (
                      <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
                        <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" aria-hidden />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Proveedor
                          </span>
                          <span className="text-base font-semibold">{oc.proveedor.razonSocial}</span>
                        </div>
                      </div>
                    )}

                    {/* Totales y productos */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg border border-border">
                        <Package className="h-4 w-4 text-muted-foreground" aria-hidden />
                        <span className="text-sm font-semibold">{oc.productos.length} producto(s)</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</span>
                        <span className="text-lg font-bold text-primary">${oc.total.toLocaleString('es-CL')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex lg:flex-col gap-2 self-end lg:self-start">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => handleDescargarPDF(oc.id, oc.numero)}
                      disabled={downloadingIds.has(oc.id)}
                      className="hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" aria-hidden />
                      {downloadingIds.has(oc.id) ? 'Generando...' : 'Descargar PDF'}
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      <Link href={`/ordenes-compra/${oc.id}`} className="flex items-center gap-2">
                        Ver detalles
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!isLoading && ordenes.length === 0 && (
          <Card className="shadow-lg border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-4">
              <FileText className="h-16 w-16 text-muted-foreground opacity-50" aria-hidden />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No hay órdenes de compra</h3>
                <p className="text-muted-foreground max-w-md">
                  No hay resultados con los filtros actuales o aún no existen órdenes en el sistema.
                </p>
              </div>
              <Button asChild size="lg" className="mt-4">
                <Link href="/ordenes-compra/nueva">
                  <Plus className="h-5 w-5 mr-2" />
                  Crear primera OC
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
