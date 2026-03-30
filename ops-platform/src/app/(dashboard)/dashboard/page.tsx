'use client'

import { useQueries } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, AlertCircle, Clock, Package, ChevronRight, Loader2, ClipboardList, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { buildDashboardViewModel, type DashboardViewModel } from '@/lib/dashboard/dashboard-ui'
import type { Alerta } from '@/lib/dashboard/alertas'

interface EstadisticasApi {
  estadisticasOperaciones: {
    porTipo: { compra: number; ventaDirecta: number; ventaComision: number }
  }
  operacionesPendientes: {
    documentosIncompletos: number
    pagoPendiente: number
    facturadas: number
  }
  resumenGlobal?: {
    operacionesAbiertas: number
    cerradas30Dias: number
  }
}

interface AlertasApi {
  alertas: Alerta[]
}

interface ActividadApiItem {
  descripcion: string
  fecha: string | Date
  enlace: string
}

async function fetchEstadisticas(): Promise<EstadisticasApi> {
  const res = await fetch('/api/dashboard/estadisticas?periodo=todo')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(typeof body.error === 'string' ? body.error : 'Error al cargar estadísticas')
  }
  const json = await res.json()
  if (!json.success) {
    throw new Error(typeof json.error === 'string' ? json.error : 'Error al cargar estadísticas')
  }
  return json.data as EstadisticasApi
}

async function fetchAlertas(): Promise<AlertasApi> {
  const res = await fetch('/api/dashboard/alertas')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(typeof body.error === 'string' ? body.error : 'Error al cargar alertas')
  }
  const json = await res.json()
  if (!json.success) {
    throw new Error(typeof json.error === 'string' ? json.error : 'Error al cargar alertas')
  }
  return json.data as AlertasApi
}

async function fetchActividad(): Promise<ActividadApiItem[]> {
  const res = await fetch('/api/dashboard/actividad-reciente?limite=10')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(typeof body.error === 'string' ? body.error : 'Error al cargar actividad')
  }
  const json = await res.json()
  if (!json.success) {
    throw new Error(typeof json.error === 'string' ? json.error : 'Error al cargar actividad')
  }
  return json.data as ActividadApiItem[]
}

