'use client'

import { useForm, useFieldArray, useWatch, type DefaultValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { createPresupuestoSchema, type CreatePresupuestoDto } from '@/modules/presupuestos/dto/create-presupuesto.dto'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { Plus, Trash2, Calculator } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TipoPalletSelectItemBody } from '@/components/ordenes-compra/tipo-pallet-select-item-body'
import { TipoPalletSelectTriggerResumen } from '@/components/ordenes-compra/tipo-pallet-select-trigger-resumen'
import {
  fetchTiposPalletCatalogoOrdenCompra,
  findTipoPalletCatalogoOc,
  tipoPalletSelectTypeaheadText,
} from '@/lib/tipos-pallet/orden-compra-catalogo'

interface PresupuestoFormProps {
  initialData?: Partial<CreatePresupuestoDto> & { id?: string, estado?: string }
  onSubmit: (data: CreatePresupuestoDto) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

/**
 * Listado para el select: sin filtrar por `activo`, igual que en Contactos cuando no aplica filtro.
 * Así aparecen clientes aunque estén dados de baja (útil para repr. o datos históricos).
 */
async function fetchClientes() {
  const params = new URLSearchParams({ pageSize: '500', page: '1' })
  const response = await fetch(`/api/clientes?${params}`, { credentials: 'include' })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const msg =
      typeof payload.error === 'string' ? payload.error : `Error al cargar clientes (${response.status})`
    throw new Error(msg)
  }
  return Array.isArray(payload.data) ? payload.data : []
}

