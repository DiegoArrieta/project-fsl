'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useFormik, FormikProvider } from 'formik'
import { useQuery } from '@tanstack/react-query'
import * as Yup from 'yup'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import type { FactoringOperacionApi } from '@/types/operacion-api'
import { ExternalLink, Loader2 } from 'lucide-react'

interface EmpresaFactoringRow {
  id: string
  nombre: string
  activo: boolean
}

async function fetchEmpresasActivas(): Promise<EmpresaFactoringRow[]> {
  const res = await fetch('/api/empresas-factoring?activo=true&pageSize=100')
  if (!res.ok) throw new Error('Error al cargar empresas')
  const json = (await res.json()) as { data: EmpresaFactoringRow[] }
  return json.data ?? []
}

function toInputDate(iso: string | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

function numToForm(n: string | number | { toString: () => string } | undefined | null): string {
  if (n === undefined || n === null) return ''
  return String(Number(n))
}

const positiveAmount = (label: string) =>
  Yup.string()
    .required(`${label} requerido`)
    .test('pos', 'Debe ser mayor a 0', (v) => {
      const n = Number(v)
      return !Number.isNaN(n) && n > 0
    })

const optionalAmount = Yup.string()
  .nullable()
  .test('num', 'Monto inválido', (v) => {
    if (v === undefined || v === null || v === '') return true
    const n = Number(v)
    return !Number.isNaN(n) && n >= 0
  })

export interface RegistrarFactoringDialogProps {
  operacionId: string
  factoring: FactoringOperacionApi | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function RegistrarFactoringDialog({
  operacionId,
  factoring,
  open,
  onOpenChange,
  onSaved,
}: RegistrarFactoringDialogProps) {
  const esEdicion = Boolean(factoring?.id)

  const { data: empresas = [], isLoading: loadingEmpresas } = useQuery({
    queryKey: ['empresas-factoring-activas'],
    queryFn: fetchEmpresasActivas,
    enabled: open,
    staleTime: 60_000,
  })

  const validationSchema = useMemo(
    () =>
      Yup.object({
        empresaFactoringId: Yup.string()
          .uuid('Seleccione una empresa de factoring')
          .required('Empresa requerida'),
        fechaFactoring: Yup.string().required('Fecha requerida'),
        montoFactura: positiveAmount('Monto factura'),
        montoAdelantado: positiveAmount('Monto adelantado'),
        comisionFactoring: optionalAmount,
        fechaVencimiento: Yup.string().nullable(),
        observaciones: Yup.string().nullable(),
      }),
    []
  )

  const initialValues = useMemo(
    () => ({
      empresaFactoringId: factoring?.empresaFactoringId ?? factoring?.empresaFactoring?.id ?? '',
      fechaFactoring: factoring?.fechaFactoring
        ? toInputDate(factoring.fechaFactoring)
        : new Date().toISOString().split('T')[0],
      montoFactura: numToForm(factoring?.montoFactura),
      montoAdelantado: numToForm(factoring?.montoAdelantado),
      comisionFactoring: factoring?.comisionFactoring != null ? numToForm(factoring.comisionFactoring) : '',
      fechaVencimiento: factoring?.fechaVencimiento ? toInputDate(factoring.fechaVencimiento) : '',
      observaciones: factoring?.observaciones ?? '',
    }),
    [factoring]
  )

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const montoFactura = Number(values.montoFactura)
      const montoAdelantado = Number(values.montoAdelantado)

      let comisionNum: number | null | undefined
      if (values.comisionFactoring?.trim()) {
        const c = Number(values.comisionFactoring)
        if (Number.isNaN(c) || c < 0) {
          toast.error('Comisión inválida')
          return
        }
        comisionNum = c
      } else {
        comisionNum = esEdicion ? null : undefined
      }

      const venc = values.fechaVencimiento?.trim() || null

      if (!operacionId?.trim()) {
        toast.error('Falta el identificador de la operación')
        return
      }

      const basePayload = {
        operacionId: operacionId.trim(),
        empresaFactoringId: values.empresaFactoringId,
        fechaFactoring: values.fechaFactoring,
        montoFactura,
        montoAdelantado,
        observaciones: values.observaciones?.trim() || null,
        fechaVencimiento: venc,
        ...(comisionNum !== undefined ? { comisionFactoring: comisionNum } : {}),
      }

      const bodyCreate = basePayload
      const bodyUpdate = {
        ...basePayload,
        comisionFactoring: comisionNum,
      }

      try {
        // Ruta plana: evita 404 con /api/operaciones/[id]/factoring en algunos entornos (Next 15/16).
        const res = await fetch('/api/factoring', {
          method: esEdicion ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(esEdicion ? bodyUpdate : bodyCreate),
        })

        const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string }
        if (!res.ok) {
          toast.error(data.error || 'No se pudo guardar el factoring')
          return
        }
        toast.success(data.message || 'Factoring guardado')
        if (!esEdicion) resetForm()
        onOpenChange(false)
        onSaved()
      } catch {
        toast.error('Error de red')
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" aria-describedby="factoring-desc">
        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{esEdicion ? 'Editar factoring' : 'Registrar factoring'}</DialogTitle>
              <DialogDescription id="factoring-desc">
                Elija la empresa de factoring del catálogo y complete los montos de la operación.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <Label htmlFor="fac-empresa-id">Empresa de factoring</Label>
                <Button type="button" variant="link" className="h-auto p-0 text-sm" asChild>
                  <Link href="/empresas-factoring" className="inline-flex items-center gap-1">
                    Gestionar catálogo
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </Link>
                </Button>
              </div>
              {loadingEmpresas ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Cargando empresas…
                </div>
              ) : empresas.length === 0 ? (
                <p className="text-sm text-destructive">
                  No hay empresas activas. Cree una en{' '}
                  <Link href="/empresas-factoring" className="underline font-medium">
                    Emp. factoring
                  </Link>
                  .
                </p>
              ) : (
                <Select
                  modal={false}
                  value={formik.values.empresaFactoringId || undefined}
                  onValueChange={(v) => formik.setFieldValue('empresaFactoringId', v)}
                >
                  <SelectTrigger id="fac-empresa-id" aria-label="Empresa de factoring">
                    <SelectValue placeholder="Seleccionar empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {formik.touched.empresaFactoringId && formik.errors.empresaFactoringId && (
                <p className="text-sm text-destructive">{formik.errors.empresaFactoringId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fac-fecha">Fecha factoring</Label>
              <Input
                id="fac-fecha"
                name="fechaFactoring"
                type="date"
                value={formik.values.fechaFactoring}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.fechaFactoring && formik.errors.fechaFactoring && (
                <p className="text-sm text-destructive">{formik.errors.fechaFactoring}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="fac-monto-fact">Monto factura</Label>
                <Input
                  id="fac-monto-fact"
                  name="montoFactura"
                  type="number"
                  min={0}
                  step="any"
                  value={formik.values.montoFactura}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.montoFactura && formik.errors.montoFactura && (
                  <p className="text-sm text-destructive">{formik.errors.montoFactura}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fac-monto-adv">Monto adelantado</Label>
                <Input
                  id="fac-monto-adv"
                  name="montoAdelantado"
                  type="number"
                  min={0}
                  step="any"
                  value={formik.values.montoAdelantado}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.montoAdelantado && formik.errors.montoAdelantado && (
                  <p className="text-sm text-destructive">{formik.errors.montoAdelantado}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="fac-comision">Comisión factoring (opcional)</Label>
                <Input
                  id="fac-comision"
                  name="comisionFactoring"
                  type="number"
                  min={0}
                  step="any"
                  value={formik.values.comisionFactoring}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fac-venc">Vencimiento (opcional)</Label>
                <Input
                  id="fac-venc"
                  name="fechaVencimiento"
                  type="date"
                  value={formik.values.fechaVencimiento}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fac-obs">Observaciones</Label>
              <Textarea
                id="fac-obs"
                name="observaciones"
                value={formik.values.observaciones}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={formik.isSubmitting || loadingEmpresas || empresas.length === 0}
              >
                {formik.isSubmitting ? 'Guardando…' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </FormikProvider>
      </DialogContent>
    </Dialog>
  )
}
