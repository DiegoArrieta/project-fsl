'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileText } from 'lucide-react'
import { DocumentoDownloadButton } from '@/components/operaciones/DocumentoDownloadButton'

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

function PreviewSkeleton() {
  return (
    <div
      className="flex h-full min-h-[200px] flex-col gap-4 bg-muted/30 p-6 sm:p-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <div className="h-9 w-2/3 animate-pulse rounded-md bg-muted" />
        <div className="h-[min(60vh,420px)] w-full animate-pulse rounded-lg bg-muted" />
        <div className="flex gap-2">
          <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </div>
  )
}

interface DocumentoPreviewAreaProps {
  viewSrc: string
  nombre: string
  isImage: boolean
  isPdf: boolean
}

function DocumentoPreviewArea({ viewSrc, nombre, isImage, isPdf }: DocumentoPreviewAreaProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  const showSkeleton = status === 'loading'

  return (
    <div className="relative h-full min-h-[200px] w-full rounded-b-lg">
      {showSkeleton ? (
        <div className="absolute inset-0 z-10 bg-muted/30">
          <PreviewSkeleton />
        </div>
      ) : null}
      {status === 'error' ? (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-muted/30 p-4 text-center text-sm text-destructive"
          role="alert"
        >
          No se pudo cargar la vista previa.
        </div>
      ) : null}
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={viewSrc}
          alt={nombre || 'Documento'}
          className={`relative z-0 mx-auto block max-h-[calc(90vh-8rem)] max-w-full object-contain px-2 py-4 ${
            status === 'error' ? 'hidden' : ''
          }`}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      ) : isPdf ? (
        <iframe
          title={nombre || 'PDF'}
          src={viewSrc}
          className="absolute inset-0 z-0 h-full w-full border-0"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      ) : (
        <iframe
          title={nombre || 'Documento'}
          src={viewSrc}
          className="absolute inset-0 z-0 h-full w-full border-0"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
    </div>
  )
}

export function DocumentoVisualizarDialog({
  documento,
  open,
  onOpenChange,
}: DocumentoVisualizarDialogProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null)
  const [resolveError, setResolveError] = useState<string | null>(null)
  const [isResolvingUrl, setIsResolvingUrl] = useState(false)

  useEffect(() => {
    if (!open || !documento?.id) {
      setResolvedSrc(null)
      setResolveError(null)
      setIsResolvingUrl(false)
      return
    }

    let cancelled = false
    setIsResolvingUrl(true)
    setResolveError(null)
    setResolvedSrc(null)

    void (async () => {
      try {
        const res = await fetch(
          `/api/documentos/${documento.id}/signed-url?disposition=inline`,
          { credentials: 'include' }
        )
        const json = (await res.json()) as {
          success?: boolean
          data?: { url?: string }
          error?: string
        }
        if (cancelled) return
        if (!res.ok || !json.success || !json.data?.url) {
          throw new Error(json.error || 'No se pudo obtener la vista previa')
        }
        setResolvedSrc(json.data.url)
      } catch (e) {
        if (cancelled) return
        setResolveError(e instanceof Error ? e.message : 'Error al cargar')
      } finally {
        if (!cancelled) setIsResolvingUrl(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, documento?.id])

  const nombre = documento?.archivoNombre ?? ''
  const isPdf =
    documento?.archivoTipo?.toLowerCase().includes('pdf') || nombre.toLowerCase().endsWith('.pdf')

  const isImage =
    documento?.archivoTipo?.toLowerCase().startsWith('image/') || /\.(jpe?g|png|gif|webp)$/i.test(nombre)

  const labelTipo = documento?.tipo ? String(documento.tipo).replace(/_/g, ' ') : 'Documento'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[90vh] max-h-[90vh] w-[calc(100vw-2rem)] max-w-5xl flex-col gap-0 p-0"
        aria-describedby="doc-viewer-desc"
      >
        <DialogHeader className="shrink-0 space-y-1 border-b px-6 pb-2 pt-6">
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
            {documento?.id ? (
              <DocumentoDownloadButton
                documentoId={documento.id}
                archivoNombre={documento.archivoNombre}
                variant="outline"
                size="sm"
                className="shrink-0"
              />
            ) : null}
          </div>
        </DialogHeader>
        <div className="relative min-h-0 flex-1 overflow-hidden bg-muted/30">
          {open && documento && isResolvingUrl ? <PreviewSkeleton /> : null}
          {open && documento && resolveError ? (
            <div
              className="flex h-full min-h-[200px] items-center justify-center p-4 text-center text-sm text-destructive"
              role="alert"
            >
              {resolveError}
            </div>
          ) : null}
          {open && documento && resolvedSrc && !resolveError && !isResolvingUrl ? (
            <DocumentoPreviewArea
              key={resolvedSrc}
              viewSrc={resolvedSrc}
              nombre={nombre}
              isImage={isImage}
              isPdf={isPdf}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
