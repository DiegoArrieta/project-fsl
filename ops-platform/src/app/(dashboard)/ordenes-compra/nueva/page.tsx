'use client'

import { useRouter } from 'next/navigation'
import { useFormik, FormikProvider } from 'formik'
import * as Yup from 'yup'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, Trash2, Save, FileText, Package, DollarSign, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface ProveedorOption {
  id: string
  razonSocial: string
}

interface TipoPalletOption {
  id: string
  codigo: string
  nombre: string | null
}

interface LineaForm {
  tipoPalletId: string
  cantidad: number
  precioUnitario: number
}

async function fetchProveedoresActivos(): Promise<ProveedorOption[]> {
  const response = await fetch('/api/proveedores?activo=true&pageSize=500')
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || 'Error al cargar proveedores')
  }
  const json = await response.json()
  return (json.data ?? []) as ProveedorOption[]
}

async function fetchTiposPallet(): Promise<TipoPalletOption[]> {
  const response = await fetch('/api/tipos-pallet')
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || 'Error al cargar tipos de pallet')
  }
  const json = await response.json()
  return (json.data ?? []) as TipoPalletOption[]
}

const validationSchema = Yup.object().shape({
  proveedorId: Yup.string()
    .required('Seleccione un proveedor')
    .uuid('Identificador de proveedor no válido'),
  fecha: Yup.string().required('Fecha es requerida'),
  fechaEntregaEsperada: Yup.string().nullable(),
  direccionEntrega: Yup.string().nullable(),
  productos: Yup.array()
    .min(1, 'Debe agregar al menos un producto')
    .of(
      Yup.object().shape({
        tipoPalletId: Yup.string().uuid('Tipo de pallet es requerido').required(),
        cantidad: Yup.number().integer().min(1, 'Cantidad debe ser mayor a 0').required(),
        precioUnitario: Yup.number().min(0, 'Precio debe ser mayor o igual a 0').required(),
      })
    )
    .required(),
  observaciones: Yup.string().nullable(),
})

