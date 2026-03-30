import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getStorageProvider,
  validateFile,
  StorageError,
  normalizeUploadDirectory,
} from '@/lib/storage'

export const runtime = 'nodejs'

/**
 * POST /api/storage/upload
 * multipart: file (requerido), directory (opcional, prefijo lógico validado)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'Campo "file" es requerido' }, { status: 400 })
    }

    const directoryRaw = formData.get('directory')
    const directoryStr =
      typeof directoryRaw === 'string' ? directoryRaw : directoryRaw != null ? String(directoryRaw) : null

    let keyPrefix: string
    try {
      keyPrefix = normalizeUploadDirectory(directoryStr)
    } catch (e) {
      if (e instanceof StorageError) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 })
      }
      throw e
    }

    const buf = Buffer.from(await file.arrayBuffer())
    validateFile(file.name, file.type, buf.length)

    const storage = getStorageProvider()
    const result = await storage.uploadDocument(buf, file.name, file.type, { keyPrefix })

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        directory: keyPrefix,
      },
    })
  } catch (error) {
    if (error instanceof StorageError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }
    console.error('[storage/upload]', error)
    return NextResponse.json({ success: false, error: 'Error al subir el archivo' }, { status: 500 })
  }
}
