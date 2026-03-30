'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  createSolicitudCotizacionSchema,
  type CreateSolicitudCotizacionInput,
} from '@/lib/validations/solicitud-cotizacion'
import { Plus, Trash2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'

async function fetchProveedores() {
  const res = await fetch('/api/proveedores?pageSize=500&activo=true')
  if (!res.ok) throw new Error('Error al cargar proveedores')
  const json = await res.json()
  return json.data ?? []
}

async function fetchTiposPallet() {
  const res = await fetch('/api/tipos-pallet')
  if (!res.ok) throw new Error('Error al cargar tipos de pallet')
  const json = await res.json()
  return json.data ?? []
}

export interface SolicitudCotizacionInitial {
  proveedorId: string
  fecha: string | Date
  observaciones?: string | null
  estado?: 'BORRADOR' | 'ENVIADO' | 'CERRADO'
  lineas: Array<{
    tipoPalletId: string
    cantidad: number
    descripcion?: string | null
  }>
}

interface SolicitudCotizacionFormProps {
  initialData?: SolicitudCotizacionInitial
  bloquearProveedor?: boolean
  onSubmit: (data: CreateSolicitudCotizacionInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function SolicitudCotizacionForm({
  initialData,
  bloquearProveedor = false,
  onSubmit,
  onCancel,
  isLoading = false,
}: SolicitudCotizacionFormProps) {
  const { data: proveedoresData, isLoading: loadingProv } = useQuery({
    queryKey: ['proveedores-solicitud'],
    queryFn: fetchProveedores,
  })
  const { data: tiposData, isLoading: loadingTipos } = useQuery({
    queryKey: ['tipos-pallet-solicitud'],
    queryFn: fetchTiposPallet,
  })

  const proveedores = Array.isArray(proveedoresData) ? proveedoresData : []
  const tiposPallet = Array.isArray(tiposData) ? tiposData : []

  const form = useForm<CreateSolicitudCotizacionInput>({
    resolver: zodResolver(createSolicitudCotizacionSchema),
    defaultValues: initialData
      ? {
          proveedorId: initialData.proveedorId,
          fecha: format(new Date(initialData.fecha), 'yyyy-MM-dd'),
          observaciones: initialData.observaciones ?? '',
          estado: initialData.estado ?? 'BORRADOR',
          lineas:
            initialData.lineas.length > 0
              ? initialData.lineas.map((l) => ({
                  tipoPalletId: l.tipoPalletId,
                  cantidad: l.cantidad,
                  descripcion: l.descripcion ?? '',
                }))
              : [{ tipoPalletId: '', cantidad: 1, descripcion: '' }],
        }
      : {
          proveedorId: '',
          fecha: format(new Date(), 'yyyy-MM-dd'),
          observaciones: '',
          estado: 'BORRADOR',
          lineas: [{ tipoPalletId: '', cantidad: 1, descripcion: '' }],
        },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineas',
  })

  if (loadingProv || loadingTipos) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">Cargando datos maestros…</p>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Proveedor y fecha</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="proveedorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Proveedor <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={bloquearProveedor}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione proveedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {proveedores.map((p: { id: string; razonSocial: string }) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.razonSocial}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fecha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Fecha <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="date" value={String(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BORRADOR">Borrador</SelectItem>
                      <SelectItem value="ENVIADO">Enviado</SelectItem>
                      <SelectItem value="CERRADO">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-3">
              <FormField
                control={form.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        placeholder="Opcional — contexto para el proveedor"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cantidades solicitadas</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ tipoPalletId: '', cantidad: 1, descripcion: '' })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar línea
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo pallet</TableHead>
                    <TableHead className="w-[120px]">Cantidad</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((fieldItem, index) => (
                    <TableRow key={fieldItem.id}>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`lineas.${index}.tipoPalletId`}
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0">
                                    <SelectValue placeholder="Tipo…" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {tiposPallet.map((t: { id: string; nombre: string }) => (
                                    <SelectItem key={t.id} value={t.id}>
                                      {t.nombre}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`lineas.${index}.cantidad`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`lineas.${index}.descripcion`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value ?? ''}
                                  placeholder="Opcional"
                                  className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length <= 1}
                          aria-label="Quitar línea"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
