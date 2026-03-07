'use client'

import { useForm } from 'react-hook-form'
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
import { entregaSchema, type EntregaInput } from '@/lib/validations/entrega'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'

interface EntregaFormProps {
  initialData?: Partial<EntregaInput>
  eventoId?: string
  onSubmit: (data: EntregaInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

async function fetchEventos() {
  const response = await fetch('/api/eventos')
  if (!response.ok) throw new Error('Error al cargar eventos')
  const data = await response.json()
  return data.data || []
}

async function fetchEmpresas() {
  const response = await fetch('/api/empresas')
  if (!response.ok) throw new Error('Error al cargar empresas')
  const data = await response.json()
  return data.data || []
}

export function EntregaForm({
  initialData,
  eventoId: initialEventoId,
  onSubmit,
  onCancel,
  isLoading = false,
}: EntregaFormProps) {
  const { data: eventos = [] } = useQuery({
    queryKey: ['eventos'],
    queryFn: fetchEventos,
  })

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: fetchEmpresas,
  })

  const defaultValues = {
    eventoId: initialEventoId || initialData?.eventoId || '',
    empresaId: initialData?.empresaId || '',
    empresaReceptoraId: initialData?.empresaReceptoraId || '',
    fechaHora: initialData?.fechaHora
      ? format(
          initialData.fechaHora instanceof Date
            ? initialData.fechaHora
            : new Date(initialData.fechaHora),
          "yyyy-MM-dd'T'HH:mm"
        )
      : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    tipoEntrega: (initialData?.tipoEntrega || 'COMPLETA') as
      | 'COMPLETA'
      | 'PARCIAL'
      | 'DEVOLUCION'
      | 'OTRO',
    cantidad: initialData?.cantidad || 1,
    unidad: initialData?.unidad || 'unidad',
    estado: (initialData?.estado || 'PENDIENTE') as
      | 'PENDIENTE'
      | 'EN_TRANSITO'
      | 'COMPLETADA'
      | 'RECHAZADA',
    descripcion: initialData?.descripcion || '',
    observaciones: initialData?.observaciones || '',
  }

  const form = useForm({
    resolver: zodResolver(entregaSchema),
    defaultValues,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos Principales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="eventoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Evento <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!!initialEventoId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un evento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {eventos.map((evento: any) => (
                          <SelectItem key={evento.id} value={evento.id}>
                            {evento.numero} - {evento.tipo}
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
                name="tipoEntrega"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tipo de Entrega <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="COMPLETA">Completa</SelectItem>
                        <SelectItem value="PARCIAL">Parcial</SelectItem>
                        <SelectItem value="DEVOLUCION">Devolución</SelectItem>
                        <SelectItem value="OTRO">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="empresaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Empresa Emisora <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una empresa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {empresas.map((empresa: any) => (
                          <SelectItem key={empresa.id} value={empresa.id}>
                            {empresa.nombre}
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
                name="empresaReceptoraId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa Receptora</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                      value={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Opcional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Ninguna</SelectItem>
                        {empresas.map((empresa: any) => (
                          <SelectItem key={empresa.id} value={empresa.id}>
                            {empresa.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="fechaHora"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Fecha y Hora <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cantidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Cantidad <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Unidad <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="unidad, pallet, kg..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Estado <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                        <SelectItem value="EN_TRANSITO">En Tránsito</SelectItem>
                        <SelectItem value="COMPLETADA">Completada</SelectItem>
                        <SelectItem value="RECHAZADA">Rechazada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder="Descripción de la entrega"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder="Observaciones adicionales"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

