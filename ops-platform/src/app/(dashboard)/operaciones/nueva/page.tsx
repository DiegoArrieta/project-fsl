'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { useFormik } from 'formik'
import { FormikProvider } from 'formik'
import * as Yup from 'yup'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, Trash2, Package, TrendingUp, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { mockApi, mockTiposPallet, mockProveedores, mockClientes } from '@/lib/mocks'
import { toast } from 'sonner'

const tiposOperacion = [
  { value: 'COMPRA', label: 'Compra', icon: Package, desc: 'Compra directa a proveedor' },
  { value: 'VENTA_DIRECTA', label: 'Venta Directa', icon: TrendingUp, desc: 'Venta con compra asociada' },
  { value: 'VENTA_COMISION', label: 'Venta con Comisión', icon: DollarSign, desc: 'Venta con comisión' },
]

function NuevaOperacionForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tipoInicial = searchParams.get('tipo') || 'COMPRA'

  const validationSchema = Yup.object().shape({
    tipo: Yup.string().required('Tipo de operación es requerido'),
    fecha: Yup.date().required('Fecha es requerida'),
    clienteId: Yup.string().when('tipo', {
      is: (val: string) => val?.startsWith('VENTA_'),
      then: (schema) => schema.required('Cliente es requerido para ventas'),
      otherwise: (schema) => schema.nullable(),
    }),
    proveedorId: Yup.string().required('Proveedor es requerido'),
    direccionEntrega: Yup.string().nullable(),
    ordenCompraCliente: Yup.string().nullable(),
    productos: Yup.array()
      .min(1, 'Debe agregar al menos un producto')
      .of(
        Yup.object().shape({
          tipoPalletId: Yup.string().required('Tipo de pallet es requerido'),
          cantidad: Yup.number().min(1, 'Cantidad debe ser mayor a 0').required('Cantidad es requerida'),
          precioVentaUnitario: Yup.number().when('$tipo', {
            is: (tipo: string) => tipo?.startsWith('VENTA_'),
            then: (schema) => schema.min(0, 'Precio debe ser mayor o igual a 0').required('Precio de venta es requerido'),
            otherwise: (schema) => schema.nullable(),
          }),
          precioCompraUnitario: Yup.number().when('$tipo', {
            is: (tipo: string) => tipo?.startsWith('VENTA_'),
            then: (schema) => schema.min(0, 'Precio debe ser mayor o igual a 0').required('Precio de compra es requerido'),
            otherwise: (schema) => schema.nullable(),
          }),
          precioUnitario: Yup.number().when('$tipo', {
            is: 'COMPRA',
            then: (schema) => schema.min(0, 'Precio debe ser mayor o igual a 0').required('Precio unitario es requerido'),
            otherwise: (schema) => schema.nullable(),
          }),
        })
      )
      .required(),
    observaciones: Yup.string().nullable(),
  })

  const formik = useFormik({
    initialValues: {
      tipo: tipoInicial,
      fecha: new Date().toISOString().split('T')[0],
      clienteId: '',
      proveedorId: '',
      direccionEntrega: '',
      ordenCompraCliente: '',
      productos: [] as any[],
      observaciones: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await mockApi.operaciones.crear(values)
        toast.success('Operación creada correctamente')
        router.push('/operaciones')
      } catch (error) {
        toast.error('Error al crear operación')
      }
    },
  })

  const agregarProducto = () => {
    formik.setFieldValue('productos', [
      ...formik.values.productos,
      {
        tipoPalletId: '',
        cantidad: 0,
        precioVentaUnitario: formik.values.tipo.startsWith('VENTA_') ? 0 : undefined,
        precioCompraUnitario: formik.values.tipo.startsWith('VENTA_') ? 0 : undefined,
        precioUnitario: formik.values.tipo === 'COMPRA' ? 0 : undefined,
      },
    ])
  }

  const eliminarProducto = (index: number) => {
    const nuevos = formik.values.productos.filter((_, i) => i !== index)
    formik.setFieldValue('productos', nuevos)
  }

  const calcularTotales = () => {
    if (formik.values.tipo === 'COMPRA') {
      const total = formik.values.productos.reduce(
        (sum, p) => sum + (p.cantidad || 0) * (p.precioUnitario || 0),
        0
      )
      return { totalCompra: total }
    } else {
      const totalVenta = formik.values.productos.reduce(
        (sum, p) => sum + (p.cantidad || 0) * (p.precioVentaUnitario || 0),
        0
      )
      const totalCompra = formik.values.productos.reduce(
        (sum, p) => sum + (p.cantidad || 0) * (p.precioCompraUnitario || 0),
        0
      )
      const margenBruto = totalVenta - totalCompra
      const margenPorcentual = totalVenta > 0 ? (margenBruto / totalVenta) * 100 : 0
      return { totalVenta, totalCompra, margenBruto, margenPorcentual }
    }
  }

  const totales = calcularTotales()

  return (
    <FormikProvider value={formik}>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/operaciones">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Nueva Operación</h1>
            <p className="text-muted-foreground mt-2">Completa los datos de la operación</p>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Tipo de Operación */}
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Operación</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formik.values.tipo}
                onValueChange={(value) => {
                  formik.setFieldValue('tipo', value)
                  formik.setFieldValue('productos', [])
                }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {tiposOperacion.map((tipo) => {
                  const Icon = tipo.icon
                  return (
                    <div key={tipo.value}>
                      <RadioGroupItem value={tipo.value} id={tipo.value} className="peer sr-only" />
                      <Label
                        htmlFor={tipo.value}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <Icon className="mb-3 h-6 w-6" />
                        <div className="text-center">
                          <div className="font-semibold">{tipo.label}</div>
                          <div className="text-xs text-muted-foreground">{tipo.desc}</div>
                        </div>
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>
              {formik.errors.tipo && <p className="text-sm text-destructive mt-2">{formik.errors.tipo}</p>}
            </CardContent>
          </Card>

          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fecha">
                  Fecha <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formik.values.fecha}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.errors.fecha && formik.touched.fecha && (
                  <p className="text-sm text-destructive mt-1">{formik.errors.fecha}</p>
                )}
              </div>

              {formik.values.tipo.startsWith('VENTA_') && (
                <div>
                  <Label htmlFor="clienteId">
                    Cliente <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formik.values.clienteId}
                    onValueChange={(value) => formik.setFieldValue('clienteId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Buscar cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.razonSocial}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.errors.clienteId && formik.touched.clienteId && (
                    <p className="text-sm text-destructive mt-1">{formik.errors.clienteId}</p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="proveedorId">
                  Proveedor <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formik.values.proveedorId}
                  onValueChange={(value) => formik.setFieldValue('proveedorId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Buscar proveedor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProveedores.map((proveedor) => (
                      <SelectItem key={proveedor.id} value={proveedor.id}>
                        {proveedor.razonSocial}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.errors.proveedorId && formik.touched.proveedorId && (
                  <p className="text-sm text-destructive mt-1">{formik.errors.proveedorId}</p>
                )}
              </div>

              <div>
                <Label htmlFor="direccionEntrega">Dirección de entrega</Label>
                <Input
                  id="direccionEntrega"
                  value={formik.values.direccionEntrega}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Puerto Montt, Av. Principal 123"
                />
              </div>

              {formik.values.tipo.startsWith('VENTA_') && (
                <div>
                  <Label htmlFor="ordenCompraCliente">OC del Cliente</Label>
                  <Input
                    id="ordenCompraCliente"
                    value={formik.values.ordenCompraCliente}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Ej: OC-12345"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Productos */}
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Tipo Pallet *</th>
                      <th className="text-left p-2">Cantidad *</th>
                      {formik.values.tipo.startsWith('VENTA_') ? (
                        <>
                          <th className="text-left p-2">Precio Venta</th>
                          <th className="text-left p-2">Precio Compra</th>
                          <th className="text-left p-2">Margen</th>
                        </>
                      ) : (
                        <th className="text-left p-2">Precio Unit.</th>
                      )}
                      <th className="text-left p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formik.values.productos.map((producto, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          <Select
                            value={producto.tipoPalletId}
                            onValueChange={(value) =>
                              formik.setFieldValue(`productos.${index}.tipoPalletId`, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockTiposPallet.map((tipo) => (
                                <SelectItem key={tipo.id} value={tipo.id}>
                                  {tipo.codigo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={producto.cantidad || ''}
                            onChange={(e) =>
                              formik.setFieldValue(`productos.${index}.cantidad`, parseInt(e.target.value) || 0)
                            }
                            className="w-24"
                          />
                        </td>
                        {formik.values.tipo.startsWith('VENTA_') ? (
                          <>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={producto.precioVentaUnitario || ''}
                                onChange={(e) =>
                                  formik.setFieldValue(
                                    `productos.${index}.precioVentaUnitario`,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-32"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={producto.precioCompraUnitario || ''}
                                onChange={(e) =>
                                  formik.setFieldValue(
                                    `productos.${index}.precioCompraUnitario`,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-32"
                              />
                            </td>
                            <td className="p-2">
                              {producto.precioVentaUnitario && producto.precioCompraUnitario
                                ? `$${((producto.precioVentaUnitario || 0) - (producto.precioCompraUnitario || 0)).toLocaleString('es-CL')}`
                                : '-'}
                            </td>
                          </>
                        ) : (
                          <td className="p-2">
                            <Input
                              type="number"
                              value={producto.precioUnitario || ''}
                              onChange={(e) =>
                                formik.setFieldValue(`productos.${index}.precioUnitario`, parseInt(e.target.value) || 0)
                              }
                              className="w-32"
                            />
                          </td>
                        )}
                        <td className="p-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => eliminarProducto(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button type="button" variant="outline" onClick={agregarProducto}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar producto
              </Button>
              {formik.errors.productos && (
                <p className="text-sm text-destructive">{formik.errors.productos as string}</p>
              )}

              {formik.values.tipo.startsWith('VENTA_') && totales.totalVenta > 0 && (
                <Card className="mt-4">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Venta:</span>
                        <span className="font-semibold">${totales.totalVenta.toLocaleString('es-CL')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Compra:</span>
                        <span className="font-semibold">${totales.totalCompra.toLocaleString('es-CL')}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Margen Bruto:</span>
                        <span className="font-semibold">
                          ${(totales.margenBruto || 0).toLocaleString('es-CL')} ({totales.margenPorcentual?.toFixed(1) || 0}%)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Observaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="observaciones"
                value={formik.values.observaciones}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Notas adicionales sobre esta operación..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/operaciones">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? 'Creando...' : 'Crear Operación'}
            </Button>
          </div>
        </form>
      </div>
    </FormikProvider>
  )
}

export default function NuevaOperacionPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8">Cargando...</div>}>
      <NuevaOperacionForm />
    </Suspense>
  )
}

