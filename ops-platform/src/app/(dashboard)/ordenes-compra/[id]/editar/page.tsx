'use client'

import { useRouter, useParams } from 'next/navigation'
import { useFormik, FormikProvider } from 'formik'
import * as Yup from 'yup'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, Trash2, Save, FileText, Package, DollarSign, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { TipoPalletSelectItemBody } from '@/components/ordenes-compra/tipo-pallet-select-item-body'
import { TipoPalletSelectTriggerResumen } from '@/components/ordenes-compra/tipo-pallet-select-trigger-resumen'
import {
  fetchTiposPalletCatalogoOrdenCompra,
  findTipoPalletCatalogoOc,
  tipoPalletSelectTypeaheadText,
  type TipoPalletCatalogoOc,
} from '@/lib/tipos-pallet/orden-compra-catalogo'
import {
  computeAgotaPresupuestoConEstaOrden,
  fetchDisponiblePresupuestoOrdenCompra,
  type LineaFormConPresupuesto,
} from '@/lib/ordenes-compra/fetch-presupuesto-disponible-oc'
import { Badge } from '@/components/ui/badge'
import { PresupuestoOrdenesAsociadasAlert } from '@/components/ordenes-compra/presupuesto-ordenes-asociadas-alert'

interface ProveedorOption {
  id: string
  razonSocial: string
}

interface LineaForm extends LineaFormConPresupuesto {}

interface OrdenCompraApiParaEditar {
  id: string
  numero: string
  estado: string
  proveedorId: string
  presupuestoId?: string | null
  fecha: string | Date
  fechaEntrega?: string | Date | null
  direccionEntrega?: string | null
  observaciones?: string | null
  presupuesto?: { id: string; numero: string; estado: string } | null
  lineas: Array<{
    tipoPalletId: string
    cantidad: number
    precioUnitario: unknown
    presupuestoLineaId?: string | null
  }>
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

async function fetchOrdenCompraParaEditar(id: string): Promise<OrdenCompraApiParaEditar | null> {
  const response = await fetch(`/api/ordenes-compra/${id}`)
  if (response.status === 404) return null
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || 'Error al cargar la orden de compra')
  }
  const json = await response.json()
  return json.data as OrdenCompraApiParaEditar
}

