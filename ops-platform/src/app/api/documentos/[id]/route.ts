import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { updateDocumentoSchema } from '@/lib/validations/documento'
import { getStorageProvider } from '@/lib/storage'
import { obtenerDocumentosObligatorios, calcularEstadoDocumental } from '@/lib/operaciones/documentos'

/**
 * GET /api/documentos/[id]
 * Obtiene un documento por ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const documento = await prisma.documento.findUnique({
      where: { id },
      include: {
        operacion: true,
      },
    })

    if (!documento) {
      return NextResponse.json(
        { success: false, error: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: documento,
    })
  } catch (error) {
    console.error('Error al obtener documento:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener documento' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/documentos/[id]
 * Actualiza metadata de un documento (no el archivo)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Verificar que el documento existe
    const documentoExistente = await prisma.documento.findUnique({
      where: { id },
    })

    if (!documentoExistente) {
      return NextResponse.json(
        { success: false, error: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    // Validar datos de entrada
    const validatedData = updateDocumentoSchema.parse(body)

    // Actualizar documento
    const updateData: any = {}

    if (validatedData.tipo) updateData.tipo = validatedData.tipo
    if (validatedData.numeroDocumento !== undefined)
      updateData.numeroDocumento = validatedData.numeroDocumento
    if (validatedData.fechaDocumento !== undefined) {
      updateData.fechaDocumento = validatedData.fechaDocumento
        ? new Date(validatedData.fechaDocumento)
        : null
    }
    if (validatedData.observaciones !== undefined)
      updateData.observaciones = validatedData.observaciones
    if (validatedData.esObligatorio !== undefined)
      updateData.esObligatorio = validatedData.esObligatorio
    if (validatedData.choferNombre !== undefined)
      updateData.choferNombre = validatedData.choferNombre
    if (validatedData.choferRut !== undefined) updateData.choferRut = validatedData.choferRut
    if (validatedData.vehiculoPatente !== undefined)
      updateData.vehiculoPatente = validatedData.vehiculoPatente
    if (validatedData.transportista !== undefined)
      updateData.transportista = validatedData.transportista
    if (validatedData.cantidadDocumento !== undefined)
      updateData.cantidadDocumento = validatedData.cantidadDocumento
    if (validatedData.cantidadDanada !== undefined)
      updateData.cantidadDanada = validatedData.cantidadDanada

    const documento = await prisma.documento.update({
      where: { id },
      data: updateData,
    })

    // Recalcular estado documental de la operación
    const operacion = await prisma.operacion.findUnique({
      where: { id: documentoExistente.operacionId },
      include: {
        lineas: {
          include: {
            tipoPallet: true,
          },
        },
      },
    })

    if (operacion) {
      const documentosObligatorios = obtenerDocumentosObligatorios(operacion.tipo, operacion.lineas)
      const todosDocumentos = await prisma.documento.findMany({
        where: { operacionId: operacion.id },
      })
      const nuevoEstado = calcularEstadoDocumental(documentosObligatorios, todosDocumentos)

      await prisma.operacion.update({
        where: { id: operacion.id },
        data: { estadoDocumental: nuevoEstado },
      })
    }

    return NextResponse.json({
      success: true,
      data: documento,
      message: 'Documento actualizado correctamente',
    })
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

    console.error('Error al actualizar documento:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar documento' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/documentos/[id]
 * Elimina un documento (archivo y metadata)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar que el documento existe
    const documento = await prisma.documento.findUnique({
      where: { id },
    })

    if (!documento) {
      return NextResponse.json(
        { success: false, error: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar archivo del storage (si tiene key)
    // En mocks, esto no hará nada real
    try {
      const storage = getStorageProvider()
      // Extraer key de la URL (para mocks, usar la URL completa)
      const key = documento.archivoUrl
      await storage.deleteDocument(key)
    } catch (error) {
      console.warn('Error al eliminar archivo del storage (puede ser normal con mocks):', error)
      // Continuar con la eliminación de la metadata
    }

    // Eliminar metadata de BD
    await prisma.documento.delete({
      where: { id },
    })

    // Recalcular estado documental de la operación
    const operacion = await prisma.operacion.findUnique({
      where: { id: documento.operacionId },
      include: {
        lineas: {
          include: {
            tipoPallet: true,
          },
        },
      },
    })

    if (operacion) {
      const documentosObligatorios = obtenerDocumentosObligatorios(operacion.tipo, operacion.lineas)
      const todosDocumentos = await prisma.documento.findMany({
        where: { operacionId: operacion.id },
      })
      const nuevoEstado = calcularEstadoDocumental(documentosObligatorios, todosDocumentos)

      await prisma.operacion.update({
        where: { id: operacion.id },
        data: { estadoDocumental: nuevoEstado },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Documento eliminado correctamente',
    })
  } catch (error) {
    console.error('Error al eliminar documento:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar documento' },
      { status: 500 }
    )
  }
}





