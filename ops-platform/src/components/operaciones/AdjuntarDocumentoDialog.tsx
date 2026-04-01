'use client'

import { useState } from 'react'
import { useFormik, FormikProvider } from 'formik'
import * as Yup from 'yup'
import {
  Dialog,
  DialogContent,
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
import { Upload } from 'lucide-react'

const TIPOS_DOC: { value: string; label: string }[] = [
  { value: 'ORDEN_COMPRA', label: 'Orden de compra' },
  { value: 'ORDEN_COMPRA_CLIENTE', label: 'Orden de compra cliente' },
  { value: 'GUIA_DESPACHO', label: 'Guía de despacho' },
  { value: 'GUIA_RECEPCION', label: 'Guía de recepción' },
  { value: 'FACTURA', label: 'Factura' },
  { value: 'CERTIFICADO_NIMF15', label: 'Certificado NIMF 15' },
  { value: 'OTRO', label: 'Otro' },
]

const TIPO_VALUES = TIPOS_DOC.map((t) => t.value)

const schema = Yup.object({
  tipo: Yup.string().oneOf(TIPO_VALUES, 'Seleccione el tipo de documento').required(),
  numeroDocumento: Yup.string().max(50).nullable(),
  fechaDocumento: Yup.string().nullable(),
  observaciones: Yup.string().nullable(),
  esObligatorio: Yup.boolean(),
  choferNombre: Yup.string().max(100).nullable(),
  choferRut: Yup.string().max(12).nullable(),
  vehiculoPatente: Yup.string().max(10).nullable(),
  transportista: Yup.string().max(255).nullable(),
})

export interface AdjuntarDocumentoDialogProps {
  operacionId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onGuardado: () => void
}

export function AdjuntarDocumentoDialog({
  operacionId,
  open,
  onOpenChange,
  onGuardado,
}: AdjuntarDocumentoDialogProps) {
  const [archivo, setArchivo] = useState<File | null>(null)

  const formik = useFormik({
    initialValues: {
      tipo: '',
      numeroDocumento: '',
      fechaDocumento: '',
      observaciones: '',
      esObligatorio: false,
      choferNombre: '',
      choferRut: '',
      vehiculoPatente: '',
      transportista: '',
      cantidadDocumento: '' as string | number,
      cantidadDanada: '' as string | number,
    },
    validationSchema: schema,
    onSubmit: async (values, { resetForm }) => {
      if (!operacionId?.trim()) {
        toast.error('Falta la operación')
        return
      }
      if (!archivo) {
        toast.error('Seleccione un archivo (PDF, JPG o PNG, máx. 10 MB)')
        return
      }

      const fd = new FormData()
      fd.append('file', archivo)
      fd.append('operacionId', operacionId.trim())
      fd.append('tipo', values.tipo)
      fd.append('esObligatorio', values.esObligatorio ? 'true' : 'false')

      if (values.numeroDocumento?.trim()) fd.append('numeroDocumento', values.numeroDocumento.trim())
      if (values.fechaDocumento?.trim()) fd.append('fechaDocumento', values.fechaDocumento.trim())
      if (values.observaciones?.trim()) fd.append('observaciones', values.observaciones.trim())
      if (values.choferNombre?.trim()) fd.append('choferNombre', values.choferNombre.trim())
      if (values.choferRut?.trim()) fd.append('choferRut', values.choferRut.trim())
      if (values.vehiculoPatente?.trim()) fd.append('vehiculoPatente', values.vehiculoPatente.trim())
      if (values.transportista?.trim()) fd.append('transportista', values.transportista.trim())

      const cd = values.cantidadDocumento === '' ? null : Number(values.cantidadDocumento)
      if (cd !== null && !Number.isNaN(cd)) fd.append('cantidadDocumento', String(cd))

      const dd = values.cantidadDanada === '' ? null : Number(values.cantidadDanada)
      if (dd !== null && !Number.isNaN(dd)) fd.append('cantidadDanada', String(dd))

      try {
        const res = await fetch('/api/documentos', {
          method: 'POST',
          body: fd,
        })
        const data = (await res.json().catch(() => ({}))) as {
          error?: string
          message?: string
          issues?: unknown
        }
        if (!res.ok) {
          toast.error(data.error || 'No se pudo subir el documento')
          return
        }
        toast.success(data.message || 'Documento adjuntado')
        resetForm()
        setArchivo(null)
        onOpenChange(false)
        onGuardado()
      } catch {
        toast.error('Error de red al subir')
      }
    },
  })

  const esGuia =
    formik.values.tipo === 'GUIA_DESPACHO' || formik.values.tipo === 'GUIA_RECEPCION'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        aria-describedby={undefined}
      >
        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" aria-hidden />
                Adjuntar documento
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="doc-file">Archivo</Label>
              <Input
                id="doc-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                aria-label="Seleccionar archivo"
              />
              <p className="text-xs text-muted-foreground">PDF o imagen, hasta 10 MB.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-tipo">Tipo de documento</Label>
              <Select
                value={formik.values.tipo || undefined}
                onValueChange={(v) => formik.setFieldValue('tipo', v)}
              >
                <SelectTrigger id="doc-tipo" aria-label="Tipo de documento">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="z-200">
                  {TIPOS_DOC.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.tipo && formik.errors.tipo && (
                <p className="text-sm text-destructive">{formik.errors.tipo}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="doc-numero">Número documento</Label>
                <Input
                  id="doc-numero"
                  name="numeroDocumento"
                  value={formik.values.numeroDocumento}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-fecha">Fecha documento</Label>
                <Input
                  id="doc-fecha"
                  name="fechaDocumento"
                  type="date"
                  value={formik.values.fechaDocumento}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-obs">Observaciones</Label>
              <Textarea
                id="doc-obs"
                name="observaciones"
                value={formik.values.observaciones}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="doc-oblig"
                name="esObligatorio"
                type="checkbox"
                checked={formik.values.esObligatorio}
                onChange={(e) => formik.setFieldValue('esObligatorio', e.target.checked)}
                className="h-4 w-4 rounded border"
              />
              <Label htmlFor="doc-oblig" className="font-normal">
                Marcar como documento obligatorio para la operación
              </Label>
            </div>

            {esGuia && (
              <div className="space-y-3 rounded-md border p-3 bg-muted/40">
                <p className="text-sm font-medium">Datos de transporte (opcional)</p>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    name="choferNombre"
                    placeholder="Chofer"
                    value={formik.values.choferNombre}
                    onChange={formik.handleChange}
                  />
                  <Input
                    name="choferRut"
                    placeholder="RUT chofer"
                    value={formik.values.choferRut}
                    onChange={formik.handleChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    name="vehiculoPatente"
                    placeholder="Patente"
                    value={formik.values.vehiculoPatente}
                    onChange={formik.handleChange}
                  />
                  <Input
                    name="transportista"
                    placeholder="Transportista"
                    value={formik.values.transportista}
                    onChange={formik.handleChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    name="cantidadDocumento"
                    type="number"
                    min={0}
                    placeholder="Cantidad"
                    value={formik.values.cantidadDocumento}
                    onChange={formik.handleChange}
                  />
                  <Input
                    name="cantidadDanada"
                    type="number"
                    min={0}
                    placeholder="Cantidad dañada"
                    value={formik.values.cantidadDanada}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? 'Subiendo…' : 'Subir'}
              </Button>
            </DialogFooter>
          </form>
        </FormikProvider>
      </DialogContent>
    </Dialog>
  )
}
