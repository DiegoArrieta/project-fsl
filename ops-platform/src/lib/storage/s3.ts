/**
 * S3 Storage Provider
 * Integración real con Amazon S3
 * NOTA: Placeholder - Implementar cuando se requiera migrar a S3
 */

import { IStorageProvider, UploadResult } from './types'

export class S3StorageProvider implements IStorageProvider {
  constructor() {
    // TODO: Inicializar S3Client cuando se implemente
    console.warn('[S3Storage] Proveedor S3 no implementado aún. Use MockStorageProvider.')
  }

  async uploadDocument(
    _file: Buffer,
    _filename: string,
    _contentType: string
  ): Promise<UploadResult> {
    throw new Error('S3StorageProvider no implementado. Configure USE_MOCK_STORAGE=true')
  }

  async deleteDocument(_key: string): Promise<void> {
    throw new Error('S3StorageProvider no implementado. Configure USE_MOCK_STORAGE=true')
  }

  async getDocumentUrl(_key: string, _expiresIn?: number): Promise<string> {
    throw new Error('S3StorageProvider no implementado. Configure USE_MOCK_STORAGE=true')
  }

  async documentExists(_key: string): Promise<boolean> {
    throw new Error('S3StorageProvider no implementado. Configure USE_MOCK_STORAGE=true')
  }
}

/**
 * Implementación futura para S3:
 * 
 * import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
 * import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
 * 
 * export class S3StorageProvider implements IStorageProvider {
 *   private s3Client: S3Client
 *   private bucketName: string
 * 
 *   constructor() {
 *     this.s3Client = new S3Client({
 *       region: process.env.AWS_REGION!,
 *       credentials: {
 *         accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
 *         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
 *       },
 *     })
 *     this.bucketName = process.env.AWS_S3_BUCKET!
 *   }
 * 
 *   async uploadDocument(file: Buffer, filename: string, contentType: string): Promise<UploadResult> {
 *     const timestamp = Date.now()
 *     const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
 *     const key = `documentos/${new Date().getFullYear()}/${timestamp}-${sanitizedFilename}`
 * 
 *     const command = new PutObjectCommand({
 *       Bucket: this.bucketName,
 *       Key: key,
 *       Body: file,
 *       ContentType: contentType,
 *     })
 * 
 *     await this.s3Client.send(command)
 * 
 *     const url = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
 * 
 *     return { url, key, filename, contentType, size: file.length }
 *   }
 * 
 *   async deleteDocument(key: string): Promise<void> {
 *     const command = new DeleteObjectCommand({
 *       Bucket: this.bucketName,
 *       Key: key,
 *     })
 *     await this.s3Client.send(command)
 *   }
 * 
 *   async getDocumentUrl(key: string, expiresIn: number = 3600): Promise<string> {
 *     const command = new GetObjectCommand({
 *       Bucket: this.bucketName,
 *       Key: key,
 *     })
 *     return await getSignedUrl(this.s3Client, command, { expiresIn })
 *   }
 * 
 *   async documentExists(key: string): Promise<boolean> {
 *     try {
 *       const command = new HeadObjectCommand({
 *         Bucket: this.bucketName,
 *         Key: key,
 *       })
 *       await this.s3Client.send(command)
 *       return true
 *     } catch {
 *       return false
 *     }
 *   }
 * }
 */

