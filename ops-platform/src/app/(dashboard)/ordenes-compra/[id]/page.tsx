'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash2, Download, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { formatRutForDisplay } from '@/lib/validations/rut'
import { toast } from 'sonner'
import { mapOrdenCompraApiToUi, type OrdenCompraUi } from '@/lib/ordenes-compra/ui-map'
import { ConfirmIrreversibleActionDialog } from '@/components/shared/confirm-irreversible-action-dialog'

async function fetchOrdenCompraById(id: string): Promise<OrdenCompraUi | null> {
  const response = await fetch(`/api/ordenes-compra/${id}`)
  if (response.status === 404) {
    return null
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || 'Error al cargar la orden de compra')
  }
  const json = await response.json()
  return mapOrdenCompraApiToUi(json.data)
}

export default function OrdenCompraDetallePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const queryClient = useQueryClient()
  const [isDownloading, setIsDownloading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const {
    data: oc,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['orden-compra', id],
    queryFn: () => fetchOrdenCompraById(id),
    enabled: Boolean(id),
  })

  const handleDescargarPDF = async () => {
    if (!oc) return
    try {
      setIsDownloading(true)
      toast.loading('Generando PDF...', { id: 'download-pdf' })

      const response = await fetch(`/api/ordenes-compra/${id}/descargar-pdf`)

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        throw new Error(errBody.error || 'Error al descargar PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${oc.numero}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('PDF descargado correctamente', { id: 'download-pdf' })
      queryClient.invalidateQueries({ queryKey: ['orden-compra', id] })
    } catch (e: unknown) {
      console.error('Error al descargar PDF:', e)
      const message = e instanceof Error ? e.message : 'Error al descargar PDF'
      toast.error(message, { id: 'download-pdf' })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleConfirmDeleteOrden = async () => {
    const response = await fetch(`/api/ordenes-compra/${id}`, { method: 'DELETE' })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
      const msg = body.error || 'No se pudo eliminar la orden de compra'
      toast.error(msg)
      throw new Error(msg)
    }
    toast.success(body.message || 'Orden de compra eliminada')
    await queryClient.invalidateQueries({ queryKey: ['ordenes-compra'] })
    router.push('/ordenes-compra')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex flex-col items-center justify-center gap-4 min-h-[240px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
        <p className="text-muted-foreground">Cargando orden de compra…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center text-destructive text-sm">{(error as Error).message}</p>
        <Button asChild className="mt-4 block mx-auto">
          <Link href="/ordenes-compra">Volver a Órdenes de Compra</Link>
        </Button>
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
            <Link href="/ordenes-compra" aria-label="Volver al listado">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{oc.numero}</h1>
            <p className="text-muted-foreground mt-2">Fecha: {format(new Date(oc.fecha), 'dd/MM/yyyy')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {oc.estado === 'BORRADOR' && (
            <>
              <Button variant="outline" type="button" asChild>
                <Link href={`/ordenes-compra/${id}/editar`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </Button>
              <Button
                variant="destructive"
                size="icon"
                type="button"
                aria-label="Eliminar orden de compra"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <ConfirmIrreversibleActionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="¿Eliminar esta orden de compra?"
        entitySummary={`Orden ${oc.numero} · Solo se pueden eliminar órdenes en borrador.`}
        warningText="Esta acción es irreversible. La orden y sus líneas dejarán de existir en el sistema."
        onConfirm={handleConfirmDeleteOrden}
      />

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
                {oc.proveedor ? (
                  <p className="font-medium">
                    {oc.proveedor.razonSocial} ({formatRutForDisplay(oc.proveedor.rut)})
                  </p>
                ) : (
                  <p className="font-medium text-muted-foreground">—</p>
                )}
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Fecha Entrega:</span>
                <p className="font-medium">
                  {oc.fechaEntregaEsperada ? format(new Date(oc.fechaEntregaEsperada), 'dd/MM/yyyy') : '—'}
                </p>
              </div>
              {oc.direccionEntrega && (
                <div>
                  <span className="text-sm text-muted-foreground">Dirección:</span>
                  <p className="font-medium">{oc.direccionEntrega}</p>
                </div>
              )}
              {oc.presupuesto ? (
                <div>
                  <span className="text-sm text-muted-foreground">Presupuesto:</span>
                  <p className="font-medium">
                    <Link
                      href={`/presupuestos/${oc.presupuesto.id}`}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {oc.presupuesto.numero}
                    </Link>
                  </p>
                </div>
              ) : null}
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
                {oc.productos.map((producto, idx) => (
                  <tr key={`${producto.tipo}-${idx}`} className="border-b">
                    <td className="p-2">
                      <div className="flex max-w-xl flex-col gap-1">
                        <span className="font-medium">{producto.tipo}</span>
                        {producto.detallePallet ? (
                          <span className="text-sm text-muted-foreground">{producto.detallePallet}</span>
                        ) : null}
                      </div>
                    </td>
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
            <p className="text-sm whitespace-pre-wrap">{oc.observaciones}</p>
          </CardContent>
        </Card>
      )}

      {/* PDF */}
      <Card>
        <CardHeader>
          <CardTitle>Descargar Orden de Compra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm text-muted-foreground">
                {oc.pdfGenerado
                  ? `PDF generado el ${format(new Date(oc.fecha), 'dd/MM/yyyy')}`
                  : 'Descarga el PDF de esta orden de compra'}
              </p>
            </div>
            <Button variant="outline" type="button" onClick={handleDescargarPDF} disabled={isDownloading}>
              <Download className="h-4 w-4 mr-2" aria-hidden />
              {isDownloading ? 'Generando...' : 'Descargar PDF'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            {oc.estado === 'ENVIADA' && (
              <Button variant="outline" className="flex-1" type="button">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar como Recibida
              </Button>
            )}
            {oc.estado !== 'CANCELADA' && oc.estado !== 'RECIBIDA' && (
              <Button variant="destructive" className="flex-1" type="button">
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
