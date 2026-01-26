'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { mockOrdenesCompra } from '@/lib/mocks'
import { Plus, Search, RefreshCw, Download } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function OrdenesCompraPage() {
  const [ordenes] = useState(mockOrdenesCompra)
  const [filtros, setFiltros] = useState({
    buscar: '',
    estado: 'TODOS',
  })

  const getEstadoBadge = (estado: string) => {
    const estados: Record<string, { label: string; className: string }> = {
      BORRADOR: { label: '⚪ BORRADOR', className: 'bg-gray-500' },
      ENVIADA: { label: '🟡 ENVIADA', className: 'bg-yellow-500' },
      RECIBIDA: { label: '🟢 RECIBIDA', className: 'bg-green-500' },
      CANCELADA: { label: '🔴 CANCELADA', className: 'bg-red-500' },
    }
    const config = estados[estado] || estados.BORRADOR
    return <Badge className={config.className}>{config.label}</Badge>
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Órdenes de Compra</h1>
          <p className="text-muted-foreground mt-2">Gestiona las órdenes de compra a proveedores</p>
        </div>
        <Button asChild>
          <Link href="/ordenes-compra/nueva">
            <Plus className="h-4 w-4 mr-2" />
            Nueva OC
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número..."
                value={filtros.buscar}
                onChange={(e) => setFiltros({ ...filtros, buscar: e.target.value })}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setFiltros({ buscar: '', estado: 'TODOS' })}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de OC */}
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Mostrando {ordenes.length} órdenes de compra</div>
        {ordenes.map((oc) => (
          <Card key={oc.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg">{oc.numero}</span>
                    {getEstadoBadge(oc.estado)}
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(oc.fecha), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Proveedor:</span> {oc.proveedor.razonSocial}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {oc.productos.length} producto(s) • ${oc.total.toLocaleString('es-CL')}
                  </div>
                </div>
                <div className="flex gap-2">
                  {oc.pdfGenerado && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/ordenes-compra/${oc.id}`}>Ver →</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

