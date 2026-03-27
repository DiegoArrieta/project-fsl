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

export interface IStorageProvider {
  /**
   * Sube un archivo al storage
   */
  uploadDocument(file: Buffer, filename: string, contentType: string): Promise<UploadResult>

  /**
   * Elimina un archivo del storage
   */
  deleteDocument(key: string): Promise<void>

  /**
   * Obtiene la URL de un documento (puede ser signed URL)
   */
  getDocumentUrl(key: string, expiresIn?: number): Promise<string>

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





