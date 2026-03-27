'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, FileDown, CheckCircle2, Edit } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

async function obtenerPresupuesto(id: string) {
  const response = await fetch(`/api/presupuestos/${id}`)
  if (!response.ok) {
    throw new Error('Presupuesto no encontrado')
  }
  const result = await response.json()
  return result.data
}

async function aceptarPresupuesto(id: string) {
  const response = await fetch(`/api/presupuestos/${id}/aceptar`, {
    method: 'POST',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al aceptar presupuesto')
  }

  return response.json()
}

const estadoLabels: Record<string, string> = {
  BORRADOR: 'Borrador',
  ENVIADO: 'Enviado',
  ACEPTADO: 'Aceptado',
  RECHAZADO: 'Rechazado',
}

export default function PresupuestoDetallePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const queryClient = useQueryClient()

  const { data: presupuesto, isLoading, error } = useQuery({
    queryKey: ['presupuesto', id],
    queryFn: () => obtenerPresupuesto(id),
  })

  const acceptMutation = useMutation({
    mutationFn: () => aceptarPresupuesto(id),
    onSuccess: (response) => {
      toast.success('Presupuesto aceptado correctamente')
      queryClient.invalidateQueries({ queryKey: ['presupuesto', id] })
      queryClient.invalidateQueries({ queryKey: ['operaciones'] })
      router.push(`/operaciones/${response.data.operacionId}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleDownloadPDF = async () => {
    try {
      toast.loading('Generando PDF...')
      const response = await fetch(`/api/presupuestos/${id}/pdf`)
      if (!response.ok) throw new Error('Error al generar PDF')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Presupuesto-${presupuesto.numero}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast.dismiss()
      toast.success('PDF descargado')
    } catch (err) {
      toast.dismiss()
      toast.error('Error al descargar PDF')
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando presupuesto...</p>
      </div>
    )
  }

  if (error || !presupuesto) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Presupuesto no encontrado</p>
          <Button asChild className="mt-4">
            <Link href="/presupuestos">Volver a Presupuestos</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/presupuestos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{presupuesto.numero}</h1>
              <Badge variant="outline">{estadoLabels[presupuesto.estado]}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Presupuesto para cliente
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <FileDown className="h-4 w-4 mr-2" />
            PDF
          </Button>
          
          {presupuesto.estado === 'BORRADOR' && (
            <Button variant="outline" asChild>
              <Link href={`/presupuestos/${id}/editar`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
          )}

          {(presupuesto.estado === 'BORRADOR' || presupuesto.estado === 'ENVIADO') && (
            <Button 
              onClick={() => acceptMutation.mutate()} 
              disabled={acceptMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {acceptMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Aceptar y Crear Operación
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo Pallet</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio Unitario</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {presupuesto.lineas.map((linea: any) => (
                    <TableRow key={linea.id}>
                      <TableCell className="font-medium">
                        {linea.tipoPallet?.nombre || 'Pallet'}
                        {linea.descripcion && (
                          <p className="text-xs text-muted-foreground font-normal mt-0.5">
                            {linea.descripcion}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{linea.cantidad}</TableCell>
                      <TableCell className="text-right">
                        {linea.precioUnitario.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {(linea.cantidad * linea.precioUnitario).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {presupuesto.observaciones && (
            <Card>
              <CardHeader>
                <CardTitle>Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {presupuesto.observaciones}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Presupuesto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Fecha</p>
                <p className="font-medium">{format(new Date(presupuesto.fecha), 'PPP', { locale: es })}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Ciudad / Destino</p>
                <p className="font-medium">{presupuesto.ciudad || 'No especificada'}</p>
              </div>
              {presupuesto.direccion && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Dirección</p>
                  <p className="font-medium text-sm">{presupuesto.direccion}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Totales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{presupuesto.subtotal.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (19%)</span>
                <span>{presupuesto.iva.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</span>
              </div>
              <div className="pt-3 border-t border-primary/20 flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-black text-primary">
                  {presupuesto.total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

