'use client'

import { useState, type ComponentProps } from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { AlertTriangle } from 'lucide-react'
import type { OrdenCompraAsociadaPresupuesto } from '@/lib/ordenes-compra/fetch-presupuesto-disponible-oc'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PresupuestoOrdenesAsociadasAlertProps {
  ordenes: OrdenCompraAsociadaPresupuesto[]
  presupuestoNumero?: string
  className?: string
}

function formatoFechaOc(fecha: string): string {
  try {
    return format(parseISO(fecha.length > 10 ? fecha : `${fecha}T12:00:00`), 'dd/MM/yyyy')
  } catch {
    return fecha
  }
}

function badgeVariantEstadoOc(estado: string): ComponentProps<typeof Badge>['variant'] {
  if (estado === 'BORRADOR') return 'secondary'
  if (estado === 'ENVIADA') return 'default'
  if (estado === 'RECIBIDA') return 'outline'
  return 'outline'
}

export function PresupuestoOrdenesAsociadasAlert({
  ordenes,
  presupuestoNumero,
  className,
}: PresupuestoOrdenesAsociadasAlertProps) {
  const [open, setOpen] = useState(false)

  if (!ordenes.length) return null

  const n = ordenes.length
  const tituloPres = presupuestoNumero ? ` (${presupuestoNumero})` : ''

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex w-full max-w-full items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-left text-sm text-amber-950 transition-colors hover:bg-amber-500/15 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100',
          className
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Ver ${n} órdenes de compra vinculadas al presupuesto`}
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
        <span>
          <span className="font-medium">Ya hay {n} orden{n === 1 ? '' : 'es'} de compra</span> que usan este
          presupuesto{tituloPres}. Toca para ver el listado.
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[min(32rem,85vh)] max-w-lg overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Órdenes de compra vinculadas</DialogTitle>
            <DialogDescription>
              Presupuesto{presupuestoNumero ? ` ${presupuestoNumero}` : ''}. Órdenes no canceladas con líneas de
              este presupuesto.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr className="border-b">
                  <th className="p-2 text-left font-medium">Número</th>
                  <th className="p-2 text-left font-medium">Proveedor</th>
                  <th className="p-2 text-left font-medium">Fecha</th>
                  <th className="p-2 text-left font-medium">Estado</th>
                  <th className="p-2 text-right font-medium"> </th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((o) => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="p-2 font-medium">{o.numero}</td>
                    <td className="p-2 text-muted-foreground">
                      {o.proveedorRazonSocial ?? '—'}
                    </td>
                    <td className="p-2 tabular-nums text-muted-foreground">
                      {formatoFechaOc(o.fecha)}
                    </td>
                    <td className="p-2">
                      <Badge variant={badgeVariantEstadoOc(o.estado)} className="text-xs font-normal">
                        {o.estado}
                      </Badge>
                    </td>
                    <td className="p-2 text-right">
                      <Button variant="link" className="h-auto p-0 text-primary" asChild>
                        <Link href={`/ordenes-compra/${o.id}`}>Ver</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
