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
import { RutInput } from './RutInput'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { proveedorSchema, clienteSchema, type ProveedorInput, type ClienteInput } from '@/lib/validations/contacto'
import { useState } from 'react'

interface ContactoFormProps {
  tipo: 'proveedor' | 'cliente'
  initialData?: Partial<ProveedorInput | ClienteInput>
  onSubmit: (data: ProveedorInput | ClienteInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ContactoForm({
  tipo,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: ContactoFormProps) {
  const schema = tipo === 'proveedor' ? proveedorSchema : clienteSchema
  const [rutValid, setRutValid] = useState(false)

  const defaultValues = {
    rut: initialData?.rut || '',
    razonSocial: initialData?.razonSocial || '',
    nombreFantasia: initialData?.nombreFantasia || '',
    direccion: initialData?.direccion || '',
    comuna: initialData?.comuna || '',
    ciudad: initialData?.ciudad || '',
    telefono: initialData?.telefono || '',
    email: initialData?.email || '',
    activo: (initialData?.activo !== undefined ? initialData.activo : true) as boolean,
  }

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const handleSubmit = async (data: ProveedorInput | ClienteInput) => {
    if (!rutValid) {
      form.setError('rut', { message: 'RUT inválido' })
      return
    }
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos Principales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rut"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RutInput
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value)
                          form.clearErrors('rut')
                        }}
                        onValidationChange={setRutValid}
                        label="RUT"
                        required
                        error={form.formState.errors.rut?.message}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="razonSocial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Razón Social <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="FORESTAL ANDES LIMITADA" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nombreFantasia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Fantasía</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder="Forestal Andes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ubicación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder="Camino Freire..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="comuna"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comuna</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Freire" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ciudad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Temuco" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="45-2378200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        value={field.value || ''}
                        placeholder="admin@example.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading || !rutValid}>
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

