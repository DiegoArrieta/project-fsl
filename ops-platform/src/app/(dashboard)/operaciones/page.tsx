'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { mockOperaciones } from '@/lib/mocks'
import { Plus, Search, RefreshCw, ChevronRight, FileCheck, DollarSign, Package, Building2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function OperacionesPage() {
  const [operaciones] = useState(mockOperaciones)
  const [filtros, setFiltros] = useState({
    buscar: '',
    tipo: 'TODAS',
    estadoDoc: 'TODOS',
    estadoFin: 'TODOS',
  })

  const getEstadoDocBadge = (estado: string, docs: any[]) => {
    const presentes = docs.filter((d) => d.presente).length
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

  return (
    <div className="space-y-8">
      {/* Header */}
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

      {/* Filtros */}
      <Card className="shadow-lg border-none">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número..."
                value={filtros.buscar}
                onChange={(e) => setFiltros({ ...filtros, buscar: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select value={filtros.tipo} onValueChange={(v) => setFiltros({ ...filtros, tipo: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas</SelectItem>
                <SelectItem value="COMPRA">Compra</SelectItem>
                <SelectItem value="VENTA_DIRECTA">Venta Directa</SelectItem>
                <SelectItem value="VENTA_COMISION">Venta con Comisión</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtros.estadoDoc} onValueChange={(v) => setFiltros({ ...filtros, estadoDoc: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Estado Doc" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="INCOMPLETA">Incompleta</SelectItem>
                <SelectItem value="COMPLETA">Completa</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setFiltros({ buscar: '', tipo: 'TODAS', estadoDoc: 'TODOS', estadoFin: 'TODOS' })}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Operaciones */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-medium">
            Mostrando <span className="font-bold text-foreground">{operaciones.length}</span> operaciones
          </p>
        </div>

        <div className="space-y-4">
          {operaciones.map((operacion) => (
            <Card
              key={operacion.id}
              className="group hover:shadow-xl transition-all duration-200 border-l-4 border-l-primary/50 hover:border-l-primary"
            >
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    {/* Encabezado */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-xl text-primary">{operacion.numero}</span>
                      {getTipoBadge(operacion.tipo)}
                      <span className="text-sm text-muted-foreground font-medium">
                        {format(new Date(operacion.fecha), "d 'de' MMM yyyy", { locale: es })}
                      </span>
                    </div>

                    {/* Información de contactos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {operacion.cliente && (
                        <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900/50">
                          <Building2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium text-muted-foreground">Cliente</span>
                            <span className="text-sm font-semibold">{operacion.cliente.razonSocial}</span>
                          </div>
                        </div>
                      )}
                      {operacion.proveedor && (
                        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
                          <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium text-muted-foreground">Proveedor</span>
                            <span className="text-sm font-semibold">{operacion.proveedor.razonSocial}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Totales */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">{operacion.productos.length} producto(s)</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold text-primary">
                          $
                          {operacion.totalVenta
                            ? operacion.totalVenta.toLocaleString('es-CL')
                            : operacion.totalCompra.toLocaleString('es-CL')}
                        </span>
                      </div>
                    </div>

                    {/* Estados */}
                    <div className="flex flex-wrap items-center gap-2">
                      {getEstadoDocBadge(operacion.estadoDocumental, operacion.documentos || [])}
                      {getEstadoFinBadge(operacion.estadoFinanciero)}
                    </div>
                  </div>

                  {/* Botón de acción */}
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
          ))}
        </div>

        {operaciones.length === 0 && (
          <Card className="shadow-lg border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-4">
              <Package className="h-16 w-16 text-muted-foreground opacity-50" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No hay operaciones</h3>
                <p className="text-muted-foreground max-w-md">
                  Aún no tienes operaciones registradas. Comienza creando tu primera operación.
                </p>
              </div>
              <Button asChild size="lg" className="mt-4">
                <Link href="/operaciones/nueva">
                  <Plus className="h-5 w-5 mr-2" />
                  Crear primera operación
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
