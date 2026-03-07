import { prisma } from '@/lib/db'
import { TipoSecuencia, Prisma, PrismaClient } from '@prisma/client'

/**
 * Servicio de dominio para generar números secuenciales de documentos
 * Utiliza transacciones atómicas para evitar race conditions
 */
export class SequenceService {
  /**
   * Genera el siguiente número de documento según el tipo
   * Formato: PR-YYYY-NNNNN, OP-YYYY-NNNNN, OC-YYYY-NNNNN
   */
  static async getNextSequence(
    tipo: TipoSecuencia,
    txClient?: Prisma.TransactionClient
  ): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = this.getPrefix(tipo)

    const executeUpsert = async (client: Prisma.TransactionClient | PrismaClient) => {
      return await client.documentSequence.upsert({
        where: {
          tipo_year: {
            tipo,
            year,
          },
        },
        update: {
          lastValue: {
            increment: 1,
          },
        },
        create: {
          tipo,
          year,
          lastValue: 1,
        },
      })
    }

    // Si ya viene un cliente de transacción, lo usamos directamente
    // Si no, creamos una nueva transacción para asegurar atomicidad
    const sequence = txClient 
      ? await executeUpsert(txClient)
      : await prisma.$transaction(async (tx) => await executeUpsert(tx))

    // Formatear número final
    const numero = sequence.lastValue.toString().padStart(5, '0')
    return `${prefix}-${year}-${numero}`
  }

  /**
   * Obtiene el prefijo según el tipo de secuencia
   */
  private static getPrefix(tipo: TipoSecuencia): string {
    switch (tipo) {
      case 'PRESUPUESTO':
        return 'PR'
      case 'OPERACION':
        return 'OP'
      case 'ORDEN_COMPRA':
        return 'OC'
      default:
        throw new Error(`Tipo de secuencia no válido: ${tipo}`)
    }
  }
}

