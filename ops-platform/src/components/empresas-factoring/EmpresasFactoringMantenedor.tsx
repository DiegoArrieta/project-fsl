'use client'

import { useState } from 'react'
import { useFormik, FormikProvider } from 'formik'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import * as Yup from 'yup'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Plus, Loader2, Pencil, Landmark } from 'lucide-react'
import { toast } from 'sonner'

interface EmpresaFactoringRow {
  id: string
  nombre: string
  rut: string | null
  contacto: string | null
  telefono: string | null
  email: string | null
  activo: boolean
  notas: string | null
}

interface ListaResponse {
  success: boolean
  data: EmpresaFactoringRow[]
  meta: { total: number }
}

async function fetchLista(buscar: string, activo: string | null): Promise<ListaResponse> {
  const p = new URLSearchParams()
  p.set('pageSize', '100')
  if (buscar.trim()) p.set('buscar', buscar.trim())
  if (activo === 'true') p.set('activo', 'true')
  if (activo === 'false') p.set('activo', 'false')
  const res = await fetch(`/api/empresas-factoring?${p}`)
  if (!res.ok) throw new Error('Error al cargar')
  return res.json()
}

const formSchema = Yup.object({
  nombre: Yup.string().trim().required('Nombre requerido').max(255),
  rut: Yup.string().max(12).nullable(),
  contacto: Yup.string().max(255).nullable(),
  telefono: Yup.string().max(20).nullable(),
  email: Yup.string().max(255).nullable(),
  notas: Yup.string().nullable(),
  activo: Yup.boolean(),
})

export function EmpresasFactoringMantenedor() {
  const queryClient = useQueryClient()
  const [buscar, setBuscar] = useState('')
  const [filtroActivo, setFiltroActivo] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<EmpresaFactoringRow | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['empresas-factoring', buscar, filtroActivo],
    queryFn: () => fetchLista(buscar, filtroActivo),
  })

  const invalidarListas = () => {
    queryClient.invalidateQueries({ queryKey: ['empresas-factoring'] })
    queryClient.invalidateQueries({ queryKey: ['empresas-factoring-activas'] })
  }

  const toggleActivoMutation = useMutation({
    mutationFn: async ({ id, activo }: { id: string; activo: boolean }) => {
      const res = await fetch(`/api/empresas-factoring/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((json as { error?: string }).error || 'Error')
    },
    onSuccess: () => {
      toast.success('Estado actualizado')
      invalidarListas()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      nombre: editando?.nombre ?? '',
      rut: editando?.rut ?? '',
      contacto: editando?.contacto ?? '',
      telefono: editando?.telefono ?? '',
      email: editando?.email ?? '',
      notas: editando?.notas ?? '',
      activo: editando?.activo ?? true,
    },
    validationSchema: formSchema,
    onSubmit: async (values, { resetForm }) => {
      const payload = {
        nombre: values.nombre.trim(),
        rut: values.rut?.trim() || null,
        contacto: values.contacto?.trim() || null,
        telefono: values.telefono?.trim() || null,
        email: values.email?.trim() || null,
        notas: values.notas?.trim() || null,
        activo: values.activo,
      }

      try {
        if (editando) {
          const res = await fetch(`/api/empresas-factoring/${editando.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          const json = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error((json as { error?: string }).error || 'Error al guardar')
          toast.success('Empresa actualizada')
        } else {
          const res = await fetch('/api/empresas-factoring', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          const json = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error((json as { error?: string }).error || 'Error al crear')
          toast.success('Empresa creada')
        }
        resetForm()
        setDialogOpen(false)
        setEditando(null)
        invalidarListas()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error')
      }
    },
  })

  const handleNueva = () => {
    setEditando(null)
    setDialogOpen(true)
  }

  const handleEditar = (row: EmpresaFactoringRow) => {
    setEditando(row)
    setDialogOpen(true)
  }

  const rows = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Landmark className="h-8 w-8 text-primary" aria-hidden />
            Empresas de factoring
          </h1>
          <p className="text-muted-foreground mt-1">
            Catálogo para asignar factoring en operaciones de venta.{' '}
            <Link href="/operaciones" className="text-primary underline font-medium">
              Ver operaciones
            </Link>
          </p>
        </div>
        <Button type="button" onClick={handleNueva}>
          <Plus className="h-4 w-4 mr-2" aria-hidden />
          Nueva empresa
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, RUT, contacto…"
              className="pl-9"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              aria-label="Buscar empresas de factoring"
            />
          </div>
          <Select
            value={filtroActivo ?? 'all'}
            onValueChange={(v) => setFiltroActivo(v === 'all' ? null : v)}
          >
            <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filtrar por estado">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="true">Activas</SelectItem>
              <SelectItem value="false">Inactivas</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive">No se pudo cargar el listado. Intente de nuevo.</p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
        </div>
      ) : rows.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay empresas que coincidan. Cree la primera con «Nueva empresa».
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>RUT</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.nombre}</TableCell>
                  <TableCell>{row.rut ?? '—'}</TableCell>
                  <TableCell>{row.contacto ?? '—'}</TableCell>
                  <TableCell>{row.telefono ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={row.activo ? 'default' : 'secondary'}>
                      {row.activo ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditar(row)}
                      aria-label={`Editar ${row.nombre}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={toggleActivoMutation.isPending}
                      onClick={() => {
                        const msg = row.activo
                          ? '¿Desactivar esta empresa? No estará disponible en operaciones nuevas.'
                          : '¿Activar esta empresa?'
                        if (confirm(msg)) {
                          toggleActivoMutation.mutate({ id: row.id, activo: !row.activo })
                        }
                      }}
                      aria-label={row.activo ? `Desactivar ${row.nombre}` : `Activar ${row.nombre}`}
                    >
                      {row.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o)
          if (!o) setEditando(null)
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby="ef-desc">
          <FormikProvider value={formik}>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <DialogHeader>
                <DialogTitle>{editando ? 'Editar empresa' : 'Nueva empresa de factoring'}</DialogTitle>
                <DialogDescription id="ef-desc">
                  Los registros activos aparecen en el modal de factoring al editar operaciones de venta.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Label htmlFor="ef-nombre">Nombre</Label>
                <Input
                  id="ef-nombre"
                  name="nombre"
                  value={formik.values.nombre}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.nombre && formik.errors.nombre && (
                  <p className="text-sm text-destructive">{formik.errors.nombre}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="ef-rut">RUT</Label>
                  <Input
                    id="ef-rut"
                    name="rut"
                    value={formik.values.rut}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ef-tel">Teléfono</Label>
                  <Input
                    id="ef-tel"
                    name="telefono"
                    value={formik.values.telefono}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ef-contacto">Contacto</Label>
                <Input
                  id="ef-contacto"
                  name="contacto"
                  value={formik.values.contacto}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ef-email">Email</Label>
                <Input
                  id="ef-email"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ef-notas">Notas</Label>
                <Textarea
                  id="ef-notas"
                  name="notas"
                  value={formik.values.notas}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="ef-activo"
                  name="activo"
                  type="checkbox"
                  checked={formik.values.activo}
                  onChange={(e) => formik.setFieldValue('activo', e.target.checked)}
                  className="h-4 w-4 rounded border"
                />
                <Label htmlFor="ef-activo" className="font-normal">
                  Activa (visible al registrar factoring en operaciones)
                </Label>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false)
                    setEditando(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={formik.isSubmitting}>
                  {formik.isSubmitting ? 'Guardando…' : 'Guardar'}
                </Button>
              </DialogFooter>
            </form>
          </FormikProvider>
        </DialogContent>
      </Dialog>
    </div>
  )
}