export function PresupuestoForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: PresupuestoFormProps) {
  const {
    data: clientesData,
    isLoading: isLoadingClientes,
    isError: isErrorClientes,
    error: errorClientes,
    refetch: refetchClientes,
  } = useQuery({
    queryKey: ['clientes', 'presupuesto-form', 'selector'],
    queryFn: fetchClientes,
  })

  const {
    data: tiposPalletData,
    isLoading: isLoadingTipos,
    isError: isErrorTipos,
    error: errorTipos,
    refetch: refetchTipos,
  } = useQuery({
    queryKey: ['tipos-pallet', 'orden-compra'],
    queryFn: fetchTiposPalletCatalogoOrdenCompra,
  })

  // Asegurar que siempre sean arrays
  const clientes = Array.isArray(clientesData) ? clientesData : []
  const tiposPallet = Array.isArray(tiposPalletData) ? tiposPalletData : []

  const isDataLoading = isLoadingClientes || isLoadingTipos
  const isCatalogError = isErrorClientes || isErrorTipos

  const defaultValues = {
    clienteId: initialData?.clienteId || '',
    fecha: initialData?.fecha
      ? format(new Date(initialData.fecha), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd'),
    ciudad: initialData?.ciudad || '',
    direccion: initialData?.direccion || '',
    observaciones: initialData?.observaciones || '',
    lineas: initialData?.lineas || [
      { tipoPalletId: '', cantidad: 1, precioUnitario: 0, descripcion: '' },
    ],
  } as DefaultValues<CreatePresupuestoDto>

  const form = useForm<CreatePresupuestoDto>({
    resolver: zodResolver(createPresupuestoSchema),
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineas',
  })

  const watchLineas = useWatch({ control: form.control, name: 'lineas' })

  const subtotal = (watchLineas ?? []).reduce((acc, current) => {
    const cant = Number(current.cantidad) || 0
    const precio = Number(current.precioUnitario) || 0
    return acc + cant * precio
  }, 0)

  const iva = subtotal * 0.19
  const total = subtotal + iva

  if (isDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border border-dashed border-muted-foreground/30">
        <Calculator className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Cargando datos maestros...</p>
      </div>
    )
  }

  if (isCatalogError) {
    const msg = [
      isErrorClientes && errorClientes instanceof Error ? errorClientes.message : null,
      isErrorTipos && errorTipos instanceof Error ? errorTipos.message : null,
    ]
      .filter(Boolean)
      .join(' · ')
    return (
      <div className="flex flex-col items-center gap-4 py-16 px-4 text-center bg-destructive/5 rounded-xl border border-destructive/20">
        <p className="text-sm text-destructive font-medium max-w-md">
          {msg || 'No se pudieron cargar clientes o tipos de pallet. Compruebe la sesión y vuelva a intentar.'}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {isErrorClientes ? (
            <Button type="button" variant="outline" onClick={() => void refetchClientes()}>
              Reintentar clientes
            </Button>
          ) : null}
          {isErrorTipos ? (
            <Button type="button" variant="outline" onClick={() => void refetchTipos()}>
              Reintentar tipos de pallet
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clienteId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente <span className="text-destructive">*</span></FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ? field.value : undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un cliente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clientes.map((cliente: { id: string; razonSocial: string }) => (
                              <SelectItem key={cliente.id} value={cliente.id}>
                                {cliente.razonSocial}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {clientes.length === 0 ? (
                          <p className="text-sm text-muted-foreground mt-2">
                            No hay clientes en el sistema. Cree uno en Contactos antes de generar un presupuesto.
                          </p>
                        ) : null}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fecha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ciudad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} placeholder="Ej: Temuco" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="direccion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} placeholder="Dirección de entrega" />
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
                <CardTitle>Productos / Líneas</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ tipoPalletId: '', cantidad: 1, precioUnitario: 0, descripcion: '' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Línea
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-48">Pallet *</TableHead>
                        <TableHead className="w-[100px]">Cant.</TableHead>
                        <TableHead className="w-[150px]">Precio Unit.</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`lineas.${index}.tipoPalletId`}
                              render={({ field }) => {
                                const tipoSel = findTipoPalletCatalogoOc(tiposPallet, field.value || '')
                                return (
                                  <FormItem>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value ? field.value : undefined}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="h-10 w-full min-w-44 max-w-md">
                                          <TipoPalletSelectTriggerResumen tipo={tipoSel} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="z-200 max-h-[min(24rem,70vh)] w-[min(36rem,calc(100vw-2rem))] min-w-(--radix-select-trigger-width)">
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
                                  </FormItem>
                                )
                              }}
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
                                      {...field}
                                      type="number"
                                      min="1"
                                      className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`lineas.${index}.precioUnitario`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.01"
                                      className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                                    />
                                  </FormControl>
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
                                      value={field.value || ''}
                                      placeholder="Opcional..."
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
                              className="text-destructive hover:text-destructive/80"
                              disabled={fields.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {form.formState.errors.lineas?.message && (
                  <p className="text-sm font-medium text-destructive mt-2">
                    {form.formState.errors.lineas.message}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="observaciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ''}
                          placeholder="Notas adicionales para el presupuesto..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground shrink-0">
                    <Calculator className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>Resumen de Totales</span>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm">
                    <div className="flex flex-col gap-0.5 sm:block sm:gap-0">
                      <span className="text-muted-foreground text-xs sm:mr-2 sm:inline">Neto</span>
                      <span className="font-semibold tabular-nums">
                        {subtotal.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:block sm:gap-0">
                      <span className="text-muted-foreground text-xs sm:mr-2 sm:inline">IVA (19%)</span>
                      <span className="font-semibold tabular-nums text-muted-foreground">
                        {iva.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                      </span>
                    </div>
                    <div className="flex w-full flex-col gap-0.5 border-t border-primary/20 pt-2 sm:ml-0 sm:flex-row sm:items-baseline sm:gap-2 sm:border-t-0 sm:pt-0 md:w-auto">
                      <span className="text-sm font-bold">TOTAL</span>
                      <span className="text-xl font-black text-primary tabular-nums leading-none sm:text-2xl">
                        {total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row sm:justify-end xl:w-auto">
                  <Button type="submit" size="sm" disabled={isLoading} className="sm:min-w-40">
                    {isLoading ? 'Guardando...' : 'Guardar Presupuesto'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="sm:min-w-40"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  )
}

