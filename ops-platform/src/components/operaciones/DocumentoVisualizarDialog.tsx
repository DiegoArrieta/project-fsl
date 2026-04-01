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
import { Download, FileText } from 'lucide-react'

export interface DocumentoVisualizarDoc {
  id: string
  tipo: string
  archivoNombre?: string | null
  archivoTipo?: string | null
}

export interface DocumentoVisualizarDialogProps {
  documento: DocumentoVisualizarDoc | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentoVisualizarDialog({
  documento,
  open,
  onOpenChange,
}: DocumentoVisualizarDialogProps) {
  const [cacheBust, setCacheBust] = useState(0)

  useEffect(() => {
    if (open && documento) setCacheBust(Date.now())
  }, [open, documento?.id])

  /** Vista y descarga: misma ruta API; el servidor genera presign (o sirve mock) por request. */
  const viewSrc = useMemo(() => {
    if (!documento?.id) return ''
    return `/api/documentos/${documento.id}/archivo?t=${cacheBust}`
  }, [documento?.id, cacheBust])

  const downloadHref = documento?.id
    ? `/api/documentos/${documento.id}/archivo?download=1`
    : '#'

  const nombre = documento?.archivoNombre ?? ''
  const isPdf =
    documento?.archivoTipo?.toLowerCase().includes('pdf') || nombre.toLowerCase().endsWith('.pdf')

  const isImage =
    documento?.archivoTipo?.toLowerCase().startsWith('image/') || /\.(jpe?g|png)$/i.test(nombre)

  const labelTipo = documento?.tipo ? String(documento.tipo).replace(/_/g, ' ') : 'Documento'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl w-[calc(100vw-2rem)] h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0"
        aria-describedby="doc-viewer-desc"
      >
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0 border-b space-y-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:pr-10">
            <div className="min-w-0">
              <DialogTitle className="flex items-center gap-2 text-left">
                <FileText className="h-5 w-5 shrink-0" aria-hidden />
                <span className="truncate">{labelTipo}</span>
              </DialogTitle>
              <DialogDescription id="doc-viewer-desc" className="text-left truncate">
                {nombre || 'Vista previa del archivo adjunto'}
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm" className="shrink-0" asChild>
              <a
                href={downloadHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Descargar documento"
              >
                <Download className="h-4 w-4 mr-2" aria-hidden />
                Descargar
              </a>
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 min-h-0 bg-muted/30 relative rounded-b-lg overflow-hidden">
          {open && documento && viewSrc ? (
            isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={viewSrc}
                alt={nombre || 'Documento'}
                className="max-w-full max-h-[calc(90vh-8rem)] object-contain mx-auto block py-4 px-2"
              />
            ) : isPdf ? (
              <iframe
                title={nombre || 'PDF'}
                src={viewSrc}
                className="absolute inset-0 w-full h-full border-0"
              />
            ) : (
              <iframe
                title={nombre || 'Documento'}
                src={viewSrc}
                className="absolute inset-0 w-full h-full border-0"
              />
            )
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
