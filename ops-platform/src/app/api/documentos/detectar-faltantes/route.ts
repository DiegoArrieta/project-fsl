import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { obtenerDocumentosObligatorios, obtenerDocumentosFaltantes } from '@/lib/operaciones/documentos'

/**
 * POST /api/documentos/detectar-faltantes
 * Actualiza los documentos faltantes para todas las operaciones activas
 * o para una operación específica
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { operacionId } = body

    let operaciones

    if (operacionId) {
      // Procesar solo una operación
      const operacion = await prisma.operacion.findUnique({
        where: { id: operacionId },
        include: {
          lineas: {
            include: {
              tipoPallet: true,
            },
          },
          documentos: true,
        },
      })

      if (!operacion) {
        return NextResponse.json(
          { success: false, error: 'Operación no encontrada' },
          { status: 404 }
        )
      }

      operaciones = [operacion]
    } else {
      // Procesar todas las operaciones que no estén cerradas
      operaciones = await prisma.operacion.findMany({
        where: {
          estadoFinanciero: {
            not: 'CERRADA',
          },
        },
        include: {
          lineas: {
            include: {
              tipoPallet: true,
            },
          },
          documentos: true,
        },
      })
    }

    const resultados = []

    for (const operacion of operaciones) {
      // Obtener documentos obligatorios para esta operación
      const documentosObligatorios = obtenerDocumentosObligatorios(
        operacion.tipo,
        operacion.lineas
      )

      // Obtener documentos faltantes
      const documentosFaltantes = obtenerDocumentosFaltantes(
        documentosObligatorios,
        operacion.documentos
      )

      resultados.push({
        operacionId: operacion.id,
        numero: operacion.numero,
        documentosObligatorios,
        documentosFaltantes,
        estadoActual: operacion.estadoDocumental,
        completa: documentosFaltantes.length === 0,
      })

      // Actualizar estado documental si cambió
      const nuevoEstado = documentosFaltantes.length === 0 ? 'COMPLETA' : 'INCOMPLETA'
      if (nuevoEstado !== operacion.estadoDocumental) {
        await prisma.operacion.update({
          where: { id: operacion.id },
          data: { estadoDocumental: nuevoEstado },
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        operacionesProcesadas: resultados.length,
        resultados,
      },
      message: `Se procesaron ${resultados.length} operación(es)`,
    })
  } catch (error) {
    console.error('Error al detectar documentos faltantes:', error)
    return NextResponse.json(
      { success: false, error: 'Error al detectar documentos faltantes' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/documentos/detectar-faltantes?operacionId=xxx
 * Obtiene los documentos faltantes de una operación sin actualizar el estado
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

    const operacion = await prisma.operacion.findUnique({
      where: { id: operacionId },
      include: {
        lineas: {
          include: {
            tipoPallet: true,
          },
        },
        documentos: true,
      },
    })

    if (!operacion) {
      return NextResponse.json(
        { success: false, error: 'Operación no encontrada' },
        { status: 404 }
      )
    }

    // Obtener documentos obligatorios para esta operación
    const documentosObligatorios = obtenerDocumentosObligatorios(
      operacion.tipo,
      operacion.lineas
    )

    // Obtener documentos faltantes
    const documentosFaltantes = obtenerDocumentosFaltantes(
      documentosObligatorios,
      operacion.documentos
    )

    return NextResponse.json({
      success: true,
      data: {
        operacionId: operacion.id,
        numero: operacion.numero,
        documentosObligatorios,
        documentosFaltantes,
        estadoDocumental: operacion.estadoDocumental,
        completa: documentosFaltantes.length === 0,
      },
    })
  } catch (error) {
    console.error('Error al obtener documentos faltantes:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener documentos faltantes' },
      { status: 500 }
    )
  }
}




