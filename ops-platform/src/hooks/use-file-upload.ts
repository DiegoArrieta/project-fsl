'use client'

import { useCallback, useState } from 'react'

export interface FileUploadResult {
  url: string
  key: string
  filename: string
  contentType: string
  size: number
  directory: string
}

export interface UseFileUploadOptions {
  /** Directorio lógico (validado en servidor). Por defecto `general`. */
  directory?: string
  onSuccess?: (data: FileUploadResult) => void
  onError?: (error: Error) => void
}

export interface UseFileUploadReturn {
  upload: (file: File) => Promise<FileUploadResult | null>
  uploadMany: (files: File[]) => Promise<FileUploadResult[]>
  isUploading: boolean
  error: Error | null
  clearError: () => void
}

/**
 * Subida desacoplada a /api/storage/upload (S3 o mock según entorno).
 */
export function useFileUpload({
  directory,
  onSuccess,
  onError,
}: UseFileUploadOptions = {}): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const postFile = useCallback(
    async (file: File): Promise<FileUploadResult | null> => {
      const form = new FormData()
      form.set('file', file)
      const dir = directory?.trim()
      if (dir) form.set('directory', dir)

      const res = await fetch('/api/storage/upload', {
        method: 'POST',
        body: form,
      })

      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean
        error?: string
        data?: FileUploadResult
      }

      if (!res.ok || !json.success || !json.data) {
        const msg = json.error || 'Error al subir el archivo'
        const err = new Error(msg)
        onError?.(err)
        setError(err)
        return null
      }

      onSuccess?.(json.data)
      return json.data
    },
    [directory, onSuccess, onError]
  )

  const upload = useCallback(
    async (file: File) => {
      setError(null)
      setIsUploading(true)
      try {
        return await postFile(file)
      } finally {
        setIsUploading(false)
      }
    },
    [postFile]
  )

  const uploadMany = useCallback(
    async (files: File[]) => {
      setError(null)
      setIsUploading(true)
      const out: FileUploadResult[] = []
      try {
        for (const f of files) {
          const r = await postFile(f)
          if (r) out.push(r)
        }
        return out
      } finally {
        setIsUploading(false)
      }
    },
    [postFile]
  )

  return { upload, uploadMany, isUploading, error, clearError }
}
