import { prisma } from '@/lib/db'
import { Prisma, EstadoPresupuesto } from '@prisma/client'
import { IPresupuestoRepository } from '../domain/presupuesto.repository.interface'
import { PresupuestoEntity } from '../domain/presupuesto.entity'
import { PresupuestoLineaEntity } from '../domain/presupuesto-linea.entity'

/**
 * Implementación del repositorio de Presupuesto usando Prisma
 */
export class PresupuestoRepository implements IPresupuestoRepository {
  async create(data: {
    numero: string
    clienteId: string
    fecha: Date
    ciudad?: string | null
    direccion?: string | null
    observaciones?: string | null
    subtotal: number
    iva: number
    total: number
    estado: EstadoPresupuesto
    lineas: Array<{
      tipoPalletId: string
      cantidad: number
      precioUnitario: number
      descripcion?: string | null
    }>
  }): Promise<PresupuestoEntity> {
    const presupuesto = await prisma.presupuesto.create({
      data: {
        numero: data.numero,
        clienteId: data.clienteId,
        fecha: data.fecha,
        ciudad: data.ciudad,
        direccion: data.direccion,
        observaciones: data.observaciones,
        subtotal: new Prisma.Decimal(data.subtotal),
        iva: new Prisma.Decimal(data.iva),
        total: new Prisma.Decimal(data.total),
        estado: data.estado,
        lineas: {
          create: data.lineas.map((linea) => ({
            tipoPalletId: linea.tipoPalletId,
            cantidad: linea.cantidad,
            precioUnitario: new Prisma.Decimal(linea.precioUnitario),
            descripcion: linea.descripcion,
          })),
        },
      },
      include: {
        lineas: {
          include: {
            tipoPallet: true,
          },
        },
      },
    })

    return this.mapToEntity(presupuesto)
  }

  async findById(id: string): Promise<PresupuestoEntity | null> {
    const presupuesto = await prisma.presupuesto.findUnique({
      where: { id },
      include: {
        lineas: {
          include: {
            tipoPallet: true,
          },
        },
      },
    })

    if (!presupuesto) {
      return null
    }

    return this.mapToEntity(presupuesto)
  }

  async findMany(params: {
    page?: number
    pageSize?: number
    clienteId?: string
    estado?: EstadoPresupuesto
    buscar?: string
  }): Promise<{ data: PresupuestoEntity[]; total: number }> {
    const page = params.page || 1
    const pageSize = params.pageSize || 20
    const skip = (page - 1) * pageSize

    const where: any = {}

    if (params.clienteId) {
      where.clienteId = params.clienteId
    }

    if (params.estado) {
      where.estado = params.estado
    }

    if (params.buscar) {
      where.OR = [
        { numero: { contains: params.buscar, mode: 'insensitive' } },
        { cliente: { razonSocial: { contains: params.buscar, mode: 'insensitive' } } },
      ]
    }

    const [presupuestos, total] = await Promise.all([
      prisma.presupuesto.findMany({
        where,
        include: {
          lineas: {
            include: {
              tipoPallet: true,
            },
          },
        },
        orderBy: {
          fecha: 'desc',
        },
        skip,
        take: pageSize,
      }),
      prisma.presupuesto.count({ where }),
    ])

    return {
      data: presupuestos.map((p) => this.mapToEntity(p)),
      total,
    }
  }

  async updateEstado(id: string, estado: EstadoPresupuesto): Promise<PresupuestoEntity> {
    const presupuesto = await prisma.presupuesto.update({
      where: { id },
      data: { estado },
      include: {
        lineas: {
          include: {
            tipoPallet: true,
          },
        },
      },
    })

    return this.mapToEntity(presupuesto)
  }

  async update(
    id: string,
    data: {
      fecha?: Date
      ciudad?: string | null
      direccion?: string | null
      observaciones?: string | null
      subtotal?: number
      iva?: number
      total?: number
      estado?: EstadoPresupuesto
      lineas?: Array<{
        id?: string
        tipoPalletId: string
        cantidad: number
        precioUnitario: number
        descripcion?: string | null
      }>
    }
  ): Promise<PresupuestoEntity> {
    // Si hay líneas, eliminar las existentes y crear nuevas
    if (data.lineas) {
      await prisma.presupuestoLinea.deleteMany({
        where: { presupuestoId: id },
      })
    }

    const updateData: any = {}

    if (data.fecha !== undefined) updateData.fecha = data.fecha
    if (data.ciudad !== undefined) updateData.ciudad = data.ciudad
    if (data.direccion !== undefined) updateData.direccion = data.direccion
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones
    if (data.subtotal !== undefined) updateData.subtotal = new Prisma.Decimal(data.subtotal)
    if (data.iva !== undefined) updateData.iva = new Prisma.Decimal(data.iva)
    if (data.total !== undefined) updateData.total = new Prisma.Decimal(data.total)
    if (data.estado !== undefined) updateData.estado = data.estado

    if (data.lineas) {
      updateData.lineas = {
        create: data.lineas.map((linea) => ({
          tipoPalletId: linea.tipoPalletId,
          cantidad: linea.cantidad,
          precioUnitario: new Prisma.Decimal(linea.precioUnitario),
          descripcion: linea.descripcion,
        })),
      }
    }

    const presupuesto = await prisma.presupuesto.update({
      where: { id },
      data: updateData,
      include: {
        lineas: {
          include: {
            tipoPallet: true,
          },
        },
      },
    })

    return this.mapToEntity(presupuesto)
  }

  async delete(id: string): Promise<void> {
    await prisma.presupuesto.delete({
      where: { id },
    })
  }

  /**
   * Mapea un modelo de Prisma a una entidad de dominio
   */
  private mapToEntity(presupuesto: any): PresupuestoEntity {
    return new PresupuestoEntity(
      presupuesto.id,
      presupuesto.numero,
      presupuesto.clienteId,
      presupuesto.fecha,
      presupuesto.ciudad,
      presupuesto.direccion,
      presupuesto.observaciones,
      presupuesto.subtotal,
      presupuesto.iva,
      presupuesto.total,
      presupuesto.estado,
      presupuesto.lineas.map(
        (linea: any) =>
          new PresupuestoLineaEntity(
            linea.id,
            linea.presupuestoId,
            linea.tipoPalletId,
            linea.cantidad,
            linea.precioUnitario,
            linea.descripcion,
            linea.createdAt
          )
      ),
      presupuesto.createdAt,
      presupuesto.updatedAt
    )
  }
}

