'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { personaContactoSchema, type PersonaContactoInput } from '@/lib/validations/persona-contacto'
import type { PersonaContactoDto } from '@/lib/personas-contacto/serialize'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Pencil, Trash2, Loader2, Phone, Mail, Star } from 'lucide-react'

interface PersonasContactoMantenedorProps {
  entidadId: string
  tipoEntidad: 'proveedor' | 'cliente'
}

function buildBasePath(tipoEntidad: 'proveedor' | 'cliente', entidadId: string) {
  return tipoEntidad === 'proveedor'
    ? `/api/proveedores/${entidadId}/personas-contacto`
    : `/api/clientes/${entidadId}/personas-contacto`
}

async function fetchPersonas(basePath: string): Promise<PersonaContactoDto[]> {
  const res = await fetch(basePath)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error || 'Error al cargar personas de contacto')
  }
  const json = await res.json()
  return json.data ?? []
}

export function PersonasContactoMantenedor({ entidadId, tipoEntidad }: PersonasContactoMantenedorProps) {
  const queryClient = useQueryClient()
  const basePath = buildBasePath(tipoEntidad, entidadId)
  const queryKey = ['personas-contacto', tipoEntidad, entidadId] as const

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PersonaContactoDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PersonaContactoDto | null>(null)

  const { data: personas = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchPersonas(basePath),
  })

  const form = useForm<PersonaContactoInput>({
    resolver: zodResolver(personaContactoSchema),
    defaultValues: {
      nombre: '',
      cargo: '',
      email: '',
      telefono: '',
      esPrincipal: false,
      notas: '',
    },
  })

  useEffect(() => {
    if (!dialogOpen) return
    if (editing) {
      form.reset({
        nombre: editing.nombre,
        cargo: editing.cargo ?? '',
        email: editing.email ?? '',
        telefono: editing.telefono ?? '',
        esPrincipal: editing.esPrincipal,
        notas: editing.notas ?? '',
      })
    } else {
      form.reset({
        nombre: '',
        cargo: '',
        email: '',
        telefono: '',
        esPrincipal: false,
        notas: '',
      })
    }
  }, [dialogOpen, editing, form])

  const saveMutation = useMutation({
    mutationFn: async (values: PersonaContactoInput) => {
      const payload = {
        ...values,
        email: values.email === '' ? null : values.email,
        cargo: values.cargo === '' ? null : values.cargo,
        telefono: values.telefono === '' ? null : values.telefono,
        notas: values.notas === '' ? null : values.notas,
      }
      if (editing) {
        const res = await fetch(`${basePath}/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error((body as { error?: string }).error || 'Error al guardar')
        }
        return res.json()
      }
      const res = await fetch(basePath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error || 'Error al guardar')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success(editing ? 'Contacto actualizado' : 'Contacto agregado')
      queryClient.invalidateQueries({ queryKey })
      setDialogOpen(false)
      setEditing(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (persona: PersonaContactoDto) => {
      const res = await fetch(`${basePath}/${persona.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error || 'Error al eliminar')
      }
    },
    onSuccess: () => {
      toast.success('Contacto eliminado')
      queryClient.invalidateQueries({ queryKey })
      setDeleteTarget(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleOpenCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (p: PersonaContactoDto) => {
    setEditing(p)
    setDialogOpen(true)
  }

  const tipoLabel = tipoEntidad === 'proveedor' ? 'proveedor' : 'cliente'

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Personas de contacto
              <span className="text-muted-foreground font-normal text-base">({personas.length})</span>
            </CardTitle>
            <CardDescription>
              Uno o más contactos asociados a este {tipoLabel} (nombre, cargo, teléfono, correo).
            </CardDescription>
          </div>
          <Button type="button" size="sm" onClick={handleOpenCreate} className="shrink-0">
            <UserPlus className="h-4 w-4 mr-2" aria-hidden />
            Agregar contacto
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
            </div>
          ) : personas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">
              No hay personas de contacto registradas. Agrega la primera con el botón superior.
            </p>
          ) : (
            <ul className="space-y-3">
              {personas.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 rounded-lg border bg-card"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{p.nombre}</span>
                      {p.esPrincipal && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3" aria-hidden />
                          Principal
                        </Badge>
                      )}
                    </div>
                    {p.cargo && <p className="text-sm text-muted-foreground">{p.cargo}</p>}
                    <div className="flex flex-col gap-1 text-sm pt-1">
                      {p.telefono && (
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          {p.telefono}
                        </span>
                      )}
                      {p.email && (
                        <span className="flex items-center gap-2 text-muted-foreground break-all">
                          <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          {p.email}
                        </span>
                      )}
                    </div>
                    {p.notas && (
                      <p className="text-xs text-muted-foreground pt-2 border-t mt-2 whitespace-pre-wrap">
                        {p.notas}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(p)}
                      aria-label={`Editar contacto ${p.nombre}`}
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(p)}
                      aria-label={`Eliminar contacto ${p.nombre}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) setEditing(null)
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar contacto' : 'Nueva persona de contacto'}</DialogTitle>
            <DialogDescription>
              Datos de la persona que actúa como contacto comercial u operativo para este {tipoLabel}.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: Juan Pérez" autoComplete="name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} placeholder="Ej: Jefe de compras" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} placeholder="+56 9 ..." />
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
                          value={field.value ?? ''}
                          type="email"
                          placeholder="correo@empresa.cl"
                          autoComplete="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ''} rows={3} placeholder="Opcional" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="esPrincipal"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1 h-4 w-4 rounded border-input"
                        id="es-principal-contacto"
                        aria-label="Marcar como contacto principal"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="es-principal-contacto" className="font-medium cursor-pointer">
                        Contacto principal
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Solo uno puede ser principal; al guardar se desmarcan los demás.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false)
                    setEditing(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />}
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Eliminar contacto</DialogTitle>
            <DialogDescription>
              ¿Eliminar a <span className="font-medium text-foreground">{deleteTarget?.nombre}</span>? Esta
              acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
