'use client'

import { useForm, useFieldArray } from 'react-hook-form'
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
import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { Plus, Trash2, Calculator } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface PresupuestoFormProps {
  initialData?: Partial<CreatePresupuestoDto> & { id?: string, estado?: string }
  onSubmit: (data: CreatePresupuestoDto) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

async function fetchClientes() {
  const response = await fetch('/api/clientes')
  if (!response.ok) {
    console.error('Error fetching clientes:', response.status, response.statusText)
    throw new Error('Error al cargar clientes')
  }
  const data = await response.json()
  console.log('Clientes cargados:', data.data?.length || 0)
  return data.data || []
}

async function fetchTiposPallet() {
  const response = await fetch('/api/tipos-pallet')
  if (!response.ok) {
    console.error('Error fetching tipos-pallet:', response.status, response.statusText)
    throw new Error('Error al cargar tipos de pallet')
  }
  const data = await response.json()
  console.log('Tipos de pallet cargados:', data.data?.length || 0)
  return data.data || []
}

export function PresupuestoForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: PresupuestoFormProps) {
  const { data: clientesData, isLoading: isLoadingClientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: fetchClientes,
  })

  const { data: tiposPalletData, isLoading: isLoadingTipos } = useQuery({
    queryKey: ['tipos-pallet'],
    queryFn: fetchTiposPallet,
  })

  // Asegurar que siempre sean arrays
  const clientes = Array.isArray(clientesData) ? clientesData : []
  const tiposPallet = Array.isArray(tiposPalletData) ? tiposPalletData : []

  const isDataLoading = isLoadingClientes || isLoadingTipos

  const defaultValues: any = {
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
  }

  const form = useForm<CreatePresupuestoDto>({
    resolver: zodResolver(createPresupuestoSchema),
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineas',
  })

  const watchLineas = form.watch('lineas')
  
  const subtotal = watchLineas.reduce((acc, current) => {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un cliente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clientes.map((cliente: any) => (
                              <SelectItem key={cliente.id} value={cliente.id}>
                                {cliente.razonSocial}
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
                        <TableHead className="w-[200px]">Tipo Pallet</TableHead>
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
                              render={({ field }) => (
                                <FormItem>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0">
                                        <SelectValue placeholder="Tipo..." />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {tiposPallet.map((tipo: any) => (
                                        <SelectItem key={tipo.id} value={tipo.id}>
                                          {tipo.nombre}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
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
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Resumen de Totales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Neto Subtotal</span>
                  <span className="font-semibold">
                    {subtotal.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">IVA (19%)</span>
                  <span className="font-semibold text-muted-foreground">
                    {iva.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                  </span>
                </div>
                <div className="pt-4 border-t border-primary/20 flex justify-between items-center">
                  <span className="text-lg font-bold">TOTAL</span>
                  <span className="text-2xl font-black text-primary">
                    {total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                  </span>
                </div>

                <div className="pt-6 space-y-3">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Guardando...' : 'Guardar Presupuesto'}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={onCancel} disabled={isLoading}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  )
}

