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
import { RutInput } from '@/components/contactos/RutInput'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { empresaSchema, type EmpresaInput } from '@/lib/validations/empresa'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'

interface EmpresaFormProps {
  initialData?: Partial<EmpresaInput>
  onSubmit: (data: EmpresaInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function EmpresaForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: EmpresaFormProps) {
  const [rutValid, setRutValid] = useState(false)

  const defaultValues = {
    nombre: initialData?.nombre || '',
    rut: initialData?.rut || '',
    tipoEmpresa: (initialData?.tipoEmpresa || 'OTRO') as 'PROVEEDOR' | 'CLIENTE' | 'TRANSPORTISTA' | 'OTRO',
    contacto: initialData?.contacto || '',
    direccion: initialData?.direccion || '',
    telefono: initialData?.telefono || '',
    email: initialData?.email || '',
    estado: (initialData?.estado || 'ACTIVA') as 'ACTIVA' | 'INACTIVA',
  }

  const form = useForm({
    resolver: zodResolver(empresaSchema),
    defaultValues,
  })

  const handleSubmit = async (data: EmpresaInput) => {
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
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nombre <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nombre de la empresa" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipoEmpresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tipo de Empresa <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PROVEEDOR">Proveedor</SelectItem>
                        <SelectItem value="CLIENTE">Cliente</SelectItem>
                        <SelectItem value="TRANSPORTISTA">Transportista</SelectItem>
                        <SelectItem value="OTRO">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value="ACTIVA">Activa</SelectItem>
                        <SelectItem value="INACTIVA">Inactiva</SelectItem>
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
            <CardTitle>Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="contacto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Persona de Contacto</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder="Nombre del contacto" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="+56 9 1234 5678" />
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
                        placeholder="contacto@empresa.cl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder="Dirección completa"
                      rows={2}
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

