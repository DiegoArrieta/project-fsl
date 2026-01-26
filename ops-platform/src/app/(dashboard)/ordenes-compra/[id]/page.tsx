'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockOrdenesCompra } from '@/lib/mocks'
import { ArrowLeft, Edit, Trash2, Download, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { formatRutForDisplay } from '@/lib/validations/rut'

export default function OrdenCompraDetallePage() {
  const params = useParams()
  const id = params.id as string
  const [oc, setOc] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const orden = mockOrdenesCompra.find((o) => o.id === id)
    if (orden) {
      setOc(orden)
      setLoading(false)
    }
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Cargando...</div>
      </div>
    )
  }

  if (!oc) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Orden de compra no encontrada</p>
          <Button asChild className="mt-4">
            <Link href="/ordenes-compra">Volver a Órdenes de Compra</Link>
          </Button>
        </div>
      </div>
    )
  }

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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/ordenes-compra">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{oc.numero}</h1>
            <p className="text-muted-foreground mt-2">
              Fecha: {format(new Date(oc.fecha), 'dd/MM/yyyy')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {oc.estado === 'BORRADOR' && (
            <>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Información General */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold">ORDEN DE COMPRA {oc.numero}</span>
              {getEstadoBadge(oc.estado)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Proveedor:</span>
                <p className="font-medium">
                  {oc.proveedor.razonSocial} ({formatRutForDisplay(oc.proveedor.rut)})
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Fecha Entrega:</span>
                <p className="font-medium">
                  {oc.fechaEntregaEsperada ? format(new Date(oc.fechaEntregaEsperada), 'dd/MM/yyyy') : '-'}
                </p>
              </div>
              {oc.direccionEntrega && (
                <div>
                  <span className="text-sm text-muted-foreground">Dirección:</span>
                  <p className="font-medium">{oc.direccionEntrega}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Productos */}
      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Producto</th>
                  <th className="text-left p-2">Cantidad</th>
                  <th className="text-left p-2">Precio Unit.</th>
                  <th className="text-left p-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {oc.productos.map((producto: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2">{producto.tipo}</td>
                    <td className="p-2">{producto.cantidad}</td>
                    <td className="p-2">${producto.precioUnitario.toLocaleString('es-CL')}</td>
                    <td className="p-2">${producto.subtotal.toLocaleString('es-CL')}</td>
                  </tr>
                ))}
                <tr className="border-t font-semibold">
                  <td colSpan={3} className="p-2 text-right">
                    TOTAL:
                  </td>
                  <td className="p-2">${oc.total.toLocaleString('es-CL')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Observaciones */}
      {oc.observaciones && (
        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{oc.observaciones}</p>
          </CardContent>
        </Card>
      )}

      {/* PDF */}
      {oc.pdfGenerado && (
        <Card>
          <CardHeader>
            <CardTitle>PDF Generado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">PDF generado el {format(new Date(oc.fecha), 'dd/MM/yyyy')}</p>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acciones */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            {oc.estado === 'ENVIADA' && (
              <Button variant="outline" className="flex-1">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar como Recibida
              </Button>
            )}
            {oc.estado !== 'CANCELADA' && oc.estado !== 'RECIBIDA' && (
              <Button variant="destructive" className="flex-1">
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar OC
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

