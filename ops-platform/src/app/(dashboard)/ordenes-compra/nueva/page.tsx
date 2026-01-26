'use client'

import { useRouter } from 'next/navigation'
import { useFormik } from 'formik'
import { FormikProvider } from 'formik'
import * as Yup from 'yup'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { mockApi, mockTiposPallet, mockProveedores } from '@/lib/mocks'
import { toast } from 'sonner'

const validationSchema = Yup.object().shape({
  proveedorId: Yup.string().required('Proveedor es requerido'),
  fecha: Yup.date().required('Fecha es requerida'),
  fechaEntregaEsperada: Yup.date().nullable(),
  direccionEntrega: Yup.string().nullable(),
  productos: Yup.array()
    .min(1, 'Debe agregar al menos un producto')
    .of(
      Yup.object().shape({
        tipoPalletId: Yup.string().required('Tipo de pallet es requerido'),
        cantidad: Yup.number().min(1, 'Cantidad debe ser mayor a 0').required('Cantidad es requerida'),
        precioUnitario: Yup.number().min(0, 'Precio debe ser mayor o igual a 0').required('Precio es requerido'),
      })
    )
    .required(),
  observaciones: Yup.string().nullable(),
})

export default function NuevaOrdenCompraPage() {
  const router = useRouter()

  const formik = useFormik({
    initialValues: {
      proveedorId: '',
      fecha: new Date().toISOString().split('T')[0],
      fechaEntregaEsperada: '',
      direccionEntrega: '',
      productos: [] as any[],
      observaciones: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await mockApi.ordenesCompra.crear(values)
        toast.success('Orden de compra creada correctamente')
        router.push('/ordenes-compra')
      } catch (error) {
        toast.error('Error al crear orden de compra')
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

  const total = formik.values.productos.reduce(
    (sum, p) => sum + (p.cantidad || 0) * (p.precioUnitario || 0),
    0
  )

  return (
    <FormikProvider value={formik}>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/ordenes-compra">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Nueva Orden de Compra</h1>
            <p className="text-muted-foreground mt-2">Completa los datos de la orden de compra</p>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <Label htmlFor="fechaEntregaEsperada">Fecha Entrega Esperada</Label>
                  <Input
                    id="fechaEntregaEsperada"
                    type="date"
                    value={formik.values.fechaEntregaEsperada}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
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
                      <th className="text-left p-2">Precio Unit. *</th>
                      <th className="text-left p-2">Subtotal</th>
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
                        <td className="p-2">
                          ${((producto.cantidad || 0) * (producto.precioUnitario || 0)).toLocaleString('es-CL')}
                        </td>
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

              <div className="flex justify-end mt-4">
                <div className="text-lg font-semibold">Total: ${total.toLocaleString('es-CL')}</div>
              </div>
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
                placeholder="Notas adicionales sobre esta orden de compra..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/ordenes-compra">Cancelar</Link>
            </Button>
            <Button type="button" variant="outline" disabled={formik.isSubmitting}>
              Guardar Borrador
            </Button>
            <Button type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? 'Generando...' : 'Generar PDF'}
            </Button>
          </div>
        </form>
      </div>
    </FormikProvider>
  )
}

