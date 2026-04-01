'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export interface ConfirmIrreversibleActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** Resumen de lo que se elimina (ej. número de documento) */
  entitySummary?: string
  /** Texto que enfatiza irreversibilidad */
  warningText?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => Promise<void>
}

/**
 * Modal de confirmación para acciones destructivas e irreversibles.
 */
export function ConfirmIrreversibleActionDialog({
  open,
  onOpenChange,
  title,
  entitySummary,
  warningText = 'Esta acción es irreversible. Los datos eliminados no se pueden recuperar.',
  confirmLabel = 'Eliminar definitivamente',
  cancelLabel = 'Cancelar',
  onConfirm,
}: ConfirmIrreversibleActionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpenChange = (next: boolean) => {
    if (isSubmitting) return
    onOpenChange(next)
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md" aria-describedby="confirm-irreversible-desc">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription id="confirm-irreversible-desc" className="space-y-3 pt-1">
            <span className="block text-foreground/90">{warningText}</span>
            {entitySummary ? (
              <span className="block rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-foreground">
                {entitySummary}
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleConfirm()}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Eliminando…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
