import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generarTodasLasAlertas } from '@/lib/dashboard/alertas'
import { obtenerDocumentosObligatorios, obtenerDocumentosFaltantes } from '@/lib/operaciones/documentos'

/**
 * GET /api/dashboard/alertas
 * Obtiene todas las alertas del sistema
 */
export async function GET() {
  try {
    // Obtener operaciones abiertas (no cerradas)
    const operaciones = await prisma.operacion.findMany({
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
        proveedores: {
          include: {
            proveedor: {
              select: {
                razonSocial: true,
              },
            },
          },
        },
        cliente: {
          select: {
            razonSocial: true,
          },
        },
      },
      orderBy: {
        fecha: 'asc',
      },
    })

    // Calcular documentos faltantes por operación
    const documentosFaltantes = operaciones.map((operacion) => {
      const documentosObligatorios = obtenerDocumentosObligatorios(
        operacion.tipo,
        operacion.lineas
      )
      const faltantes = obtenerDocumentosFaltantes(documentosObligatorios, operacion.documentos)

      return {
        operacionId: operacion.id,
        operacionNumero: operacion.numero,
        documentosObligatorios,
        documentosFaltantes: faltantes,
      }
    }).filter((doc) => doc.documentosFaltantes.length > 0)

    // Generar todas las alertas
    const alertas = generarTodasLasAlertas(operaciones, documentosFaltantes)

    // Agrupar por prioridad
    const porPrioridad = {
      alta: alertas.filter((a) => a.prioridad === 'ALTA'),
      media: alertas.filter((a) => a.prioridad === 'MEDIA'),
      baja: alertas.filter((a) => a.prioridad === 'BAJA'),
    }

    // Agrupar por tipo
    const porTipo = {
      documentosIncompletos: alertas.filter((a) => a.tipo === 'DOCUMENTOS_INCOMPLETOS'),
      pagoPendiente: alertas.filter((a) => a.tipo === 'PAGO_PENDIENTE'),
      facturadasSinPagar: alertas.filter((a) => a.tipo === 'FACTURADA_SIN_PAGAR'),
      operacionesAntiguas: alertas.filter((a) => a.tipo === 'OPERACION_ANTIGUA'),
    }

    return NextResponse.json({
      success: true,
      data: {
        total: alertas.length,
        alertas,
        porPrioridad: {
          alta: porPrioridad.alta.length,
          media: porPrioridad.media.length,
          baja: porPrioridad.baja.length,
        },
        porTipo: {
          documentosIncompletos: porTipo.documentosIncompletos.length,
          pagoPendiente: porTipo.pagoPendiente.length,
          facturadasSinPagar: porTipo.facturadasSinPagar.length,
          operacionesAntiguas: porTipo.operacionesAntiguas.length,
        },
        detalle: {
          porPrioridad,
          porTipo,
        },
      },
    })
  } catch (error) {
    console.error('Error al obtener alertas:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener alertas' }, { status: 500 })
  }
}





