'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { mockOperaciones } from '@/lib/mocks'
import { Plus, Search, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

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
      return <Badge className="bg-green-500">🟢 {presentes}/{total} Docs - COMPLETA</Badge>
    }
    return <Badge variant="destructive">🔴 {presentes}/{total} Docs - INCOMPLETA</Badge>
  }

  const getEstadoFinBadge = (estado: string) => {
    const variants: Record<string, any> = {
      PENDIENTE: { variant: 'secondary', label: '⚪ Pendiente' },
      FACTURADA: { variant: 'default', label: '🟡 Facturada' },
      PAGADA: { variant: 'default', label: '🟢 Pagada' },
      CERRADA: { variant: 'default', label: '✅ Cerrada' },
    }
    const config = variants[estado] || variants.PENDIENTE
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getTipoBadge = (tipo: string) => {
    const tipos: Record<string, { label: string; className: string }> = {
      COMPRA: { label: '📦 COMPRA', className: 'bg-blue-500' },
      VENTA_DIRECTA: { label: '💰 VENTA', className: 'bg-green-500' },
      VENTA_COMISION: { label: '🤝 COMISIÓN', className: 'bg-purple-500' },
    }
    const config = tipos[tipo] || tipos.COMPRA
    return <Badge className={config.className}>{config.label}</Badge>
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Operaciones</h1>
          <p className="text-muted-foreground mt-2">Gestiona todas tus operaciones comerciales</p>
        </div>
        <Button asChild>
          <Link href="/operaciones/nueva">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Operación
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
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
            <Button variant="outline" onClick={() => setFiltros({ buscar: '', tipo: 'TODAS', estadoDoc: 'TODOS', estadoFin: 'TODOS' })}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Operaciones */}
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Mostrando {operaciones.length} operaciones</div>
        {operaciones.map((operacion) => (
          <Card key={operacion.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg">{operacion.numero}</span>
                    {getTipoBadge(operacion.tipo)}
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(operacion.fecha), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  {operacion.cliente && (
                    <div className="text-sm">
                      <span className="font-medium">Cliente:</span> {operacion.cliente.razonSocial}
                    </div>
                  )}
                  {operacion.proveedor && (
                    <div className="text-sm">
                      <span className="font-medium">Proveedor:</span> {operacion.proveedor.razonSocial}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    {operacion.productos.length} producto(s) •{' '}
                    {operacion.totalVenta
                      ? `$${operacion.totalVenta.toLocaleString('es-CL')}`
                      : `$${operacion.totalCompra.toLocaleString('es-CL')}`}
                  </div>
                  <div className="flex items-center gap-4">
                    {getEstadoDocBadge(operacion.estadoDocumental, operacion.documentos || [])}
                    {getEstadoFinBadge(operacion.estadoFinanciero)}
                  </div>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/operaciones/${operacion.id}`}>Ver →</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

