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
import { Search, Plus, Loader2, Pencil, Globe, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

interface PaisRow {
  id: string
  codigoIso: string
  nombre: string
  activo: boolean
}

interface ListaResponse {
  success: boolean
  data: PaisRow[]
  meta: { total: number; page: number; pageSize: number; totalPages: number }
}

async function fetchLista(buscar: string, filtroActivo: string | null): Promise<ListaResponse> {
  const p = new URLSearchParams()
  p.set('list', '1')
  p.set('pageSize', '100')
  p.set('activo', filtroActivo === null ? 'all' : filtroActivo === 'true' ? 'true' : 'false')
  if (buscar.trim()) p.set('buscar', buscar.trim())
  const res = await fetch(`/api/paises?${p}`)
  if (!res.ok) throw new Error('Error al cargar países')
  const json = await res.json()
  return json as ListaResponse
}

function invalidatePaisQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['paises-catalogo'] })
  queryClient.invalidateQueries({ queryKey: ['paises-mantenedor'] })
  queryClient.invalidateQueries({ queryKey: ['tipos-pallet-mantenedor'] })
}

const formSchema = Yup.object({
  codigoIso: Yup.string()
    .trim()
    .length(2, '2 letras ISO')
    .matches(/^[A-Za-z]{2}$/, 'Solo letras A–Z')
    .required('Código ISO requerido'),
  nombre: Yup.string().trim().required('Nombre requerido').max(100),
  activo: Yup.boolean(),
})

export function PaisesMantenedor() {
  const queryClient = useQueryClient()
  const [buscar, setBuscar] = useState('')
  const [filtroActivo, setFiltroActivo] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<PaisRow | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['paises-mantenedor', buscar, filtroActivo],
    queryFn: () => fetchLista(buscar, filtroActivo),
  })

  const toggleActivoMutation = useMutation({
    mutationFn: async ({ id, activo }: { id: string; activo: boolean }) => {
      const res = await fetch(`/api/paises/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((json as { error?: string }).error || 'Error')
    },
    onSuccess: () => {
      toast.success('Estado actualizado')
      invalidatePaisQueries(queryClient)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      codigoIso: editando?.codigoIso ?? '',
      nombre: editando?.nombre ?? '',
      activo: editando?.activo ?? true,
    },
    validationSchema: formSchema,
    onSubmit: async (values, { resetForm }) => {
      const payload = {
        codigoIso: values.codigoIso.trim().toUpperCase(),
        nombre: values.nombre.trim(),
        activo: values.activo,
      }
      try {
        if (editando) {
          const res = await fetch(`/api/paises/${editando.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: payload.nombre, activo: payload.activo }),
          })
          const json = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error((json as { error?: string }).error || 'Error al guardar')
          toast.success('País actualizado')
        } else {
          const res = await fetch('/api/paises', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          const json = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error((json as { error?: string }).error || 'Error al crear')
          toast.success('País creado')
        }
        resetForm()
        setDialogOpen(false)
        setEditando(null)
        invalidatePaisQueries(queryClient)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error')
      }
    },
  })

  const handleNueva = () => {
    setEditando(null)
    setDialogOpen(true)
  }

  const handleEditar = (row: PaisRow) => {
    setEditando(row)
    setDialogOpen(true)
  }

  const rows = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit -ml-2" asChild>
          <Link href="/tipos-pallet" className="flex items-center gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Volver a tipos de pallet
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Globe className="h-8 w-8 text-primary" aria-hidden />
              Países de destino
            </h1>
            <p className="text-muted-foreground mt-1">
              Códigos ISO de 2 letras (ej. CL, US). Los países activos se ofrecen al configurar cada tipo
              de pallet.
            </p>
          </div>
          <Button type="button" onClick={handleNueva}>
            <Plus className="h-4 w-4 mr-2" aria-hidden />
            Nuevo país
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o código ISO…"
              className="pl-9"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              aria-label="Buscar países"
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
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Activos</SelectItem>
              <SelectItem value="false">Inactivos</SelectItem>
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
            No hay países que coincidan. Cree el primero con «Nuevo país».
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ISO</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono font-medium">{row.codigoIso}</TableCell>
                  <TableCell>{row.nombre}</TableCell>
                  <TableCell>
                    <Badge variant={row.activo ? 'default' : 'secondary'}>
                      {row.activo ? 'Activo' : 'Inactivo'}
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
                          ? '¿Desactivar este país? No aparecerá en formularios nuevos (los tipos de pallet ya asignados conservan el vínculo).'
                          : '¿Activar este país?'
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
        <DialogContent className="max-w-md" aria-describedby="pais-desc">
          <FormikProvider value={formik}>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <DialogHeader>
                <DialogTitle>{editando ? 'Editar país' : 'Nuevo país'}</DialogTitle>
                <DialogDescription id="pais-desc">
                  Use el estándar ISO 3166-1 alpha-2 (dos letras, ej. AR, BR).
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Label htmlFor="pais-iso">Código ISO</Label>
                <Input
                  id="pais-iso"
                  name="codigoIso"
                  value={formik.values.codigoIso}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="CL"
                  maxLength={2}
                  autoComplete="off"
                  disabled={!!editando}
                  className="font-mono uppercase"
                  aria-label="Código ISO del país"
                />
                {formik.touched.codigoIso && formik.errors.codigoIso && (
                  <p className="text-sm text-destructive">{formik.errors.codigoIso}</p>
                )}
                {editando && (
                  <p className="text-xs text-muted-foreground">
                    El código ISO no se puede cambiar por integridad; cree un país nuevo si necesita otro
                    código.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pais-nombre">Nombre</Label>
                <Input
                  id="pais-nombre"
                  name="nombre"
                  value={formik.values.nombre}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.nombre && formik.errors.nombre && (
                  <p className="text-sm text-destructive">{formik.errors.nombre}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="pais-activo"
                  name="activo"
                  type="checkbox"
                  checked={formik.values.activo}
                  onChange={(e) => formik.setFieldValue('activo', e.target.checked)}
                  className="h-4 w-4 rounded border"
                />
                <Label htmlFor="pais-activo" className="font-normal">
                  Activo (disponible en tipos de pallet)
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
