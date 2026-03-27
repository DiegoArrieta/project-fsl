import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { createDocumentoSchema } from '@/lib/validations/documento'
import { getStorageProvider, validateFile, StorageError } from '@/lib/storage'
import { obtenerDocumentosObligatorios, calcularEstadoDocumental } from '@/lib/operaciones/documentos'

/**
 * GET /api/documentos
 * Lista documentos (filtrar por operacionId)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const operacionId = searchParams.get('operacionId')

    if (!operacionId) {
      return NextResponse.json(
        { success: false, error: 'operacionId es requerido' },
        { status: 400 }
      )
    }

    const documentos = await prisma.documento.findMany({
      where: { operacionId },
      orderBy: {
        uploadedAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: documentos,
    })
  } catch (error) {
    console.error('Error al listar documentos:', error)
    return NextResponse.json(
      { success: false, error: 'Error al listar documentos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/documentos
 * Sube un documento (multipart/form-data)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extraer archivo
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Archivo es requerido' },
        { status: 400 }
      )
    }

    // Extraer metadata
    const metadata = {
      operacionId: formData.get('operacionId') as string,
      tipo: formData.get('tipo') as string,
      numeroDocumento: formData.get('numeroDocumento') as string | null,
      fechaDocumento: formData.get('fechaDocumento') as string | null,
      observaciones: formData.get('observaciones') as string | null,
      esObligatorio: formData.get('esObligatorio') === 'true',
      choferNombre: formData.get('choferNombre') as string | null,
      choferRut: formData.get('choferRut') as string | null,
      vehiculoPatente: formData.get('vehiculoPatente') as string | null,
      transportista: formData.get('transportista') as string | null,
      cantidadDocumento: formData.get('cantidadDocumento')
        ? parseInt(formData.get('cantidadDocumento') as string, 10)
        : null,
      cantidadDanada: formData.get('cantidadDanada')
        ? parseInt(formData.get('cantidadDanada') as string, 10)
        : null,
    }

    // Validar metadata
    const validatedMetadata = createDocumentoSchema.parse(metadata)

    // Verificar que la operación existe
    const operacion = await prisma.operacion.findUnique({
      where: { id: validatedMetadata.operacionId },
      include: {
        lineas: {
          include: {
            tipoPallet: true,
          },
        },
      },
    })

    if (!operacion) {
      return NextResponse.json(
        { success: false, error: 'Operación no encontrada' },
        { status: 404 }
      )
    }

    // Validar archivo
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    validateFile(file.name, file.type, fileBuffer.length)

    // Subir archivo al storage
    const storage = getStorageProvider()
    const uploadResult = await storage.uploadDocument(fileBuffer, file.name, file.type)

    // Guardar metadata en BD
    const documento = await prisma.documento.create({
      data: {
        operacionId: validatedMetadata.operacionId,
        tipo: validatedMetadata.tipo,
        numeroDocumento: validatedMetadata.numeroDocumento,
        fechaDocumento: validatedMetadata.fechaDocumento
          ? new Date(validatedMetadata.fechaDocumento)
          : null,
        archivoUrl: uploadResult.url,
        archivoNombre: uploadResult.filename,
        archivoTipo: uploadResult.contentType,
        archivoSize: uploadResult.size,
        esObligatorio: validatedMetadata.esObligatorio,
        observaciones: validatedMetadata.observaciones,
        choferNombre: validatedMetadata.choferNombre,
        choferRut: validatedMetadata.choferRut,
        vehiculoPatente: validatedMetadata.vehiculoPatente,
        transportista: validatedMetadata.transportista,
        cantidadDocumento: validatedMetadata.cantidadDocumento,
        cantidadDanada: validatedMetadata.cantidadDanada,
      },
    })

    // Actualizar estado documental de la operación
    const documentosObligatorios = obtenerDocumentosObligatorios(
      operacion.tipo,
      operacion.lineas
    )
    const todosDocumentos = await prisma.documento.findMany({
      where: { operacionId: validatedMetadata.operacionId },
    })
    const nuevoEstado = calcularEstadoDocumental(documentosObligatorios, todosDocumentos)

    await prisma.operacion.update({
      where: { id: validatedMetadata.operacionId },
      data: { estadoDocumental: nuevoEstado },
    })

    return NextResponse.json(
      {
        success: true,
        data: documento,
        message: 'Documento subido correctamente',
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos de entrada inválidos',
          issues: error.issues,
        },
        { status: 400 }
      )
    }

    if (error instanceof StorageError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: 400 }
      )
    }

    console.error('Error al subir documento:', error)
    return NextResponse.json(
      { success: false, error: 'Error al subir documento' },
      { status: 500 }
    )
  }
}





