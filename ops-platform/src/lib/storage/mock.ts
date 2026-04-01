/**
 * Mock Storage Provider
 * Simula el almacenamiento de archivos sin guardarlos realmente
 * Útil para desarrollo y testing
 */

import {
  IStorageProvider,
  UploadResult,
  StorageError,
  UploadDocumentOptions,
  GetDocumentUrlOptions,
} from './types'

interface MockDocEntry {
  url: string
  filename: string
  contentType: string
  size: number
  buffer: Buffer
}

/** Alinea `archivoUrl` guardada (`/uploads/mock/general/...`) con la clave del Map. */
export function normalizeMockStoredKey(stored: string): string {
  let s = stored.trim()
  try {
    if (s.startsWith('http://') || s.startsWith('https://')) {
      s = new URL(s).pathname
    }
  } catch {
    /* seguir */
  }
  if (s.startsWith('/uploads/mock/')) return s.slice('/uploads/mock/'.length)
  if (s.startsWith('uploads/mock/')) return s.slice('uploads/mock/'.length)
  return s.replace(/^\/+/, '')
}

export class MockStorageProvider implements IStorageProvider {
  private mockDocuments: Map<string, MockDocEntry>

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
    await new Promise((resolve) => setTimeout(resolve, 300))

    const timestamp = Date.now()
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const prefix = (options?.keyPrefix ?? 'general').replace(/^\/+|\/+$/g, '')
    const key = `${prefix}/${timestamp}-${sanitizedFilename}`

    const url = `/uploads/mock/${key}`

    this.mockDocuments.set(key, {
      url,
      filename,
      contentType,
      size: file.length,
      buffer: Buffer.from(file),
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
    await new Promise((resolve) => setTimeout(resolve, 150))

    const k = normalizeMockStoredKey(key)
    if (!this.mockDocuments.has(k)) {
      throw new StorageError('Documento no encontrado', 'NOT_FOUND')
    }

    this.mockDocuments.delete(k)

    console.log(`[MockStorage] Documento eliminado: ${k}`)
  }

  /**
   * Obtiene la URL de un documento
   */
  async getDocumentUrl(
    key: string,
    _expiresIn?: number,
    _options?: GetDocumentUrlOptions
  ): Promise<string> {
    const k = normalizeMockStoredKey(key)
    const doc = this.mockDocuments.get(k)

    if (!doc) {
      throw new StorageError('Documento no encontrado', 'NOT_FOUND')
    }

    return doc.url
  }

  /**
   * Lee el binario en memoria (solo mock; para API de visualización en desarrollo).
   */
  readDocumentBuffer(stored: string): Buffer {
    const k = normalizeMockStoredKey(stored)
    const doc = this.mockDocuments.get(k)
    if (!doc) {
      throw new StorageError('Documento no encontrado', 'NOT_FOUND')
    }
    return doc.buffer
  }

  /**
   * Verifica si un documento existe
   */
  async documentExists(key: string): Promise<boolean> {
    const k = normalizeMockStoredKey(key)
    return this.mockDocuments.has(k)
  }

  /**
   * Método auxiliar para limpiar todos los documentos mock (útil para testing)
   */
  clearAll(): void {
    this.mockDocuments.clear()
    console.log('[MockStorage] Todos los documentos mock eliminados')
  }
}