export default function DashboardPage() {
  const results = useQueries({
    queries: [
      {
        queryKey: ['dashboard', 'estadisticas'],
        queryFn: fetchEstadisticas,
      },
      {
        queryKey: ['dashboard', 'alertas'],
        queryFn: fetchAlertas,
      },
      {
        queryKey: ['dashboard', 'actividad-reciente'],
        queryFn: fetchActividad,
      },
    ],
  })

  const [estQuery, alertQuery, actQuery] = results
  const isLoading = results.some((r) => r.isPending)
  const firstError = results.find((r) => r.error)?.error

  const data: DashboardViewModel | null =
    estQuery.data && alertQuery.data && actQuery.data
      ? buildDashboardViewModel(estQuery.data, alertQuery.data.alertas, actQuery.data)
      : null

  const handleReintentar = () => {
    void Promise.all(results.map((r) => r.refetch()))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
          <p className="text-sm text-muted-foreground">Cargando dashboard…</p>
        </div>
      </div>
    )
  }

  if (firstError || !data) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <p className="text-destructive text-sm">{firstError instanceof Error ? firstError.message : 'Error al cargar'}</p>
        <Button type="button" variant="outline" onClick={handleReintentar}>
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* Acciones Rápidas */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 via-background to-background">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Plus className="h-5 w-5 text-primary" aria-hidden />
            </div>
            Acciones Rápidas
          </CardTitle>
          <p className="text-sm text-muted-foreground">Crear operación, presupuesto u orden de compra</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              asChild
              variant="outline"
              className="group h-32 flex-col gap-3 border-2 hover:border-primary hover:shadow-md transition-all duration-200"
            >
              <Link href="/operaciones/nueva" aria-label="Crear operación">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl group-hover:scale-110 transition-transform">
                  <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" aria-hidden />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-semibold">Crear operación</span>
                  <span className="text-xs text-muted-foreground">Compra o venta</span>
                </div>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="group h-32 flex-col gap-3 border-2 hover:border-primary hover:shadow-md transition-all duration-200"
            >
              <Link href="/presupuestos/nuevo" aria-label="Crear presupuesto">
                <div className="p-3 bg-violet-50 dark:bg-violet-950/30 rounded-xl group-hover:scale-110 transition-transform">
                  <ClipboardList className="h-8 w-8 text-violet-600 dark:text-violet-400" aria-hidden />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-semibold">Crear presupuesto</span>
                  <span className="text-xs text-muted-foreground">Nueva cotización</span>
                </div>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="group h-32 flex-col gap-3 border-2 hover:border-primary hover:shadow-md transition-all duration-200"
            >
              <Link href="/ordenes-compra/nueva" aria-label="Crear orden de compra">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl group-hover:scale-110 transition-transform">
                  <ShoppingCart className="h-8 w-8 text-emerald-600 dark:text-emerald-400" aria-hidden />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-semibold">Orden de compra</span>
                  <span className="text-xs text-muted-foreground">OC a proveedor</span>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requieren Atención */}
        <Card className="border-red-200 dark:border-red-900/50 shadow-lg">
          <CardHeader className="space-y-1 bg-gradient-to-br from-red-50/50 dark:from-red-950/20 to-background">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-red-100 dark:bg-red-950/50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden />
              </div>
              <span>Requieren Atención</span>
              <Badge variant="destructive" className="ml-auto">
                {data.pendientes.length}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">Tareas prioritarias pendientes</p>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50/50 dark:bg-red-950/20 rounded-lg">
                <span className="text-sm font-semibold">Documentos faltantes</span>
                <Badge variant="destructive" className="font-bold">
                  {data.documentosFaltantes}
                </Badge>
              </div>
              <div className="space-y-2 pl-3 border-l-2 border-red-200 dark:border-red-900">
                {data.pendientes
                  .filter((p) => p.tipo === 'DOCUMENTO')
                  .slice(0, 3)
                  .map((pendiente, idx) => (
                    <div
                      key={`doc-${pendiente.operacion}-${idx}`}
                      className="text-sm text-muted-foreground pl-3 hover:text-foreground transition-colors"
                    >
                      <span className="text-red-500 font-bold">•</span> {pendiente.operacion} - {pendiente.descripcion}
                    </div>
                  ))}
                <Link
                  href="/operaciones?estado=INCOMPLETA"
                  className="flex items-center gap-1 text-sm text-primary hover:gap-2 transition-all font-medium pl-3 pt-1"
                >
                  Ver todas <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50/50 dark:bg-red-950/20 rounded-lg">
                <span className="text-sm font-semibold">Pagos pendientes</span>
                <Badge variant="destructive" className="font-bold">
                  {data.pagosPendientes}
                </Badge>
              </div>
              <div className="space-y-2 pl-3 border-l-2 border-red-200 dark:border-red-900">
                {data.pendientes
                  .filter((p) => p.tipo === 'PAGO')
                  .slice(0, 3)
                  .map((pendiente, idx) => (
                    <div
                      key={`pago-${pendiente.operacion}-${idx}`}
                      className="text-sm text-muted-foreground pl-3 hover:text-foreground transition-colors"
                    >
                      <span className="text-red-500 font-bold">•</span> {pendiente.operacion} - {pendiente.descripcion}
                    </div>
                  ))}
                <Link
                  href="/operaciones?estado=FACTURADA"
                  className="flex items-center gap-1 text-sm text-primary hover:gap-2 transition-all font-medium pl-3 pt-1"
                >
                  Ver todas <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen */}
        <Card className="border-blue-200 dark:border-blue-900/50 shadow-lg">
          <CardHeader className="space-y-1 bg-gradient-to-br from-blue-50/50 dark:from-blue-950/20 to-background">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden />
              </div>
              Resumen de Operaciones
            </CardTitle>
            <p className="text-sm text-muted-foreground">Conteos globales y totales por tipo (período: todo)</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/operaciones?estadoFinanciero=ABIERTAS"
                className="block p-4 bg-gradient-to-br from-green-50 dark:from-green-950/20 to-background border border-green-200 dark:border-green-900/50 rounded-xl hover:shadow-md hover:border-green-400 dark:hover:border-green-600 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Ver operaciones abiertas en el listado"
              >
                <p className="text-sm font-medium text-muted-foreground mb-1">Operaciones abiertas</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{data.operacionesAbiertas}</p>
              </Link>
              <Link
                href="/operaciones?cerradasDesdeDias=30"
                className="block p-4 bg-gradient-to-br from-slate-50 dark:from-slate-950/20 to-background border border-slate-200 dark:border-slate-900/50 rounded-xl hover:shadow-md hover:border-slate-400 dark:hover:border-slate-600 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Ver operaciones cerradas en los últimos 30 días"
              >
                <p className="text-sm font-medium text-muted-foreground mb-1">Cerradas (30 días)</p>
                <p className="text-3xl font-bold text-slate-600 dark:text-slate-400">{data.cerradas30Dias}</p>
              </Link>
              <Link
                href="/operaciones?tipo=COMPRA"
                className="block p-4 bg-gradient-to-br from-blue-50 dark:from-blue-950/20 to-background border border-blue-200 dark:border-blue-900/50 rounded-xl hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Ver operaciones de compra"
              >
                <p className="text-sm font-medium text-muted-foreground mb-1">Compras</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{data.compras}</p>
              </Link>
              <Link
                href="/operaciones?tipo=VENTAS"
                className="block p-4 bg-gradient-to-br from-emerald-50 dark:from-emerald-950/20 to-background border border-emerald-200 dark:border-emerald-900/50 rounded-xl hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-600 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Ver operaciones de venta"
              >
                <p className="text-sm font-medium text-muted-foreground mb-1">Ventas</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{data.ventas}</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actividad Reciente */}
      <Card className="shadow-lg border-purple-200 dark:border-purple-900/50">
        <CardHeader className="space-y-1 bg-gradient-to-br from-purple-50/50 dark:from-purple-950/20 to-background">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-purple-100 dark:bg-purple-950/50 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" aria-hidden />
            </div>
            Actividad Reciente
          </CardTitle>
          <p className="text-sm text-muted-foreground">Últimas acciones en el sistema</p>
        </CardHeader>
        <CardContent className="pt-6">
          {data.actividadReciente.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Sin actividad reciente</p>
          ) : (
            <div className="space-y-3">
              {data.actividadReciente.map((actividad, idx) => (
                <Link
                  key={`${actividad.enlace}-${idx}`}
                  href={actividad.enlace}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent hover:border-accent-foreground/20 transition-all group"
                >
                  <span className="text-sm font-medium group-hover:text-accent-foreground transition-colors">
                    <span className="text-purple-500 font-bold">•</span> {actividad.accion}
                  </span>
                  <span className="text-sm text-muted-foreground font-mono">{actividad.tiempo}</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
