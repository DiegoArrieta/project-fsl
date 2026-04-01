/**
 * Tipos e interfaces para la capa de storage
 * Abstracción para permitir diferentes implementaciones (mocks, S3, etc.)
 */

export interface UploadResult {
  url: string
  key: string
  filename: string
  contentType: string
  size: number
}

/** Opciones opcionales para rutas bajo el bucket (directorio lógico validado) */
export interface UploadDocumentOptions {
  keyPrefix?: string
}

/** Modifica URLs firmadas de S3 (sin efecto en mock ni URL pública fija). */
export interface GetDocumentUrlOptions {
  contentDisposition?: 'inline' | 'attachment'
  downloadFilename?: string
}

export interface IStorageProvider {
  /**
   * Sube un archivo al storage
   */
  uploadDocument(
    file: Buffer,
    filename: string,
    contentType: string,
    options?: UploadDocumentOptions
  ): Promise<UploadResult>

  /**
   * Elimina un archivo del storage
   */
  deleteDocument(key: string): Promise<void>

  /**
   * Obtiene la URL de un documento (puede ser signed URL)
   */
  getDocumentUrl(key: string, expiresIn?: number, options?: GetDocumentUrlOptions): Promise<string>

  /**
   * Verifica si un documento existe
   */
  documentExists(key: string): Promise<boolean>
}

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
] as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number]

export class StorageError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_TYPE' | 'FILE_TOO_LARGE' | 'UPLOAD_FAILED' | 'DELETE_FAILED' | 'NOT_FOUND'
  ) {
    super(message)
    this.name = 'StorageError'
  }
}