function toInputDate(value: string | Date | null | undefined): string {
  if (value == null) return ''
  if (typeof value === 'string') return value.includes('T') ? value.split('T')[0] : value.slice(0, 10)
  return value.toISOString().split('T')[0]
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

interface EditarOrdenFormProps {
  ordenId: string
  orden: OrdenCompraApiParaEditar
  proveedores: ProveedorOption[]
  tiposPallet: TipoPalletCatalogoOc[]
}

function EditarOrdenCompraForm({ ordenId, orden, proveedores, tiposPallet }: EditarOrdenFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const formik = useFormik({
    initialValues: {
      proveedorId: orden.proveedorId,
      presupuestoId: orden.presupuestoId ?? '',
      fecha: toInputDate(orden.fecha),
      fechaEntregaEsperada: toInputDate(orden.fechaEntrega),
      direccionEntrega: orden.direccionEntrega ?? '',
      productos: (orden.lineas ?? []).map((l) => ({
        tipoPalletId: l.tipoPalletId,
        cantidad: l.cantidad,
        precioUnitario: l.precioUnitario != null ? Number(l.precioUnitario) : 0,
        presupuestoLineaId: l.presupuestoLineaId ?? null,
      })) as LineaForm[],
      observaciones: orden.observaciones ?? '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          proveedorId: values.proveedorId,
          fecha: values.fecha,
          fechaEntrega: values.fechaEntregaEsperada?.trim() || '',
          direccionEntrega: values.direccionEntrega?.trim() ?? '',
          observaciones: values.observaciones?.trim() ?? '',
          ...(values.presupuestoId?.trim()
            ? { presupuestoId: values.presupuestoId.trim() }
            : { presupuestoId: null }),
          productos: values.productos.map((p) => ({
            tipoPalletId: p.tipoPalletId,
            cantidad: p.cantidad,
            precioUnitario: p.precioUnitario,
            ...(p.presupuestoLineaId ? { presupuestoLineaId: p.presupuestoLineaId } : {}),
          })),
        }

        const response = await fetch(`/api/ordenes-compra/${ordenId}`, {
          method: 'PUT',
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
                : 'Error al actualizar orden de compra'
          throw new Error(msg || 'Error al actualizar orden de compra')
        }

        toast.success(json.message || 'Orden de compra actualizada correctamente')
        await queryClient.invalidateQueries({ queryKey: ['orden-compra', ordenId] })
        router.push(`/ordenes-compra/${ordenId}`)
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Error al actualizar orden de compra'
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
        presupuestoLineaId: null,
      },
    ])
  }

  const eliminarProducto = (index: number) => {
    const nuevos = formik.values.productos.filter((_, i) => i !== index)
    formik.setFieldValue('productos', nuevos)
  }

  const total = formik.values.productos.reduce((sum, p) => sum + (p.cantidad || 0) * (p.precioUnitario || 0), 0)

  const presupuestoIdTrim = formik.values.presupuestoId?.trim() ?? ''
  const { data: disponibleData } = useQuery({
    queryKey: ['presupuesto-disponible-oc', presupuestoIdTrim, ordenId],
    queryFn: () =>
      fetchDisponiblePresupuestoOrdenCompra(presupuestoIdTrim, { excludeOrdenCompraId: ordenId }),
    enabled: Boolean(presupuestoIdTrim),
  })

  return (
    <FormikProvider value={formik}>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="hover:bg-accent">
            <Link href={`/ordenes-compra/${ordenId}`} aria-label="Volver al detalle">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-tight">Editar orden {orden.numero}</h1>
            <p className="text-lg text-muted-foreground">Modifica los datos del borrador</p>
          </div>
        </div>

        <form noValidate onSubmit={formik.handleSubmit} className="space-y-6">
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
                  <SelectTrigger id="proveedorId" type="button" className="mt-2" aria-required>
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
                    No hay proveedores activos. Cree uno en Contactos antes de guardar.
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

                {presupuestoIdTrim ? (
                  <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm" role="status">
                    <span className="text-muted-foreground">Presupuesto vinculado: </span>
                    <Badge variant="outline" className="ml-1">
                      {orden.presupuesto?.numero ?? disponibleData?.presupuesto.numero ?? presupuestoIdTrim}
                    </Badge>
                  </div>
                ) : null}
              </CardContent>
            </Card>

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
              {presupuestoIdTrim && disponibleData ? (
                <div
                  className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm"
                  role="status"
                >
                  <span className="text-muted-foreground">
                    Cliente:{' '}
                    <span className="font-medium text-foreground">
                      {disponibleData.presupuesto.cliente.razonSocial}
                    </span>
                  </span>
                  <Badge variant="outline">{disponibleData.presupuesto.numero}</Badge>
                  {computeAgotaPresupuestoConEstaOrden(disponibleData.lineas, formik.values.productos) ? (
                    <Badge>Con esta OC se agota el presupuesto</Badge>
                  ) : (
                    <Badge variant="secondary">Cobertura parcial — queda saldo en el presupuesto</Badge>
                  )}
                </div>
              ) : null}

              {presupuestoIdTrim && disponibleData ? (
                <PresupuestoOrdenesAsociadasAlert
                  ordenes={disponibleData.ordenesAsociadas ?? []}
                  presupuestoNumero={disponibleData.presupuesto.numero}
                />
              ) : null}

              {formik.values.productos.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold min-w-48">Pallet *</th>
                        <th className="text-left p-3 font-semibold whitespace-nowrap">Presup. / disp.</th>
                        <th className="text-left p-3 font-semibold">Cantidad *</th>
                        <th className="text-left p-3 font-semibold">Precio Unit. *</th>
                        <th className="text-left p-3 font-semibold">Subtotal</th>
                        <th className="text-center p-3 font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formik.values.productos.map((producto, index) => {
                        const tipoSel = findTipoPalletCatalogoOc(tiposPallet, producto.tipoPalletId)
                        const metaLinea = producto.presupuestoLineaId
                          ? disponibleData?.lineas.find(
                              (l) => l.presupuestoLineaId === producto.presupuestoLineaId
                            )
                          : undefined
                        const maxCant = metaLinea?.cantidadDisponible
                        return (
                        <tr key={index} className="border-b hover:bg-accent/50 transition-colors">
                          <td className="p-3 align-top">
                            <Select
                              value={producto.tipoPalletId || undefined}
                              onValueChange={(value) => {
                                void formik.setFieldValue(`productos.${index}.tipoPalletId`, value)
                                void formik.setFieldValue(`productos.${index}.presupuestoLineaId`, null)
                              }}
                            >
                              <SelectTrigger type="button" className="h-10 w-full min-w-44 max-w-md">
                                <TipoPalletSelectTriggerResumen tipo={tipoSel} />
                              </SelectTrigger>
                              <SelectContent className="z-200 max-h-[min(24rem,70vh)] w-[min(36rem,calc(100vw-2rem))] min-w-[var(--radix-select-trigger-width)]">
                                {tiposPallet.map((tipo) => (
                                  <SelectItem
                                    key={tipo.id}
                                    value={tipo.id}
                                    textValue={tipoPalletSelectTypeaheadText(tipo)}
                                    className="py-1.5"
                                  >
                                    <TipoPalletSelectItemBody tipo={tipo} />
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
                          <td className="p-3 align-top text-xs text-muted-foreground whitespace-nowrap">
                            {metaLinea ? (
                              <>
                                <span className="block">P: {metaLinea.cantidadPresupuesto}</span>
                                <span className="block">Disp.: {metaLinea.cantidadDisponible}</span>
                              </>
                            ) : (
                              <span>—</span>
                            )}
                          </td>
                          <td className="p-3 align-top">
                            <Input
                              type="number"
                              inputMode="numeric"
                              value={producto.cantidad || ''}
                              onChange={(e) => {
                                const raw = parseInt(e.target.value, 10) || 0
                                const next =
                                  maxCant != null
                                    ? Math.min(Math.max(1, raw), maxCant)
                                    : Math.max(1, raw)
                                void formik.setFieldValue(`productos.${index}.cantidad`, next)
                              }}
                              className="w-28"
                              min={1}
                              max={maxCant != null ? maxCant : undefined}
                              aria-label={`Cantidad línea ${index + 1}${maxCant != null ? `, máximo ${maxCant}` : ''}`}
                            />
                          </td>
                          <td className="p-3 align-top">
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
                          <td className="p-3 align-top font-semibold text-primary">
                            ${((producto.cantidad || 0) * (producto.precioUnitario || 0)).toLocaleString('es-CL')}
                          </td>
                          <td className="p-3 text-center align-top">
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
                        )
                      })}
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

          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href={`/ordenes-compra/${ordenId}`}>Cancelar</Link>
            </Button>
            <Button
              type="submit"
              disabled={formik.isSubmitting || proveedores.length === 0 || tiposPallet.length === 0}
              className="shadow-lg"
            >
              <Save className="h-4 w-4 mr-2" aria-hidden />
              {formik.isSubmitting ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </div>
    </FormikProvider>
  )
}

export default function EditarOrdenCompraPage() {
  const params = useParams()
  const ordenId = params.id as string

  const {
    data: orden,
    isLoading: loadingOrden,
    error: errorOrden,
  } = useQuery({
    queryKey: ['orden-compra', ordenId, 'edit-raw'],
    queryFn: () => fetchOrdenCompraParaEditar(ordenId),
    enabled: Boolean(ordenId),
  })

  const { data: proveedores = [], isLoading: loadingProveedores, error: errorProveedores } = useQuery({
    queryKey: ['proveedores-oc-editar'],
    queryFn: fetchProveedoresActivos,
  })

  const { data: tiposPallet = [], isLoading: loadingTipos, error: errorTipos } = useQuery({
    queryKey: ['tipos-pallet', 'orden-compra'],
    queryFn: fetchTiposPalletCatalogoOrdenCompra,
  })

  const isLoadingCatalogos = loadingProveedores || loadingTipos
  const errorCatalogos = errorProveedores || errorTipos

  if (loadingOrden || isLoadingCatalogos) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
        <p>Cargando orden y catálogos…</p>
      </div>
    )
  }

  if (errorOrden) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/ordenes-compra" aria-label="Volver">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <p className="text-destructive text-sm">{(errorOrden as Error).message}</p>
      </div>
    )
  }

  if (!orden) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/ordenes-compra" aria-label="Volver">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <p className="text-muted-foreground">Orden de compra no encontrada</p>
      </div>
    )
  }

  if (orden.estado !== 'BORRADOR') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/ordenes-compra/${ordenId}`} aria-label="Volver al detalle">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <p className="text-muted-foreground">Solo se pueden editar órdenes en estado borrador.</p>
        <Button asChild>
          <Link href={`/ordenes-compra/${ordenId}`}>Ver orden</Link>
        </Button>
      </div>
    )
  }

  if (errorCatalogos) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/ordenes-compra/${ordenId}`} aria-label="Volver">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <p className="text-destructive text-sm">{(errorCatalogos as Error).message}</p>
      </div>
    )
  }

  return (
    <EditarOrdenCompraForm ordenId={ordenId} orden={orden} proveedores={proveedores} tiposPallet={tiposPallet} />
  )
}
