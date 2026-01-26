'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockApi } from '@/lib/mocks'
import { Plus, FileText, DollarSign, AlertCircle, Clock, Package, TrendingUp } from 'lucide-react'
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
      <div className="container mx-auto py-8">
        <div className="text-center">Cargando...</div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Hoy: {format(new Date(), "d 'de' MMMM yyyy", { locale: es })}
          </p>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-24 flex-col gap-2">
              <Link href="/operaciones/nueva?tipo=COMPRA">
                <Package className="h-6 w-6" />
                <span>Nueva Compra</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-24 flex-col gap-2">
              <Link href="/operaciones/nueva?tipo=VENTA_DIRECTA">
                <TrendingUp className="h-6 w-6" />
                <span>Nueva Venta</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-24 flex-col gap-2">
              <Link href="/operaciones/nueva?tipo=VENTA_COMISION">
                <DollarSign className="h-6 w-6" />
                <span>Venta con Comisión</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requieren Atención */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Requieren Atención
              <Badge variant="destructive">{data.pendientes.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Documentos faltantes</span>
                <Badge variant="destructive">{data.documentosFaltantes}</Badge>
              </div>
              <div className="space-y-2">
                {data.pendientes
                  .filter((p: any) => p.tipo === 'DOCUMENTO')
                  .slice(0, 3)
                  .map((pendiente: any, idx: number) => (
                    <div key={idx} className="text-sm text-muted-foreground">
                      • {pendiente.operacion} - {pendiente.descripcion}
                    </div>
                  ))}
                <Link href="/operaciones?estado=INCOMPLETA" className="text-sm text-primary hover:underline">
                  Ver todas →
                </Link>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Pagos pendientes</span>
                <Badge variant="destructive">{data.pagosPendientes}</Badge>
              </div>
              <div className="space-y-2">
                {data.pendientes
                  .filter((p: any) => p.tipo === 'PAGO')
                  .slice(0, 3)
                  .map((pendiente: any, idx: number) => (
                    <div key={idx} className="text-sm text-muted-foreground">
                      • {pendiente.operacion} - {pendiente.descripcion}
                    </div>
                  ))}
                <Link href="/operaciones?estado=FACTURADA" className="text-sm text-primary hover:underline">
                  Ver todas →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resumen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Operaciones abiertas</p>
                <p className="text-2xl font-bold">{data.operacionesAbiertas}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cerradas (30 días)</p>
                <p className="text-2xl font-bold">{data.cerradas30Dias}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Compras</p>
                <p className="text-2xl font-bold">{data.compras}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ventas</p>
                <p className="text-2xl font-bold">{data.ventas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actividad Reciente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.actividadReciente.map((actividad: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span>• {actividad.accion}</span>
                <span className="text-muted-foreground">{actividad.tiempo}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
