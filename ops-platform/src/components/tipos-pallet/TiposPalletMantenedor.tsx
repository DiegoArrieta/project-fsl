'use client'

import { useState, useRef, useEffect } from 'react'
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
import { Search, Plus, Loader2, Pencil, Package, Globe, ImageIcon, X } from 'lucide-react'
import { toast } from 'sonner'
import { useFileUpload } from '@/hooks/use-file-upload'

interface PaisRef {
  id: string
  codigoIso: string
  nombre: string
}

interface CategoriaRef {
  id: string
  codigo: string
  nombre: string
}

interface TipoPalletRow {
  id: string
  categoriaId: string
  codigo: string
  nombre: string
  descripcion: string | null
  dimensiones: string | null
  fotoKey: string | null
  fotoNombre: string | null
  fotoContentType: string | null
  fotoSize: number | null
  requiereCertificacion: boolean
  activo: boolean
  categoria: CategoriaRef
  paises: { paisId: string; pais: PaisRef }[]
}

interface ListaResponse {
  success: boolean
  data: TipoPalletRow[]
  meta?: { total: number; page: number; pageSize: number; totalPages: number }
}

async function fetchLista(buscar: string, filtroActivo: string | null): Promise<ListaResponse> {
  const p = new URLSearchParams()
  p.set('pageSize', '100')
  p.set('activo', filtroActivo === null ? 'all' : filtroActivo === 'true' ? 'true' : 'false')
  if (buscar.trim()) p.set('buscar', buscar.trim())
  const res = await fetch(`/api/tipos-pallet?${p}`)
  if (!res.ok) throw new Error('Error al cargar tipos de pallet')
  return res.json()
}

async function fetchCategorias(): Promise<CategoriaRef[]> {
  const res = await fetch('/api/categorias-pallet')
  if (!res.ok) throw new Error('Error al cargar categorías')
  const json = await res.json()
  return (json.data ?? []) as CategoriaRef[]
}

async function fetchPaises(): Promise<PaisRef[]> {
  const res = await fetch('/api/paises')
  if (!res.ok) throw new Error('Error al cargar países')
  const json = await res.json()
  return (json.data ?? []) as PaisRef[]
}

const formSchema = Yup.object({
  categoriaId: Yup.string().uuid('Seleccione categoría').required('Categoría requerida'),
  codigo: Yup.string().trim().required('Código requerido').max(10),
  nombre: Yup.string().trim().required('Nombre requerido').max(100),
  descripcion: Yup.string().trim().max(2000).nullable(),
  dimensiones: Yup.string().trim().max(200).nullable(),
  requiereCertificacion: Yup.boolean(),
  activo: Yup.boolean(),
  paisIds: Yup.array().of(Yup.string().uuid()).min(1, 'Seleccione al menos un país'),
  fotoKey: Yup.string().max(500).nullable(),
  fotoNombre: Yup.string().max(255).nullable(),
  fotoContentType: Yup.string().max(100).nullable(),
  fotoSize: Yup.number().integer().min(0).nullable(),
})

function invalidateTiposPalletQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['tipos-pallet'] })
  queryClient.invalidateQueries({ queryKey: ['tipos-pallet-mantenedor'] })
}

const IMAGENES_PALLET = ['image/jpeg', 'image/png'] as const

