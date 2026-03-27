'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, RefreshCw, ChevronRight, FileCheck, DollarSign, Package, Building2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { calcularTotalesDesdeLineas, isDocumentoPresente } from '@/lib/operaciones/operacion-ui-helpers'
import type { DocumentoOperacionApi, OperacionApi } from '@/types/operacion-api'

const PAGE_SIZE = 20

interface OperacionesMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

async function fetchOperacionesPage(searchParams: URLSearchParams): Promise<{
  data: OperacionApi[]
  meta: OperacionesMeta
}> {
  const response = await fetch(`/api/operaciones?${searchParams.toString()}`)
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || 'Error al cargar operaciones')
  }
  const json = await response.json()
  return { data: json.data || [], meta: json.meta }
}

export default function OperacionesPage() {
  const [page, setPage] = useState(1)
  const [filtros, setFiltros] = useState({
    buscar: '',
    tipo: 'TODAS',
    estadoDoc: 'TODOS',
    estadoFin: 'TODOS',
  })

  const queryParams = new URLSearchParams()
  queryParams.set('page', String(page))
  queryParams.set('pageSize', String(PAGE_SIZE))
  if (filtros.buscar.trim()) queryParams.set('buscar', filtros.buscar.trim())
  if (filtros.tipo !== 'TODAS') queryParams.set('tipo', filtros.tipo)
  if (filtros.estadoDoc !== 'TODOS') queryParams.set('estadoDocumental', filtros.estadoDoc)
  if (filtros.estadoFin !== 'TODOS') queryParams.set('estadoFinanciero', filtros.estadoFin)

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['operaciones', filtros, page],
    queryFn: () => fetchOperacionesPage(queryParams),
  })

  const operaciones = data?.data ?? []
  const meta = data?.meta

  const handleLimpiar = () => {
    setFiltros({ buscar: '', tipo: 'TODAS', estadoDoc: 'TODOS', estadoFin: 'TODOS' })
    setPage(1)
  }

  const getEstadoDocBadge = (estado: string, docs: DocumentoOperacionApi[]) => {
    const presentes = docs.filter((d) => isDocumentoPresente(d)).length
    const total = docs.length
    if (estado === 'COMPLETA') {
      return (
        <Badge className="bg-green-600 hover:bg-green-700 border-0 gap-1.5">
          <FileCheck className="h-3.5 w-3.5" />
          {presentes}/{total} Docs
        </Badge>
      )
    }
    return (
      <Badge variant="destructive" className="gap-1.5 border-0">
        <FileCheck className="h-3.5 w-3.5" />
        {presentes}/{total} Docs
      </Badge>
    )
  }

  const getEstadoFinBadge = (estado: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      PENDIENTE: { className: 'bg-slate-500 hover:bg-slate-600', label: 'Pendiente' },
      FACTURADA: { className: 'bg-yellow-500 hover:bg-yellow-600', label: 'Facturada' },
      PAGADA: { className: 'bg-blue-500 hover:bg-blue-600', label: 'Pagada' },
      CERRADA: { className: 'bg-emerald-600 hover:bg-emerald-700', label: 'Cerrada' },
    }
    const config = variants[estado] || variants.PENDIENTE
    return (
      <Badge className={`${config.className} border-0 gap-1.5`}>
        <DollarSign className="h-3.5 w-3.5" />
        {config.label}
      </Badge>
    )
  }

  const getTipoBadge = (tipo: string) => {
    const tipos: Record<string, { label: string; className: string; icon: JSX.Element }> = {
      COMPRA: {
        label: 'COMPRA',
        className: 'bg-blue-600 hover:bg-blue-700 border-0',
        icon: <Package className="h-3.5 w-3.5" />,
      },
      VENTA_DIRECTA: {
        label: 'VENTA',
        className: 'bg-green-600 hover:bg-green-700 border-0',
        icon: <DollarSign className="h-3.5 w-3.5" />,
      },
      VENTA_COMISION: {
        label: 'COMISIÓN',
        className: 'bg-purple-600 hover:bg-purple-700 border-0',
        icon: <DollarSign className="h-3.5 w-3.5" />,
      },
    }
    const config = tipos[tipo] || tipos.COMPRA
    return (
      <Badge className={`${config.className} gap-1.5 font-semibold`}>
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  const primerProveedor = (op: OperacionApi) => op.proveedores?.[0]?.proveedor

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">Operaciones</h1>
          <p className="text-lg text-muted-foreground">Gestiona todas tus operaciones comerciales</p>
        </div>
        <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
          <Link href="/operaciones/nueva">
            <Plus className="h-5 w-5 mr-2" />
            Nueva Operación
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg border-none">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número..."
                value={filtros.buscar}
                onChange={(e) => {
                  setFiltros({ ...filtros, buscar: e.target.value })
                  setPage(1)
                }}
                className="pl-10"
                aria-label="Buscar operación por número"
              />
            </div>
            <Select
              value={filtros.tipo}
              onValueChange={(v) => {
                setFiltros({ ...filtros, tipo: v })
                setPage(1)
              }}
            >
              <SelectTrigger aria-label="Filtrar por tipo">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas</SelectItem>
                <SelectItem value="COMPRA">Compra</SelectItem>
                <SelectItem value="VENTA_DIRECTA">Venta Directa</SelectItem>
                <SelectItem value="VENTA_COMISION">Venta con Comisión</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filtros.estadoDoc}
              onValueChange={(v) => {
                setFiltros({ ...filtros, estadoDoc: v })
                setPage(1)
              }}
            >
              <SelectTrigger aria-label="Filtrar por estado documental">
                <SelectValue placeholder="Estado Doc" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos (docs)</SelectItem>
                <SelectItem value="INCOMPLETA">Incompleta</SelectItem>
                <SelectItem value="COMPLETA">Completa</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filtros.estadoFin}
              onValueChange={(v) => {
                setFiltros({ ...filtros, estadoFin: v })
                setPage(1)
              }}
            >
              <SelectTrigger aria-label="Filtrar por estado financiero">
                <SelectValue placeholder="Estado financiero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos (financiero)</SelectItem>
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                <SelectItem value="FACTURADA">Facturada</SelectItem>
                <SelectItem value="PAGADA">Pagada</SelectItem>
                <SelectItem value="CERRADA">Cerrada</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => refetch()}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Button type="button" variant="outline" onClick={handleLimpiar}>
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground font-medium">
            {isLoading ? (
              'Cargando…'
            ) : (
              <>
                Mostrando{' '}
                <span className="font-bold text-foreground">{operaciones.length}</span> de{' '}
                <span className="font-bold text-foreground">{meta?.total ?? 0}</span> operaciones
              </>
            )}
          </p>
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {meta.page} / {meta.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-destructive text-sm">
              {(error as Error).message}
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
          </div>
        )}

        {!isLoading && (
          <div className="space-y-4">
            {operaciones.map((operacion) => {
              const lineas = operacion.lineas || []
              const { montoListado } = calcularTotalesDesdeLineas(operacion.tipo, lineas)
              const prov = primerProveedor(operacion)

              return (
                <Card
                  key={operacion.id}
                  className="group hover:shadow-xl transition-all duration-200 border-l-4 border-l-primary/50 hover:border-l-primary"
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-bold text-xl text-primary">{operacion.numero}</span>
                          {getTipoBadge(operacion.tipo)}
                          <span className="text-sm text-muted-foreground font-medium">
                            {format(new Date(operacion.fecha), "d 'de' MMM yyyy", { locale: es })}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {operacion.cliente && (
                            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900/50">
                              <Building2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-medium text-muted-foreground">Cliente</span>
                                <span className="text-sm font-semibold">{operacion.cliente.razonSocial}</span>
                              </div>
                            </div>
                          )}
                          {prov && (
                            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
                              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-medium text-muted-foreground">Proveedor</span>
                                <span className="text-sm font-semibold">{prov.razonSocial}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-semibold">{lineas.length} producto(s)</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <span className="text-sm font-bold text-primary">
                              ${montoListado.toLocaleString('es-CL')}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {getEstadoDocBadge(operacion.estadoDocumental, operacion.documentos || [])}
                          {getEstadoFinBadge(operacion.estadoFinanciero)}
                        </div>
                      </div>

                      <Button
                        asChild
                        variant="outline"
                        className="self-end lg:self-start group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        <Link href={`/operaciones/${operacion.id}`} className="flex items-center gap-2">
                          Ver detalles
                          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
        {!isLoading && operaciones.length === 0 && !error && (
          <Card className="shadow-lg border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-4">
              <Package className="h-16 w-16 text-muted-foreground opacity-50" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No hay operaciones</h3>
                <p className="text-muted-foreground max-w-md">
                  No hay resultados con los filtros actuales, o aún no registras operaciones.
                </p>
              </div>
              <Button asChild size="lg" className="mt-4">
                <Link href="/operaciones/nueva">
                  <Plus className="h-5 w-5 mr-2" />
                  Crear operación
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