export default function NuevaOrdenCompraPage() {
  const router = useRouter()

  const { data: proveedores = [], isLoading: loadingProveedores, error: errorProveedores } = useQuery({
    queryKey: ['proveedores-oc-nueva'],
    queryFn: fetchProveedoresActivos,
  })

  const { data: tiposPallet = [], isLoading: loadingTipos, error: errorTipos } = useQuery({
    queryKey: ['tipos-pallet'],
    queryFn: fetchTiposPallet,
  })

  const isLoadingCatalogos = loadingProveedores || loadingTipos
  const errorCatalogos = errorProveedores || errorTipos

  const formik = useFormik({
    initialValues: {
      proveedorId: '',
      fecha: new Date().toISOString().split('T')[0],
      fechaEntregaEsperada: '',
      direccionEntrega: '',
      productos: [] as LineaForm[],
      observaciones: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          proveedorId: values.proveedorId,
          fecha: values.fecha,
          ...(values.fechaEntregaEsperada?.trim()
            ? { fechaEntrega: values.fechaEntregaEsperada.trim() }
            : {}),
          ...(values.direccionEntrega?.trim() ? { direccionEntrega: values.direccionEntrega.trim() } : {}),
          ...(values.observaciones?.trim() ? { observaciones: values.observaciones.trim() } : {}),
          productos: values.productos.map((p) => ({
            tipoPalletId: p.tipoPalletId,
            cantidad: p.cantidad,
            precioUnitario: p.precioUnitario,
          })),
        }

        const response = await fetch('/api/ordenes-compra', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const json = await response.json().catch(() => ({}))

        if (!response.ok) {
          const msg =
            typeof json.error === 'string'
              ? json.error
              : Array.isArray(json.issues)
                ? json.issues.map((i: { message?: string }) => i.message).filter(Boolean).join('. ')
                : 'Error al crear orden de compra'
          throw new Error(msg || 'Error al crear orden de compra')
        }

        toast.success(json.message || 'Orden de compra creada correctamente')
        const nuevaId = json.data?.id as string | undefined
        if (nuevaId) {
          router.push(`/ordenes-compra/${nuevaId}`)
        } else {
          router.push('/ordenes-compra')
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Error al crear orden de compra'
        toast.error(message)
      }
    },
  })

  const agregarProducto = () => {
    formik.setFieldValue('productos', [
      ...formik.values.productos,
      {
        tipoPalletId: '',
        cantidad: 0,
        precioUnitario: 0,
      },
    ])
  }

  const eliminarProducto = (index: number) => {
    const nuevos = formik.values.productos.filter((_, i) => i !== index)
    formik.setFieldValue('productos', nuevos)
  }

  const total = formik.values.productos.reduce((sum, p) => sum + (p.cantidad || 0) * (p.precioUnitario || 0), 0)

  if (errorCatalogos) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/ordenes-compra" aria-label="Volver">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <p className="text-destructive text-sm">{(errorCatalogos as Error).message}</p>
      </div>
    )
  }

  return (
    <FormikProvider value={formik}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="hover:bg-accent">
            <Link href="/ordenes-compra" aria-label="Volver a órdenes de compra">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-tight">Nueva Orden de Compra</h1>
            <p className="text-lg text-muted-foreground">Completa los datos de la orden de compra</p>
          </div>
        </div>

        {isLoadingCatalogos ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
            <p>Cargando proveedores y tipos de pallet…</p>
          </div>
        ) : (
          <form noValidate onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Información General */}
            <Card className="shadow-lg border-none">
              <CardHeader className="space-y-1 bg-gradient-to-br from-blue-50/50 dark:from-blue-950/20 to-background">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden />
                  </div>
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <Label htmlFor="proveedorId" className="text-sm font-semibold">
                    Proveedor <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formik.values.proveedorId || undefined}
                    onValueChange={(value) => {
                      void formik.setFieldValue('proveedorId', value, true)
                      void formik.setFieldTouched('proveedorId', true, false)
                    }}
                  >
                    <SelectTrigger id="proveedorId" className="mt-2" aria-required>
                      <SelectValue placeholder="Selecciona un proveedor..." />
                    </SelectTrigger>
                    <SelectContent className="z-200">
                      {proveedores.map((proveedor) => (
                        <SelectItem key={proveedor.id} value={proveedor.id}>
                          {proveedor.razonSocial}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.errors.proveedorId && formik.touched.proveedorId && (
                    <p className="text-sm text-destructive mt-2">{formik.errors.proveedorId}</p>
                  )}
                  {proveedores.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      No hay proveedores activos. Cree uno en Contactos antes de generar una OC.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fecha" className="text-sm font-semibold">
                      Fecha <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fecha"
                      name="fecha"
                      type="date"
                      value={formik.values.fecha}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="mt-2"
                    />
                    {formik.errors.fecha && formik.touched.fecha && (
                      <p className="text-sm text-destructive mt-2">{String(formik.errors.fecha)}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="fechaEntregaEsperada" className="text-sm font-semibold">
                      Fecha Entrega Esperada
                    </Label>
                    <Input
                      id="fechaEntregaEsperada"
                      name="fechaEntregaEsperada"
                      type="date"
                      value={formik.values.fechaEntregaEsperada}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="direccionEntrega" className="text-sm font-semibold">
                    Dirección de entrega
                  </Label>
                  <Input
                    id="direccionEntrega"
                    name="direccionEntrega"
                    value={formik.values.direccionEntrega}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Puerto Montt, Av. Principal 123"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Productos */}
            <Card className="shadow-lg border-none">
              <CardHeader className="space-y-1 bg-gradient-to-br from-green-50/50 dark:from-green-950/20 to-background">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 bg-green-100 dark:bg-green-950/50 rounded-lg">
                    <Package className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden />
                  </div>
                  Productos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {formik.values.productos.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr className="border-b">
                          <th className="text-left p-3 font-semibold">Tipo Pallet *</th>
                          <th className="text-left p-3 font-semibold">Cantidad *</th>
                          <th className="text-left p-3 font-semibold">Precio Unit. *</th>
                          <th className="text-left p-3 font-semibold">Subtotal</th>
                          <th className="text-center p-3 font-semibold">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formik.values.productos.map((producto, index) => (
                          <tr key={index} className="border-b hover:bg-accent/50 transition-colors">
                            <td className="p-3">
                              <Select
                                value={producto.tipoPalletId || undefined}
                                onValueChange={(value) =>
                                  formik.setFieldValue(`productos.${index}.tipoPalletId`, value)
                                }
                              >
                                <SelectTrigger className="w-44 min-w-[11rem]">
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent className="z-200">
                                  {tiposPallet.map((tipo) => (
                                    <SelectItem key={tipo.id} value={tipo.id}>
                                      {tipo.codigo}
                                      {tipo.nombre ? ` — ${tipo.nombre}` : ''}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {typeof formik.errors.productos?.[index] === 'object' &&
                                formik.errors.productos[index] &&
                                typeof (formik.errors.productos[index] as { tipoPalletId?: string }).tipoPalletId ===
                                  'string' && (
                                  <p className="text-xs text-destructive mt-1">
                                    {(formik.errors.productos[index] as { tipoPalletId: string }).tipoPalletId}
                                  </p>
                                )}
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                inputMode="numeric"
                                value={producto.cantidad || ''}
                                onChange={(e) =>
                                  formik.setFieldValue(
                                    `productos.${index}.cantidad`,
                                    parseInt(e.target.value, 10) || 0
                                  )
                                }
                                className="w-28"
                                min={1}
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                inputMode="decimal"
                                value={producto.precioUnitario === 0 ? '' : producto.precioUnitario}
                                onChange={(e) => {
                                  const raw = e.target.value
                                  const n = raw === '' ? 0 : parseFloat(raw.replace(',', '.'))
                                  formik.setFieldValue(`productos.${index}.precioUnitario`, Number.isFinite(n) ? n : 0)
                                }}
                                className="w-36"
                                min={0}
                                step="0.01"
                              />
                            </td>
                            <td className="p-3 font-semibold text-primary">
                              ${((producto.cantidad || 0) * (producto.precioUnitario || 0)).toLocaleString('es-CL')}
                            </td>
                            <td className="p-3 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => eliminarProducto(index)}
                                className="hover:bg-destructive/10 hover:text-destructive"
                                aria-label={`Eliminar línea ${index + 1}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" aria-hidden />
                    <p className="text-muted-foreground mb-4">No hay productos agregados</p>
                    <p className="text-sm text-muted-foreground">Haz clic en el botón de abajo para agregar productos</p>
                  </div>
                )}

                <Button type="button" variant="outline" onClick={agregarProducto} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" aria-hidden />
                  Agregar producto
                </Button>

                {formik.errors.productos && typeof formik.errors.productos === 'string' && (
                  <p className="text-sm text-destructive">{formik.errors.productos}</p>
                )}

                {tiposPallet.length === 0 && (
                  <p className="text-sm text-muted-foreground">No hay tipos de pallet activos en el sistema.</p>
                )}

                {formik.values.productos.length > 0 && (
                  <div className="flex items-center justify-end gap-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <DollarSign className="h-5 w-5 text-primary" aria-hidden />
                    <span className="text-lg font-bold text-primary">Total: ${total.toLocaleString('es-CL')}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Observaciones */}
            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle className="text-xl">Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="observaciones"
                  name="observaciones"
                  value={formik.values.observaciones}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Notas adicionales sobre esta orden de compra..."
                  rows={4}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/ordenes-compra">Cancelar</Link>
              </Button>
              <Button
                type="submit"
                disabled={formik.isSubmitting || proveedores.length === 0 || tiposPallet.length === 0}
                className="shadow-lg"
              >
                <Save className="h-4 w-4 mr-2" aria-hidden />
                {formik.isSubmitting ? 'Guardando…' : 'Crear orden (borrador)'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </FormikProvider>
  )
}
