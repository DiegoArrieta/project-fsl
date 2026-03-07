import { PresupuestoEntity } from './presupuesto.entity'
import { PresupuestoLineaEntity } from './presupuesto-linea.entity'
import { EstadoPresupuesto } from '@prisma/client'

/**
 * Interfaz del repositorio de Presupuesto
 * Define el contrato para la persistencia de datos
 */
export interface IPresupuestoRepository {
  /**
   * Crea un nuevo presupuesto con sus líneas
   */
  create(data: {
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
  }): Promise<PresupuestoEntity>

  /**
   * Busca un presupuesto por ID con sus líneas
   */
  findById(id: string): Promise<PresupuestoEntity | null>

  /**
   * Lista presupuestos con filtros y paginación
   */
  findMany(params: {
    page?: number
    pageSize?: number
    clienteId?: string
    estado?: EstadoPresupuesto
    buscar?: string
  }): Promise<{
    data: PresupuestoEntity[]
    total: number
  }>

  /**
   * Actualiza el estado de un presupuesto
   */
  updateEstado(id: string, estado: EstadoPresupuesto): Promise<PresupuestoEntity>

  /**
   * Actualiza un presupuesto completo
   */
  update(
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
  ): Promise<PresupuestoEntity>
}

