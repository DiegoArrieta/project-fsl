'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const estadoEtiqueta: Record<string, string> = {
  BORRADOR: 'Borrador',
  ENVIADO: 'Enviado',
  ACEPTADO: 'Aceptado',
  RECHAZADO: 'Rechazado',
}

interface PasoFlujo {
  clave: string
  titulo: string
  descripcion: string
  comoAvanzar: string
}

const pasosOrden: PasoFlujo[] = [
  {
    clave: 'BORRADOR',
    titulo: 'Borrador',
    descripcion:
      'El presupuesto nace en borrador. Puedes editarlo, generar el PDF y eliminarlo mientras siga en este estado.',
    comoAvanzar:
      'Lo habitual después es pasar a Enviado, cuando ya hayas enviado la cotización al cliente (correo, WhatsApp, etc.). Si al editar o guardar el presupuesto puedes cambiar el estado, úsalo para dejar constancia de que ya salió.\n\nTambién puedes ir directo a Aceptado con el botón «Aceptar y crear operación» si el cliente ya confirmó y no necesitas registrar el envío por separado.',
  },
  {
    clave: 'ENVIADO',
    titulo: 'Enviado',
    descripcion:
      'Significa que ya compartiste la cotización con el cliente y estás a la espera de respuesta.',
    comoAvanzar:
      'El siguiente paso es Aceptado: cuando el cliente confirme, presiona «Aceptar y crear operación» en esta pantalla; se creará la operación de venta.\n\nSi la venta no procede, cambia el estado a Rechazado cuando la aplicación te lo permita.',
  },
  {
    clave: 'ACEPTADO',
    titulo: 'Aceptado',
    descripcion:
      'El cliente aceptó la propuesta. El sistema creó una operación vinculada a este presupuesto.',
    comoAvanzar:
      'No hay otro estado en el flujo del presupuesto: lo demás lo sigues en la operación (órdenes de compra, documentos, pagos, etc.).',
  },
  {
    clave: 'RECHAZADO',
    titulo: 'Rechazado',
    descripcion:
      'El cliente no aceptó la propuesta o no se concretó la venta con este presupuesto.',
    comoAvanzar:
      'Este presupuesto queda cerrado. No puedes usar uno rechazado para crear órdenes de compra asociadas al mismo flujo.',
  },
]

interface PresupuestoEstadosWorkflowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  estadoActual: string
}

export function PresupuestoEstadosWorkflowDialog({
  open,
  onOpenChange,
  estadoActual,
}: PresupuestoEstadosWorkflowDialogProps) {
  const labelActual = estadoEtiqueta[estadoActual] ?? estadoActual

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Estados del presupuesto</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 pt-1 text-left text-sm text-muted-foreground">
              <p>
                Así avanzan los presupuestos en la plataforma. Este presupuesto está ahora en:
              </p>
              <Badge variant="default" className="text-sm">
                {labelActual}
              </Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        <ol className="relative mt-2 space-y-0 border-l border-border pl-6">
          {pasosOrden.map((paso, index) => {
            const esActual = paso.clave === estadoActual
            return (
              <li key={paso.clave} className="pb-8 last:pb-0">
                <span
                  className={cn(
                    'absolute -left-[9px] mt-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-background',
                    esActual ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                  )}
                  aria-hidden
                />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">{index + 1}. {paso.titulo}</span>
                    {esActual ? (
                      <Badge variant="secondary" className="text-xs">
                        Estás aquí
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{paso.descripcion}</p>
                  <div className="rounded-md bg-muted/60 px-3 py-2 text-sm text-foreground">
                    <p className="font-medium text-muted-foreground">Cómo se acciona</p>
                    <p className="mt-1 whitespace-pre-line text-foreground/95">{paso.comoAvanzar}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </DialogContent>
    </Dialog>
  )
}
