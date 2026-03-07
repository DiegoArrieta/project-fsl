/**
 * Storage Provider Factory
 * Selecciona el proveedor de storage según configuración
 */

import { IStorageProvider, ALLOWED_FILE_TYPES, MAX_FILE_SIZE, StorageError } from './types'
import { MockStorageProvider } from './mock'
import { S3StorageProvider } from './s3'

// Singleton para el proveedor de storage
let storageInstance: IStorageProvider | null = null

/**
 * Obtiene la instancia del proveedor de storage
 */
export function getStorageProvider(): IStorageProvider {
  if (storageInstance) {
    return storageInstance
  }

  const useMock = process.env.USE_MOCK_STORAGE !== 'false' // Por defecto usar mocks

  if (useMock) {
    console.log('[Storage] Usando MockStorageProvider')
    storageInstance = new MockStorageProvider()
  } else {
    console.log('[Storage] Usando S3StorageProvider')
    storageInstance = new S3StorageProvider()
  }

  return storageInstance
}

/**
 * Valida que un archivo cumpla con los requisitos
 */
export function validateFile(filename: string, contentType: string, size: number): void {
  // Validar tipo de archivo
  if (!ALLOWED_FILE_TYPES.includes(contentType as any)) {
    throw new StorageError(
      `Tipo de archivo no permitido. Permitidos: ${ALLOWED_FILE_TYPES.join(', ')}`,
      'INVALID_TYPE'
    )
  }

  // Validar tamaño
  if (size > MAX_FILE_SIZE) {
    throw new StorageError(
      `Archivo demasiado grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024} MB`,
      'FILE_TOO_LARGE'
    )
  }

  // Validar que tenga extensión válida
  const extension = filename.split('.').pop()?.toLowerCase()
  const validExtensions = ['pdf', 'jpg', 'jpeg', 'png']

  if (!extension || !validExtensions.includes(extension)) {
    throw new StorageError(
      `Extensión de archivo no válida. Permitidas: ${validExtensions.join(', ')}`,
      'INVALID_TYPE'
    )
  }
}

// Re-exportar tipos y constantes
export * from './types'
export { MockStorageProvider } from './mock'
export { S3StorageProvider } from './s3'




