'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button, type ButtonProps } from '@/components/ui/button'

export type DocumentoDownloadButtonProps = Omit<ButtonProps, 'onClick'> & {
  documentoId: string
  archivoNombre?: string | null
}

export function DocumentoDownloadButton({
  documentoId,
  archivoNombre,
  disabled,
  children,
  'aria-label': ariaLabel,
  ...props
}: DocumentoDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleClick = async () => {
    if (isDownloading) return
    setIsDownloading(true)
    try {
      const res = await fetch(
        `/api/documentos/${documentoId}/signed-url?disposition=attachment`,
        { credentials: 'include' }
      )
      const json = (await res.json()) as {
        success?: boolean
        data?: { url?: string }
        error?: string
      }

      if (res.ok && json.success && json.data?.url) {
        window.open(json.data.url, '_blank', 'noopener,noreferrer')
        return
      }

      toast.error(json.error || 'No se pudo descargar el documento')
    } catch {
      toast.error('No se pudo descargar el documento')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      {...props}
      disabled={disabled || isDownloading}
      onClick={handleClick}
      aria-busy={isDownloading}
      aria-label={ariaLabel ?? `Descargar ${archivoNombre ?? 'documento'}`}
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
      ) : (
        <Download className="h-4 w-4 shrink-0" aria-hidden />
      )}
      {children ?? 'Descargar'}
    </Button>
  )
}
