'use client'

import { useMemo } from 'react'
import { useFormik, FormikProvider } from 'formik'
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

interface OpcionTipoPago {
  value: string
  label: string
}

export function getOpcionesTipoPago(
  tipoOperacion: string,
  tieneCliente: boolean,
  tieneProveedor: boolean
): OpcionTipoPago[] {
  const opts: OpcionTipoPago[] = []
  if (tipoOperacion !== 'COMPRA' && tieneCliente) {
    opts.push({ value: 'COBRO_CLIENTE', label: 'Cobro cliente' })
  }
  if (tieneProveedor) {
    opts.push({ value: 'PAGO_PROVEEDOR', label: 'Pago a proveedor' })
  }
  opts.push({ value: 'PAGO_FLETE', label: 'Pago flete' })
  if (tipoOperacion === 'VENTA_COMISION') {
    opts.push({ value: 'PAGO_COMISION', label: 'Pago comisión' })
  }
  return opts
}

export interface RegistrarPagoDialogProps {
  operacionId: string
  tipoOperacion: string
  tieneCliente: boolean
  tieneProveedor: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegistered: () => void
}

export function RegistrarPagoDialog({
  operacionId,
  tipoOperacion,
  tieneCliente,
  tieneProveedor,
  open,
  onOpenChange,
  onRegistered,
}: RegistrarPagoDialogProps) {
  const opcionesTipo = useMemo(
    () => getOpcionesTipoPago(tipoOperacion, tieneCliente, tieneProveedor),
    [tipoOperacion, tieneCliente, tieneProveedor]
  )

  const defaultTipo = opcionesTipo[0]?.value ?? 'PAGO_FLETE'

  const validationSchema = useMemo(
    () =>
      Yup.object({
        tipo: Yup.string().required(),
        monto: Yup.string()
          .required('Monto requerido')
          .test('positive', 'Debe ser mayor a 0', (v) => {
            const n = Number(v)
            return !Number.isNaN(n) && n > 0
          }),
        fechaPago: Yup.string().required('Fecha requerida'),
        metodoPago: Yup.string().max(50).nullable(),
        referencia: Yup.string().max(100).nullable(),
        banco: Yup.string().max(100).nullable(),
        observaciones: Yup.string().nullable(),
      }),
    []
  )

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      tipo: defaultTipo,
      monto: '',
      fechaPago: new Date().toISOString().split('T')[0],
      metodoPago: 'Transferencia',
      referencia: '',
      banco: '',
      observaciones: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const monto = Number(values.monto)

      try {
        const res = await fetch('/api/pagos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operacionId,
            tipo: values.tipo,
            monto,
            fechaPago: values.fechaPago,
            metodoPago: values.metodoPago?.trim() || undefined,
            referencia: values.referencia?.trim() || undefined,
            banco: values.banco?.trim() || undefined,
            observaciones: values.observaciones?.trim() || undefined,
          }),
        })
        const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string }
        if (!res.ok) {
          toast.error(data.error || 'No se pudo registrar el pago')
          return
        }
        toast.success(data.message || 'Pago registrado')
        resetForm()
        onOpenChange(false)
        onRegistered()
      } catch {
        toast.error('Error de red al registrar el pago')
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="registrar-pago-desc">
        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Registrar pago</DialogTitle>
              <DialogDescription id="registrar-pago-desc">
                El pago se asocia a esta operación y actualiza el estado financiero.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="pago-tipo">Tipo</Label>
              <Select value={formik.values.tipo} onValueChange={(v) => formik.setFieldValue('tipo', v)}>
                <SelectTrigger id="pago-tipo" aria-label="Tipo de pago">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {opcionesTipo.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="pago-monto">Monto</Label>
                <Input
                  id="pago-monto"
                  name="monto"
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  value={formik.values.monto}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  aria-invalid={Boolean(formik.touched.monto && formik.errors.monto)}
                />
                {formik.touched.monto && formik.errors.monto && (
                  <p className="text-sm text-destructive">{formik.errors.monto}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pago-fecha">Fecha</Label>
                <Input
                  id="pago-fecha"
                  name="fechaPago"
                  type="date"
                  value={formik.values.fechaPago}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  aria-invalid={Boolean(formik.touched.fechaPago && formik.errors.fechaPago)}
                />
                {formik.touched.fechaPago && formik.errors.fechaPago && (
                  <p className="text-sm text-destructive">{formik.errors.fechaPago}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pago-metodo">Medio de pago</Label>
              <Input
                id="pago-metodo"
                name="metodoPago"
                value={formik.values.metodoPago}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Transferencia, efectivo…"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="pago-ref">Referencia</Label>
                <Input
                  id="pago-ref"
                  name="referencia"
                  value={formik.values.referencia}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pago-banco">Banco</Label>
                <Input
                  id="pago-banco"
                  name="banco"
                  value={formik.values.banco}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pago-obs">Observaciones</Label>
              <Textarea
                id="pago-obs"
                name="observaciones"
                value={formik.values.observaciones}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
  )
}
