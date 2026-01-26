'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mockOperaciones } from '@/lib/mocks'
import { ArrowLeft, Edit, FileText, DollarSign, Building2, Lock } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { formatRutForDisplay } from '@/lib/validations/rut'

export default function OperacionDetallePage() {
  const params = useParams()
  const id = params.id as string
  const [operacion, setOperacion] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const op = mockOperaciones.find((o) => o.id === id)
    if (op) {
      setOperacion(op)
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

  const getTipoBadge = (tipo: string) => {
    const tipos: Record<string, { label: string; className: string }> = {
      COMPRA: { label: '📦 COMPRA', className: 'bg-blue-500' },
      VENTA_DIRECTA: { label: '💰 VENTA DIRECTA', className: 'bg-green-500' },
      VENTA_COMISION: { label: '🤝 VENTA COMISIÓN', className: 'bg-purple-500' },
    }
    const config = tipos[tipo] || tipos.COMPRA
    return <Badge className={config.className}>{config.label}</Badge>
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/operaciones">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{operacion.numero}</h1>
              {getTipoBadge(operacion.tipo)}
            </div>
            <p className="text-muted-foreground mt-2">
              Fecha: {format(new Date(operacion.fecha), 'dd/MM/yyyy')}
            </p>
          </div>
        </div>
        {operacion.estadoFinanciero !== 'CERRADA' && (
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      {/* Información General */}
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
            {operacion.proveedor && (
              <div>
                <span className="text-sm text-muted-foreground">Proveedor:</span>
                <p className="font-medium">
                  {operacion.proveedor.razonSocial} ({formatRutForDisplay(operacion.proveedor.rut)})
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
          <div className="flex items-center gap-4 mt-4">
            <Badge variant={operacion.estadoDocumental === 'COMPLETA' ? 'default' : 'destructive'}>
              {operacion.estadoDocumental === 'COMPLETA' ? '🟢' : '🔴'} Docs:{' '}
              {operacion.documentos?.filter((d: any) => d.presente).length || 0}/
              {operacion.documentos?.length || 0} - {operacion.estadoDocumental}
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
                  <th className="text-left p-2">Cant.</th>
                  <th className="text-left p-2">Recibido</th>
                  <th className="text-left p-2">Dañados</th>
                  {operacion.tipo.startsWith('VENTA_') && (
                    <>
                      <th className="text-left p-2">Precio Venta</th>
                      <th className="text-left p-2">Precio Compra</th>
                      <th className="text-left p-2">Margen</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {operacion.productos.map((producto: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2">{producto.tipo}</td>
                    <td className="p-2">{producto.cantidad}</td>
                    <td className="p-2">
                      {producto.cantidadEntregada} {producto.cantidadEntregada === producto.cantidad ? '✓' : ''}
                    </td>
                    <td className="p-2">
                      {producto.cantidadDanada > 0 && (
                        <span className="text-destructive">⚠️ {producto.cantidadDanada}</span>
                      )}
                      {producto.cantidadDanada === 0 && '-'}
                    </td>
                    {operacion.tipo.startsWith('VENTA_') && (
                      <>
                        <td className="p-2">${(producto.precioVenta || 0).toLocaleString('es-CL')}</td>
                        <td className="p-2">${(producto.precioCompra || 0).toLocaleString('es-CL')}</td>
                        <td className="p-2">
                          ${((producto.precioVenta || 0) - (producto.precioCompra || 0)).toLocaleString('es-CL')}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {operacion.tipo.startsWith('VENTA_') && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Venta:</span>
                    <span className="font-semibold">${operacion.totalVenta.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Compra:</span>
                    <span className="font-semibold">${operacion.totalCompra.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Margen Bruto:</span>
                    <span className="font-semibold">
                      ${operacion.margenBruto.toLocaleString('es-CL')} ({operacion.margenPorcentual.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="documentos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documentos">
            <FileText className="h-4 w-4 mr-2" />
            Documentos ({operacion.documentos?.filter((d: any) => d.presente).length || 0}/
            {operacion.documentos?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="pagos">
            <DollarSign className="h-4 w-4 mr-2" />
            Pagos ({operacion.pagos?.length || 0})
          </TabsTrigger>
          {operacion.tipo.startsWith('VENTA_') && (
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
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Adjuntar
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {operacion.documentos?.map((doc: any) => (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between p-3 rounded-md border ${
                    doc.presente ? 'bg-background' : 'bg-destructive/10 border-destructive'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span>{doc.presente ? '✅' : '❌'}</span>
                    <div>
                      <p className="font-medium">{doc.tipo.replace('_', ' ')}</p>
                      {doc.numero && <p className="text-sm text-muted-foreground">N° {doc.numero}</p>}
                      {!doc.presente && <p className="text-sm text-destructive">← ¡FALTANTE!</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {doc.presente && (
                      <>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                        {operacion.estadoFinanciero !== 'CERRADA' && (
                          <Button variant="ghost" size="sm">
                            Eliminar
                          </Button>
                        )}
                      </>
                    )}
                    {!doc.presente && (
                      <Button variant="outline" size="sm">
                        Subir ahora
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pagos</CardTitle>
              {operacion.estadoFinanciero !== 'CERRADA' && (
                <Button variant="outline" size="sm">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Registrar Pago
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {operacion.pagos && operacion.pagos.length > 0 ? (
                <div className="space-y-3">
                  {operacion.pagos.map((pago: any) => (
                    <div key={pago.id} className="flex items-center justify-between p-3 rounded-md border">
                      <div>
                        <p className="font-medium">{pago.tipo.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(pago.fecha), 'dd/MM/yyyy')} • {pago.metodo}
                        </p>
                      </div>
                      <p className="font-semibold">${pago.monto.toLocaleString('es-CL')}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No hay pagos registrados</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {operacion.tipo.startsWith('VENTA_') && (
          <TabsContent value="factoring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Factoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-4">No hay factoring registrado</p>
                {operacion.estadoFinanciero !== 'CERRADA' && (
                  <Button variant="outline" className="w-full">
                    Registrar Factoring
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Observaciones */}
      {operacion.observaciones && (
        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{operacion.observaciones}</p>
          </CardContent>
        </Card>
      )}

      {/* Cerrar Operación */}
      {operacion.estadoFinanciero !== 'CERRADA' && (
        <Card>
          <CardContent className="pt-6">
            <Button variant="destructive" className="w-full">
              <Lock className="h-4 w-4 mr-2" />
              Cerrar Operación
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