export function TiposPalletMantenedor() {
  const queryClient = useQueryClient()
  const [buscar, setBuscar] = useState('')
  const [filtroActivo, setFiltroActivo] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<TipoPalletRow | null>(null)
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null)
  const fotoInputRef = useRef<HTMLInputElement>(null)

  const { upload: uploadFoto, isUploading: isFotoUploading } = useFileUpload({
    directory: 'tipos-pallet',
    onError: () => {},
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['tipos-pallet-mantenedor', buscar, filtroActivo],
    queryFn: () => fetchLista(buscar, filtroActivo),
  })

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias-pallet'],
    queryFn: fetchCategorias,
  })

  const { data: paisesCatalogo = [] } = useQuery({
    queryKey: ['paises-catalogo'],
    queryFn: fetchPaises,
  })

  const toggleActivoMutation = useMutation({
    mutationFn: async ({ id, activo }: { id: string; activo: boolean }) => {
      const res = await fetch(`/api/tipos-pallet/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((json as { error?: string }).error || 'Error')
    },
    onSuccess: () => {
      toast.success('Estado actualizado')
      invalidateTiposPalletQueries(queryClient)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      categoriaId: editando?.categoriaId ?? '',
      codigo: editando?.codigo ?? '',
      nombre: editando?.nombre ?? '',
      descripcion: editando?.descripcion ?? '',
      dimensiones: editando?.dimensiones ?? '',
      fotoKey: editando?.fotoKey ?? null,
      fotoNombre: editando?.fotoNombre ?? null,
      fotoContentType: editando?.fotoContentType ?? null,
      fotoSize: editando?.fotoSize ?? null,
      requiereCertificacion: editando?.requiereCertificacion ?? false,
      activo: editando?.activo ?? true,
      paisIds: editando ? editando.paises.map((x) => x.paisId) : ([] as string[]),
    },
    validationSchema: formSchema,
    onSubmit: async (values, { resetForm }) => {
      const payload = {
        categoriaId: values.categoriaId,
        codigo: values.codigo.trim().toUpperCase(),
        nombre: values.nombre.trim(),
        descripcion: values.descripcion?.trim() || null,
        dimensiones: values.dimensiones?.trim() || null,
        fotoKey: values.fotoKey,
        fotoNombre: values.fotoNombre,
        fotoContentType: values.fotoContentType,
        fotoSize: values.fotoSize,
        requiereCertificacion: values.requiereCertificacion,
        activo: values.activo,
        paisIds: values.paisIds,
      }

      try {
        if (editando) {
          const res = await fetch(`/api/tipos-pallet/${editando.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          const json = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error((json as { error?: string }).error || 'Error al guardar')
          toast.success('Tipo de pallet actualizado')
        } else {
          const res = await fetch('/api/tipos-pallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          const json = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error((json as { error?: string }).error || 'Error al crear')
          toast.success('Tipo de pallet creado')
        }
        revokePreview()
        resetForm()
        setDialogOpen(false)
        setEditando(null)
        invalidateTiposPalletQueries(queryClient)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error')
      }
    },
  })

  const revokePreview = () => {
    setPreviewObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }

  useEffect(() => {
    return () => {
      setPreviewObjectUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
    }
  }, [])

  const handleNueva = () => {
    revokePreview()
    setEditando(null)
    setDialogOpen(true)
  }

  const handleEditar = (row: TipoPalletRow) => {
    revokePreview()
    setEditando(row)
    setDialogOpen(true)
  }

  const handlePickFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!IMAGENES_PALLET.includes(file.type as (typeof IMAGENES_PALLET)[number])) {
      toast.error('Solo imágenes JPG o PNG (máx. 10 MB)')
      return
    }
    revokePreview()
    const local = URL.createObjectURL(file)
    setPreviewObjectUrl(local)
    const result = await uploadFoto(file)
    if (!result) {
      URL.revokeObjectURL(local)
      setPreviewObjectUrl(null)
      return
    }
    await formik.setValues({
      ...formik.values,
      fotoKey: result.key,
      fotoNombre: result.filename,
      fotoContentType: result.contentType,
      fotoSize: result.size,
    })
    toast.success('Imagen lista para guardar')
  }

  const handleQuitarFoto = () => {
    revokePreview()
    void formik.setValues({
      ...formik.values,
      fotoKey: null,
      fotoNombre: null,
      fotoContentType: null,
      fotoSize: null,
    })
  }

  const togglePais = (paisId: string) => {
    const set = new Set(formik.values.paisIds)
    if (set.has(paisId)) set.delete(paisId)
    else set.add(paisId)
    void formik.setFieldValue('paisIds', [...set])
  }

  const rows = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" aria-hidden />
            Tipos de pallet
          </h1>
          <p className="text-muted-foreground mt-1">
            Categoría (Verde, Cepillado, Certificado), dimensiones y países de destino. Los activos
            aparecen en órdenes de compra y presupuestos.{' '}
            <Link href="/ordenes-compra" className="text-primary underline font-medium">
              Órdenes de compra
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/tipos-pallet/paises" className="flex items-center">
              <Globe className="h-4 w-4 mr-2" aria-hidden />
              Países destino
            </Link>
          </Button>
          <Button type="button" onClick={handleNueva}>
            <Plus className="h-4 w-4 mr-2" aria-hidden />
            Nuevo tipo
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, nombre, categoría, dimensiones…"
              className="pl-9"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              aria-label="Buscar tipos de pallet"
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
            No hay tipos que coincidan. Cree el primero con «Nuevo tipo».
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Dimensiones</TableHead>
                <TableHead>Países</TableHead>
                <TableHead>Certif.</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="w-14">
                    {row.fotoKey ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/tipos-pallet/${row.id}/foto`}
                        alt=""
                        className="h-10 w-10 rounded object-cover border bg-muted"
                      />
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{row.categoria.nombre}</span>
                    <span className="text-muted-foreground text-xs ml-1">({row.categoria.codigo})</span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{row.codigo}</TableCell>
                  <TableCell>{row.nombre}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[140px] truncate">
                    {row.dimensiones ?? '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {row.paises.map(({ pais }) => (
                        <Badge key={pais.id} variant="outline" className="text-xs">
                          {pais.codigoIso}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {row.requiereCertificacion ? (
                      <Badge variant="secondary">Sí</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">No</span>
                    )}
                  </TableCell>
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
                          ? '¿Desactivar este tipo? No estará disponible en formularios nuevos.'
                          : '¿Activar este tipo?'
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
          if (!o) {
            revokePreview()
            setEditando(null)
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby="tp-desc">
          <FormikProvider value={formik}>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <DialogHeader>
                <DialogTitle>{editando ? 'Editar tipo de pallet' : 'Nuevo tipo de pallet'}</DialogTitle>
                <DialogDescription id="tp-desc">
                  El código debe ser único dentro de la categoría elegida. Marque los países de destino
                  aplicables.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Label htmlFor="tp-categoria">Categoría</Label>
                <Select
                  value={formik.values.categoriaId || undefined}
                  onValueChange={(v) => formik.setFieldValue('categoriaId', v)}
                >
                  <SelectTrigger id="tp-categoria" aria-label="Categoría de pallet">
                    <SelectValue placeholder="Seleccione categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nombre} ({c.codigo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.touched.categoriaId && formik.errors.categoriaId && (
                  <p className="text-sm text-destructive">{formik.errors.categoriaId}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="tp-codigo">Código</Label>
                  <Input
                    id="tp-codigo"
                    name="codigo"
                    value={formik.values.codigo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Ej: PV"
                    autoComplete="off"
                  />
                  {formik.touched.codigo && formik.errors.codigo && (
                    <p className="text-sm text-destructive">{formik.errors.codigo}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tp-nombre">Nombre</Label>
                  <Input
                    id="tp-nombre"
                    name="nombre"
                    value={formik.values.nombre}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.nombre && formik.errors.nombre && (
                    <p className="text-sm text-destructive">{formik.errors.nombre}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tp-dim">Dimensiones</Label>
                <Input
                  id="tp-dim"
                  name="dimensiones"
                  value={formik.values.dimensiones}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Ej: 1200×1000 mm"
                />
              </div>

              <div className="space-y-2 rounded-md border p-3">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" aria-hidden />
                  Foto del pallet (opcional)
                </Label>
                <p className="text-xs text-muted-foreground">JPG o PNG, hasta 10 MB. Se guarda en almacenamiento (mock o S3).</p>
                <div className="flex flex-wrap items-center gap-3">
                  {(previewObjectUrl || (editando?.id && formik.values.fotoKey)) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        previewObjectUrl ||
                        (editando?.id && formik.values.fotoKey
                          ? `/api/tipos-pallet/${editando.id}/foto`
                          : '')
                      }
                      alt=""
                      className="h-20 w-20 rounded object-cover border bg-muted"
                    />
                  )}
                  <div className="flex flex-wrap gap-2">
                    <input
                      ref={fotoInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      aria-label="Elegir foto del pallet"
                      onChange={handlePickFoto}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isFotoUploading || formik.isSubmitting}
                      onClick={() => fotoInputRef.current?.click()}
                    >
                      {isFotoUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-1" aria-hidden />
                          Subiendo…
                        </>
                      ) : (
                        'Elegir imagen'
                      )}
                    </Button>
                    {(formik.values.fotoKey || previewObjectUrl) && (
                      <Button type="button" variant="ghost" size="sm" onClick={handleQuitarFoto}>
                        <X className="h-4 w-4 mr-1" aria-hidden />
                        Quitar foto
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tp-desc-field">Descripción</Label>
                <Textarea
                  id="tp-desc-field"
                  name="descripcion"
                  value={formik.values.descripcion}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={2}
                />
              </div>

              <fieldset className="space-y-2 rounded-md border p-3">
                <legend className="text-sm font-medium px-1">Países de destino</legend>
                <div className="flex flex-col gap-2">
                  {paisesCatalogo.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border"
                        checked={formik.values.paisIds.includes(p.id)}
                        onChange={() => togglePais(p.id)}
                      />
                      <span>
                        {p.nombre} <span className="text-muted-foreground">({p.codigoIso})</span>
                      </span>
                    </label>
                  ))}
                </div>
                {formik.touched.paisIds && formik.errors.paisIds && (
                  <p className="text-sm text-destructive">{String(formik.errors.paisIds)}</p>
                )}
              </fieldset>

              <div className="flex items-center gap-2">
                <input
                  id="tp-cert"
                  name="requiereCertificacion"
                  type="checkbox"
                  checked={formik.values.requiereCertificacion}
                  onChange={(e) => formik.setFieldValue('requiereCertificacion', e.target.checked)}
                  className="h-4 w-4 rounded border"
                />
                <Label htmlFor="tp-cert" className="font-normal">
                  Requiere certificación (NIMF-15 u otro documento)
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="tp-activo"
                  name="activo"
                  type="checkbox"
                  checked={formik.values.activo}
                  onChange={(e) => formik.setFieldValue('activo', e.target.checked)}
                  className="h-4 w-4 rounded border"
                />
                <Label htmlFor="tp-activo" className="font-normal">
                  Activo (visible en selects de la aplicación)
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
