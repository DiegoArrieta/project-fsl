'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Edit, FileText, DollarSign, Building2, Lock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { formatRutForDisplay } from '@/lib/validations/rut'
import { calcularTotalesDesdeLineas, isDocumentoPresente } from '@/lib/operaciones/operacion-ui-helpers'
import type {
  DocumentoOperacionApi,
  OperacionApi,
  OperacionLineaApi,
  OperacionProveedorRowApi,
  PagoOperacionApi,
} from '@/types/operacion-api'
import { RegistrarPagoDialog } from '@/components/operaciones/RegistrarPagoDialog'
import { RegistrarFactoringDialog } from '@/components/operaciones/RegistrarFactoringDialog'
import { AdjuntarDocumentoDialog } from '@/components/operaciones/AdjuntarDocumentoDialog'

async function fetchOperacionById(id: string): Promise<OperacionApi | null> {
  const response = await fetch(`/api/operaciones/${id}`)
  if (response.status === 404) {
    return null
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || 'Error al cargar la operación')
  }
  const json = await response.json()
  return json.data as OperacionApi
}

export default function OperacionDetallePage() {
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const [registrarPagoOpen, setRegistrarPagoOpen] = useState(false)
  const [factoringDialogOpen, setFactoringDialogOpen] = useState(false)
  const [adjuntarDocumentoOpen, setAdjuntarDocumentoOpen] = useState(false)

  const {
    data: operacion,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['operacion', id],
    queryFn: () => fetchOperacionById(id),
    enabled: Boolean(id),
  })

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex flex-col items-center justify-center gap-4 min-h-[240px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
        <p className="text-muted-foreground">Cargando operación…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-destructive text-sm">{(error as Error).message}</div>
        <Button asChild className="mt-4 block mx-auto">
          <Link href="/operaciones">Volver a Operaciones</Link>
        </Button>
      </div>
    )
  }

  if (!operacion) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Operación no encontrada</p>
          <Button asChild className="mt-4">
            <Link href="/operaciones">Volver a Operaciones</Link>
          </Button>
        </div>
      </div>
    )
  }

  const lineas = operacion.lineas || []
  const documentos = operacion.documentos || []
  const pagos = operacion.pagos || []
  const tieneCliente = Boolean(operacion.cliente)
  const tieneProveedor = (operacion.proveedores?.length ?? 0) > 0
  const totales = calcularTotalesDesdeLineas(operacion.tipo, lineas)
  const docsPresentes = documentos.filter((d: DocumentoOperacionApi) => isDocumentoPresente(d)).length

  const getTipoBadge = (tipo: string) => {
    const tipos: Record<string, { label: string; className: string }> = {
      COMPRA: { label: '📦 COMPRA', className: 'bg-blue-500' },
      VENTA_DIRECTA: { label: '💰 VENTA DIRECTA', className: 'bg-green-500' },
      VENTA_COMISION: { label: '🤝 VENTA COMISIÓN', className: 'bg-purple-500' },
    }
    const config = tipos[tipo] || tipos.COMPRA
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const labelProducto = (linea: OperacionLineaApi) =>
    linea.tipoPallet?.nombre || linea.tipoPallet?.codigo || 'Producto'

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/operaciones" aria-label="Volver al listado de operaciones">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold">{operacion.numero}</h1>
              {getTipoBadge(operacion.tipo)}
            </div>
            <p className="text-muted-foreground mt-2">
              Fecha: {format(new Date(operacion.fecha), 'dd/MM/yyyy')}
            </p>
          </div>
        </div>
        {operacion.estadoFinanciero !== 'CERRADA' && (
          <Button variant="outline" type="button">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {operacion.cliente && (
              <div>
                <span className="text-sm text-muted-foreground">Cliente:</span>
                <p className="font-medium">
                  {operacion.cliente.razonSocial} ({formatRutForDisplay(operacion.cliente.rut)})
                </p>
              </div>
            )}
            {operacion.proveedores && operacion.proveedores.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground">Proveedor(es):</span>
                <p className="font-medium">
                  {operacion.proveedores
                    .map((op: OperacionProveedorRowApi) => op.proveedor?.razonSocial)
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            )}
            {operacion.direccionEntrega && (
              <div>
                <span className="text-sm text-muted-foreground">Dirección:</span>
                <p className="font-medium">{operacion.direccionEntrega}</p>
              </div>
            )}
            {operacion.ordenCompraCliente && (
              <div>
                <span className="text-sm text-muted-foreground">OC Cliente:</span>
                <p className="font-medium">{operacion.ordenCompraCliente}</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <Badge variant={operacion.estadoDocumental === 'COMPLETA' ? 'default' : 'destructive'}>
              {operacion.estadoDocumental === 'COMPLETA' ? '🟢' : '🔴'} Docs: {docsPresentes}/
              {documentos.length} — {operacion.estadoDocumental}
            </Badge>
            <Badge variant={operacion.estadoFinanciero === 'CERRADA' ? 'default' : 'secondary'}>
              {operacion.estadoFinanciero === 'PENDIENTE'
                ? '⚪'
                : operacion.estadoFinanciero === 'FACTURADA'
                  ? '🟡'
                  : operacion.estadoFinanciero === 'PAGADA'
                    ? '🟢'
                    : '✅'}{' '}
              {operacion.estadoFinanciero}
            </Badge>
          </div>
        </CardContent>
      </Card>

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
                  <th className="text-left p-2">Cant.</th>
                  <th className="text-left p-2">Entregado</th>
                  <th className="text-left p-2">Dañados</th>
                  {String(operacion.tipo).startsWith('VENTA_') && (
                    <>
                      <th className="text-left p-2">Precio Venta</th>
                      <th className="text-left p-2">Precio Compra</th>
                      <th className="text-left p-2">Margen u.</th>
                    </>
                  )}
                  {operacion.tipo === 'COMPRA' && <th className="text-left p-2">Precio unit.</th>}
                </tr>
              </thead>
              <tbody>
                {lineas.map((producto: OperacionLineaApi) => {
                  const pv = Number(producto.precioVentaUnitario ?? 0)
                  const pc = Number(producto.precioCompraUnitario ?? 0)
                  const margenU = pv - pc
                  return (
                    <tr key={producto.id || `${producto.tipoPalletId}-${producto.cantidad}`} className="border-b">
                      <td className="p-2">{labelProducto(producto)}</td>
                      <td className="p-2">{producto.cantidad}</td>
                      <td className="p-2">
                        {producto.cantidadEntregada}{' '}
                        {producto.cantidadEntregada === producto.cantidad ? '✓' : ''}
                      </td>
                      <td className="p-2">
                        {producto.cantidadDanada > 0 ? (
                          <span className="text-destructive">⚠️ {producto.cantidadDanada}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      {String(operacion.tipo).startsWith('VENTA_') && (
                        <>
                          <td className="p-2">${pv.toLocaleString('es-CL')}</td>
                          <td className="p-2">${pc.toLocaleString('es-CL')}</td>
                          <td className="p-2">${margenU.toLocaleString('es-CL')}</td>
                        </>
                      )}
                      {operacion.tipo === 'COMPRA' && (
                        <td className="p-2">
                          ${Number(producto.precioUnitario ?? 0).toLocaleString('es-CL')}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {String(operacion.tipo).startsWith('VENTA_') && lineas.length > 0 && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Venta:</span>
                    <span className="font-semibold">${totales.totalVenta.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Compra (est.):</span>
                    <span className="font-semibold">${totales.totalCompra.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Margen Bruto:</span>
                    <span className="font-semibold">
                      ${totales.margenBruto.toLocaleString('es-CL')} (
                      {totales.margenPorcentual.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="documentos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documentos">
            <FileText className="h-4 w-4 mr-2" />
            Documentos ({docsPresentes}/{documentos.length})
          </TabsTrigger>
          <TabsTrigger value="pagos">
            <DollarSign className="h-4 w-4 mr-2" />
            Pagos ({pagos.length})
          </TabsTrigger>
          {String(operacion.tipo).startsWith('VENTA_') && (
            <TabsTrigger value="factoring">
              <Building2 className="h-4 w-4 mr-2" />
              Factoring
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="documentos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Documentos</CardTitle>
              {operacion.estadoFinanciero !== 'CERRADA' && (
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setAdjuntarDocumentoOpen(true)}
                >
                  <FileText className="h-4 w-4 mr-2" aria-hidden />
                  Adjuntar
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {documentos.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No hay documentos registrados</p>
              ) : (
                documentos.map((doc: DocumentoOperacionApi) => {
                  const presente = isDocumentoPresente(doc)
                  const labelTipo = String(doc.tipo || '').replace(/_/g, ' ')
                  return (
                    <div
                      key={doc.id}
                      className={`flex items-center justify-between p-3 rounded-md border ${
                        presente ? 'bg-background' : 'bg-destructive/10 border-destructive'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span aria-hidden>{presente ? '✅' : '❌'}</span>
                        <div className="min-w-0">
                          <p className="font-medium">{labelTipo}</p>
                          {doc.numeroDocumento && (
                            <p className="text-sm text-muted-foreground">N° {doc.numeroDocumento}</p>
                          )}
                          {!presente && (
                            <p className="text-sm text-destructive">Sin archivo adjunto</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pagos</CardTitle>
              {operacion.estadoFinanciero !== 'CERRADA' && (
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setRegistrarPagoOpen(true)}
                >
                  <DollarSign className="h-4 w-4 mr-2" aria-hidden />
                  Registrar pago
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {pagos.length > 0 ? (
                <div className="space-y-3">
                  {pagos.map((pago: PagoOperacionApi) => (
                    <div key={pago.id} className="flex items-center justify-between p-3 rounded-md border">
                      <div>
                        <p className="font-medium">{String(pago.tipo).replace(/_/g, ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(pago.fechaPago), 'dd/MM/yyyy')} • {pago.metodoPago || '—'}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ${Number(pago.monto).toLocaleString('es-CL')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No hay pagos registrados</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <RegistrarPagoDialog
          operacionId={operacion.id}
          tipoOperacion={operacion.tipo}
          tieneCliente={tieneCliente}
          tieneProveedor={tieneProveedor}
          open={registrarPagoOpen}
          onOpenChange={setRegistrarPagoOpen}
          onRegistered={() => {
            queryClient.invalidateQueries({ queryKey: ['operacion', id] })
          }}
        />

        <AdjuntarDocumentoDialog
          operacionId={operacion.id}
          open={adjuntarDocumentoOpen}
          onOpenChange={setAdjuntarDocumentoOpen}
          onGuardado={() => {
            queryClient.invalidateQueries({ queryKey: ['operacion', id] })
          }}
        />

        {String(operacion.tipo).startsWith('VENTA_') && (
          <TabsContent value="factoring" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Factoring</CardTitle>
                {operacion.estadoFinanciero !== 'CERRADA' && operacion.factoring && (
                  <Button type="button" variant="outline" size="sm" onClick={() => setFactoringDialogOpen(true)}>
                    Editar
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {operacion.factoring ? (
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Empresa:</span>{' '}
                      {operacion.factoring.empresaFactoring?.nombre ?? '—'}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Fecha:</span>{' '}
                      {operacion.factoring.fechaFactoring
                        ? format(new Date(operacion.factoring.fechaFactoring), 'dd/MM/yyyy')
                        : '—'}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Monto factura:</span>{' '}
                      ${Number(operacion.factoring.montoFactura).toLocaleString('es-CL')}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Monto adelantado:</span>{' '}
                      ${Number(operacion.factoring.montoAdelantado ?? 0).toLocaleString('es-CL')}
                    </p>
                    {operacion.factoring.comisionFactoring != null && (
                      <p>
                        <span className="text-muted-foreground">Comisión:</span>{' '}
                        ${Number(operacion.factoring.comisionFactoring).toLocaleString('es-CL')}
                      </p>
                    )}
                    {operacion.factoring.fechaVencimiento && (
                      <p>
                        <span className="text-muted-foreground">Vencimiento:</span>{' '}
                        {format(new Date(operacion.factoring.fechaVencimiento), 'dd/MM/yyyy')}
                      </p>
                    )}
                    {operacion.factoring.observaciones && (
                      <p className="whitespace-pre-wrap pt-2 border-t">
                        <span className="text-muted-foreground">Obs.:</span> {operacion.factoring.observaciones}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No hay factoring registrado</p>
                )}
                {operacion.estadoFinanciero !== 'CERRADA' && !operacion.factoring && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    type="button"
                    onClick={() => setFactoringDialogOpen(true)}
                  >
                    Registrar factoring
                  </Button>
                )}
              </CardContent>
            </Card>

            <RegistrarFactoringDialog
              operacionId={id}
              factoring={operacion.factoring ?? null}
              open={factoringDialogOpen}
              onOpenChange={setFactoringDialogOpen}
              onSaved={() => {
                queryClient.invalidateQueries({ queryKey: ['operacion', id] })
              }}
            />
          </TabsContent>
        )}
      </Tabs>

      {operacion.observaciones && (
        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{operacion.observaciones}</p>
          </CardContent>
        </Card>
      )}

      {operacion.estadoFinanciero !== 'CERRADA' && (
        <Card>
          <CardContent className="pt-6">
            <Button variant="destructive" className="w-full" type="button">
              <Lock className="h-4 w-4 mr-2" />
              Cerrar Operación
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
