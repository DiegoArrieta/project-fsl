'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockApi } from '@/lib/mocks'
import { Plus, FileText, DollarSign, AlertCircle, Clock, Package, TrendingUp, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    mockApi.dashboard.resumen().then((response) => {
      setData(response.data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) return null

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
              <Plus className="h-5 w-5 text-primary" />
            </div>
            Acciones Rápidas
          </CardTitle>
          <p className="text-sm text-muted-foreground">Crea una nueva operación</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              asChild
              variant="outline"
              className="group h-32 flex-col gap-3 border-2 hover:border-primary hover:shadow-md transition-all duration-200"
            >
              <Link href="/operaciones/nueva?tipo=COMPRA">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl group-hover:scale-110 transition-transform">
                  <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-semibold">Nueva Compra</span>
                  <span className="text-xs text-muted-foreground">Registrar compra</span>
                </div>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="group h-32 flex-col gap-3 border-2 hover:border-primary hover:shadow-md transition-all duration-200"
            >
              <Link href="/operaciones/nueva?tipo=VENTA_DIRECTA">
                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-xl group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-semibold">Nueva Venta</span>
                  <span className="text-xs text-muted-foreground">Venta directa</span>
                </div>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="group h-32 flex-col gap-3 border-2 hover:border-primary hover:shadow-md transition-all duration-200"
            >
              <Link href="/operaciones/nueva?tipo=VENTA_COMISION">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl group-hover:scale-110 transition-transform">
                  <DollarSign className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-semibold">Venta con Comisión</span>
                  <span className="text-xs text-muted-foreground">Con intermediario</span>
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
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <span>Requieren Atención</span>
              <Badge variant="destructive" className="ml-auto">{data.pendientes.length}</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">Tareas prioritarias pendientes</p>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50/50 dark:bg-red-950/20 rounded-lg">
                <span className="text-sm font-semibold">Documentos faltantes</span>
                <Badge variant="destructive" className="font-bold">{data.documentosFaltantes}</Badge>
              </div>
              <div className="space-y-2 pl-3 border-l-2 border-red-200 dark:border-red-900">
                {data.pendientes
                  .filter((p: any) => p.tipo === 'DOCUMENTO')
                  .slice(0, 3)
                  .map((pendiente: any, idx: number) => (
                    <div key={idx} className="text-sm text-muted-foreground pl-3 hover:text-foreground transition-colors">
                      <span className="text-red-500 font-bold">•</span> {pendiente.operacion} - {pendiente.descripcion}
                    </div>
                  ))}
                <Link 
                  href="/operaciones?estado=INCOMPLETA" 
                  className="flex items-center gap-1 text-sm text-primary hover:gap-2 transition-all font-medium pl-3 pt-1"
                >
                  Ver todas <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50/50 dark:bg-red-950/20 rounded-lg">
                <span className="text-sm font-semibold">Pagos pendientes</span>
                <Badge variant="destructive" className="font-bold">{data.pagosPendientes}</Badge>
              </div>
              <div className="space-y-2 pl-3 border-l-2 border-red-200 dark:border-red-900">
                {data.pendientes
                  .filter((p: any) => p.tipo === 'PAGO')
                  .slice(0, 3)
                  .map((pendiente: any, idx: number) => (
                    <div key={idx} className="text-sm text-muted-foreground pl-3 hover:text-foreground transition-colors">
                      <span className="text-red-500 font-bold">•</span> {pendiente.operacion} - {pendiente.descripcion}
                    </div>
                  ))}
                <Link 
                  href="/operaciones?estado=FACTURADA" 
                  className="flex items-center gap-1 text-sm text-primary hover:gap-2 transition-all font-medium pl-3 pt-1"
                >
                  Ver todas <ChevronRight className="h-4 w-4" />
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
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Resumen de Operaciones
            </CardTitle>
            <p className="text-sm text-muted-foreground">Vista general del negocio</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-50 dark:from-green-950/20 to-background border border-green-200 dark:border-green-900/50 rounded-xl hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-muted-foreground mb-1">Operaciones abiertas</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{data.operacionesAbiertas}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-slate-50 dark:from-slate-950/20 to-background border border-slate-200 dark:border-slate-900/50 rounded-xl hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-muted-foreground mb-1">Cerradas (30 días)</p>
                <p className="text-3xl font-bold text-slate-600 dark:text-slate-400">{data.cerradas30Dias}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 dark:from-blue-950/20 to-background border border-blue-200 dark:border-blue-900/50 rounded-xl hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-muted-foreground mb-1">Compras</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{data.compras}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-50 dark:from-emerald-950/20 to-background border border-emerald-200 dark:border-emerald-900/50 rounded-xl hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-muted-foreground mb-1">Ventas</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{data.ventas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actividad Reciente */}
      <Card className="shadow-lg border-purple-200 dark:border-purple-900/50">
        <CardHeader className="space-y-1 bg-gradient-to-br from-purple-50/50 dark:from-purple-950/20 to-background">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-purple-100 dark:bg-purple-950/50 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            Actividad Reciente
          </CardTitle>
          <p className="text-sm text-muted-foreground">Últimas acciones en el sistema</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {data.actividadReciente.map((actividad: any, idx: number) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent hover:border-accent-foreground/20 transition-all group"
              >
                <span className="text-sm font-medium group-hover:text-accent-foreground transition-colors">
                  <span className="text-purple-500 font-bold">•</span> {actividad.accion}
                </span>
                <span className="text-sm text-muted-foreground font-mono">{actividad.tiempo}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
