/**
 * Amazon S3 — PutObject / GetObject firmado / Head / Delete
 */

import { randomUUID } from 'crypto'
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { IStorageProvider, UploadResult, UploadDocumentOptions } from './types'

/** Segmento raíz del objeto en S3: local (desarrollo) vs prod (NODE_ENV=production). */
function getS3EnvironmentSegment(): 'local' | 'prod' {
  return process.env.NODE_ENV === 'production' ? 'prod' : 'local'
}

function sanitizeFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? 'file'
  return base.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 200) || 'file'
}

function parseStoredKey(stored: string): string {
  const s = stored.trim()
  if (s.startsWith('s3://')) {
    const path = s.slice(5)
    const idx = path.indexOf('/')
    if (idx === -1) return s
    return path.slice(idx + 1)
  }
  if (s.startsWith('http://') || s.startsWith('https://')) {
    try {
      const u = new URL(s)
      if (u.hostname.includes('amazonaws.com')) {
        return u.pathname.replace(/^\//, '')
      }
      if (process.env.AWS_S3_PUBLIC_BASE_URL) {
        const base = new URL(process.env.AWS_S3_PUBLIC_BASE_URL)
        if (u.origin === base.origin) {
          return u.pathname.replace(/^\//, '')
        }
      }
    } catch {
      /* seguir */
    }
  }
  return s
}

export class S3StorageProvider implements IStorageProvider {
  private readonly client: S3Client
  private readonly bucket: string
  private readonly region: string

  constructor() {
    const region = process.env.AWS_REGION
    const bucket = process.env.AWS_S3_BUCKET
    if (!region || !bucket) {
      throw new Error('[S3Storage] Defina AWS_REGION y AWS_S3_BUCKET')
    }
    this.region = region
    this.bucket = bucket
    this.client = new S3Client({
      region,
    })
  }

  async uploadDocument(
    file: Buffer,
    filename: string,
    contentType: string,
    options?: UploadDocumentOptions
  ): Promise<UploadResult> {
    const logicalPrefix = (options?.keyPrefix ?? 'general').replace(/^\/+|\/+$/g, '')
    const safe = sanitizeFilename(filename)
    const envRoot = getS3EnvironmentSegment()
    const key = `${envRoot}/${logicalPrefix}/${randomUUID()}-${safe}`

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
      })
    )

    const publicBase = process.env.AWS_S3_PUBLIC_BASE_URL?.replace(/\/$/, '')
    let url: string
    if (publicBase) {
      url = `${publicBase}/${encodeURI(key)}`
    } else {
      url = await getSignedUrl(
        this.client,
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
        { expiresIn: 3600 }
      )
    }

    return {
      url,
      key,
      filename,
      contentType,
      size: file.length,
    }
  }

  async deleteDocument(stored: string): Promise<void> {
    const key = parseStoredKey(stored)
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    )
  }

  async getDocumentUrl(stored: string, expiresIn = 3600): Promise<string> {
    const key = parseStoredKey(stored)
    const publicBase = process.env.AWS_S3_PUBLIC_BASE_URL?.replace(/\/$/, '')
    if (publicBase) {
      return `${publicBase}/${encodeURI(key)}`
    }
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn }
    )
  }

  async documentExists(stored: string): Promise<boolean> {
    const key = parseStoredKey(stored)
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      )
      return true
    } catch {
      return false
    }
  }
}
