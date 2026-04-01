'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, ImageIcon } from 'lucide-react'

export interface PalletFotoVisualizarRow {
  id: string
  codigo: string
  nombre: string
  fotoNombre?: string | null
}

export interface PalletFotoVisualizarDialogProps {
  row: PalletFotoVisualizarRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PalletFotoVisualizarDialog({
  row,
  open,
  onOpenChange,
}: PalletFotoVisualizarDialogProps) {
  const [cacheBust, setCacheBust] = useState(0)

  useEffect(() => {
    if (open && row) setCacheBust(Date.now())
  }, [open, row?.id])

  const viewSrc = useMemo(() => {
    if (!row?.id) return ''
    return `/api/tipos-pallet/${row.id}/foto?t=${cacheBust}`
  }, [row?.id, cacheBust])

  const downloadHref = row?.id ? `/api/tipos-pallet/${row.id}/foto?download=1` : '#'

  const titulo = row ? `${row.nombre} (${row.codigo})` : 'Foto del pallet'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl w-[calc(100vw-2rem)] max-h-[90vh] flex flex-col p-0 gap-0"
        aria-describedby="pallet-foto-desc"
      >
        <DialogHeader className="px-6 pt-6 pb-3 shrink-0 border-b space-y-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:pr-10">
            <div className="min-w-0">
              <DialogTitle className="flex items-center gap-2 text-left">
                <ImageIcon className="h-5 w-5 shrink-0" aria-hidden />
                <span className="truncate">Foto del pallet</span>
              </DialogTitle>
              <DialogDescription id="pallet-foto-desc" className="text-left truncate">
                {titulo}
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm" className="shrink-0" asChild>
              <a
                href={downloadHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Descargar imagen del pallet"
              >
                <Download className="h-4 w-4 mr-2" aria-hidden />
                Descargar
              </a>
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 min-h-0 bg-muted/30 flex items-center justify-center p-4 overflow-auto rounded-b-lg">
          {open && row && viewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={viewSrc}
              alt={row.fotoNombre || `Foto ${row.codigo}`}
              className="max-w-full max-h-[calc(90vh-9rem)] w-auto h-auto object-contain rounded-md border bg-background shadow-sm"
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
