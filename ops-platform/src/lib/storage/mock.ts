/**
 * Mock Storage Provider
 * Simula el almacenamiento de archivos sin guardarlos realmente
 * Útil para desarrollo y testing
 */

import { IStorageProvider, UploadResult, StorageError, UploadDocumentOptions } from './types'

export class MockStorageProvider implements IStorageProvider {
  private mockDocuments: Map<string, { url: string; filename: string; contentType: string; size: number }>

  constructor() {
    this.mockDocuments = new Map()
  }

  /**
   * Simula la subida de un archivo
   */
  async uploadDocument(
    file: Buffer,
    filename: string,
    contentType: string,
    options?: UploadDocumentOptions
  ): Promise<UploadResult> {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 300))

    const timestamp = Date.now()
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const prefix = (options?.keyPrefix ?? 'general').replace(/^\/+|\/+$/g, '')
    const key = `${prefix}/${timestamp}-${sanitizedFilename}`

    const url = `/uploads/mock/${key}`

    // Guardar en "memoria" (solo para simular exists)
    this.mockDocuments.set(key, {
      url,
      filename,
      contentType,
      size: file.length,
    })

    console.log(`[MockStorage] Documento simulado: ${key} (${file.length} bytes)`)

    return {
      url,
      key,
      filename,
      contentType,
      size: file.length,
    }
  }

  /**
   * Simula la eliminación de un archivo
   */
  async deleteDocument(key: string): Promise<void> {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 150))

    if (!this.mockDocuments.has(key)) {
      throw new StorageError('Documento no encontrado', 'NOT_FOUND')
    }

    this.mockDocuments.delete(key)

    console.log(`[MockStorage] Documento eliminado: ${key}`)
  }

  /**
   * Obtiene la URL de un documento
   */
  async getDocumentUrl(key: string, _expiresIn?: number): Promise<string> {
    const doc = this.mockDocuments.get(key)

    if (!doc) {
      throw new StorageError('Documento no encontrado', 'NOT_FOUND')
    }

    // En mocks, retornar la URL directamente
    return doc.url
  }

  /**
   * Verifica si un documento existe
   */
  async documentExists(key: string): Promise<boolean> {
    return this.mockDocuments.has(key)
  }

  /**
   * Método auxiliar para limpiar todos los documentos mock (útil para testing)
   */
  clearAll(): void {
    this.mockDocuments.clear()
    console.log('[MockStorage] Todos los documentos mock eliminados')
  }
}





