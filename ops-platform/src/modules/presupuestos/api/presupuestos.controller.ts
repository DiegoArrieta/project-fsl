import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PresupuestoRepository } from '../infrastructure/presupuesto.repository'
import { CreatePresupuestoUseCase } from '../application/create-presupuesto.usecase'
import { ListarPresupuestosUseCase } from '../application/listar-presupuestos.usecase'
import { ObtenerPresupuestoUseCase } from '../application/obtener-presupuesto.usecase'
import { AceptarPresupuestoUseCase } from '../application/aceptar-presupuesto.usecase'
import { ActualizarPresupuestoUseCase } from '../application/actualizar-presupuesto.usecase'
import { createPresupuestoSchema, updatePresupuestoSchema } from '../dto/create-presupuesto.dto'
import { PDFService } from '../infrastructure/pdf.service'

/**
 * Controlador de Presupuestos
 * Adaptador para Next.js que recibe requests y delega a UseCases
 */
export class PresupuestosController {
  private repository: PresupuestoRepository
  private createUseCase: CreatePresupuestoUseCase
  private listarUseCase: ListarPresupuestosUseCase
  private obtenerUseCase: ObtenerPresupuestoUseCase
  private aceptarUseCase: AceptarPresupuestoUseCase
  private actualizarUseCase: ActualizarPresupuestoUseCase

  constructor() {
    this.repository = new PresupuestoRepository()
    this.createUseCase = new CreatePresupuestoUseCase(this.repository)
    this.listarUseCase = new ListarPresupuestosUseCase(this.repository)
    this.obtenerUseCase = new ObtenerPresupuestoUseCase(this.repository)
    this.aceptarUseCase = new AceptarPresupuestoUseCase(this.repository)
    this.actualizarUseCase = new ActualizarPresupuestoUseCase(this.repository)
  }

  /**
   * POST /api/presupuestos
   * Crea un nuevo presupuesto
   */
  async create(request: NextRequest): Promise<NextResponse> {
    try {
      const session = await auth()
      if (!session) {
        return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
      }

      const body = await request.json()
      const validatedData = createPresupuestoSchema.parse(body)

      const presupuesto = await this.createUseCase.execute(validatedData)

      return NextResponse.json(
        {
          success: true,
          data: this.mapToResponse(presupuesto),
          message: 'Presupuesto creado correctamente',
        },
        { status: 201 }
      )
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return NextResponse.json(
          {
            success: false,
            error: 'Datos de entrada inválidos',
            issues: error.issues,
          },
          { status: 400 }
        )
      }

      console.error('Error al crear presupuesto:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Error al crear presupuesto' },
        { status: 500 }
      )
    }
  }

  /**
   * GET /api/presupuestos
   * Lista presupuestos con filtros y paginación
   */
  async list(request: NextRequest): Promise<NextResponse> {
    try {
      const session = await auth()
      if (!session) {
        return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
      }

      const searchParams = request.nextUrl.searchParams
      const page = parseInt(searchParams.get('page') || '1', 10)
      const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)
      const clienteId = searchParams.get('clienteId')
      const estado = searchParams.get('estado') as any
      const buscar = searchParams.get('buscar')

      const result = await this.listarUseCase.execute({
        page,
        pageSize,
        clienteId: clienteId || undefined,
        estado: estado || undefined,
        buscar: buscar || undefined,
      })

      return NextResponse.json({
        success: true,
        data: result.data.map((p) => this.mapToResponse(p)),
        meta: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
        },
      })
    } catch (error: any) {
      console.error('Error al listar presupuestos:', error)
      return NextResponse.json(
        { success: false, error: 'Error al listar presupuestos' },
        { status: 500 }
      )
    }
  }

  /**
   * GET /api/presupuestos/:id
   * Obtiene un presupuesto por ID
   */
  async getById(id: string): Promise<NextResponse> {
    try {
      const session = await auth()
      if (!session) {
        return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
      }

      const presupuesto = await this.obtenerUseCase.execute(id)

      return NextResponse.json({
        success: true,
        data: this.mapToResponse(presupuesto),
      })
    } catch (error: any) {
      if (error.message === 'Presupuesto no encontrado') {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 404 }
        )
      }

      console.error('Error al obtener presupuesto:', error)
      return NextResponse.json(
        { success: false, error: 'Error al obtener presupuesto' },
        { status: 500 }
      )
    }
  }

  /**
   * PUT /api/presupuestos/:id
   * Actualiza un presupuesto
   */
  async update(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const session = await auth()
      if (!session) {
        return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
      }

      const body = await request.json()
      const validatedData = updatePresupuestoSchema.parse(body)

      const presupuesto = await this.actualizarUseCase.execute(id, validatedData)

      return NextResponse.json({
        success: true,
        data: this.mapToResponse(presupuesto),
        message: 'Presupuesto actualizado correctamente',
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return NextResponse.json(
          {
            success: false,
            error: 'Datos de entrada inválidos',
            issues: error.issues,
          },
          { status: 400 }
        )
      }

      if (error.message?.includes('no puede ser editado')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        )
      }

      console.error('Error al actualizar presupuesto:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Error al actualizar presupuesto' },
        { status: 500 }
      )
    }
  }

  /**
   * POST /api/presupuestos/:id/aceptar
   * Acepta un presupuesto y crea una operación
   */
  async aceptar(id: string): Promise<NextResponse> {
    try {
      const session = await auth()
      if (!session) {
        return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
      }

      const result = await this.aceptarUseCase.execute(id)

      return NextResponse.json({
        success: true,
        data: {
          presupuesto: this.mapToResponse(result.presupuesto),
          operacionId: result.operacionId,
        },
        message: 'Presupuesto aceptado y operación creada correctamente',
      })
    } catch (error: any) {
      if (error.message?.includes('no puede ser aceptado')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        )
      }

      console.error('Error al aceptar presupuesto:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Error al aceptar presupuesto' },
        { status: 500 }
      )
    }
  }

  /**
   * GET /api/presupuestos/:id/pdf
   * Genera el PDF del presupuesto
   */
  async generatePDF(id: string): Promise<NextResponse> {
    try {
      const session = await auth()
      if (!session) {
        return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
      }

      const pdfBuffer = await PDFService.generatePresupuestoPDF(id)

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="presupuesto-${id}.pdf"`,
        },
      })
    } catch (error: any) {
      console.error('Error al generar PDF:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Error al generar PDF' },
        { status: 500 }
      )
    }
  }

  /**
   * Mapea una entidad de dominio a formato de respuesta
   */
  private mapToResponse(presupuesto: any): any {
    return {
      id: presupuesto.id,
      numero: presupuesto.numero,
      clienteId: presupuesto.clienteId,
      fecha: presupuesto.fecha,
      ciudad: presupuesto.ciudad,
      direccion: presupuesto.direccion,
      observaciones: presupuesto.observaciones,
      subtotal: presupuesto.subtotal.toNumber(),
      iva: presupuesto.iva.toNumber(),
      total: presupuesto.total.toNumber(),
      estado: presupuesto.estado,
      lineas: presupuesto.lineas.map((linea: any) => ({
        id: linea.id,
        tipoPalletId: linea.tipoPalletId,
        cantidad: linea.cantidad,
        precioUnitario: linea.precioUnitario.toNumber(),
        descripcion: linea.descripcion,
      })),
      createdAt: presupuesto.createdAt,
      updatedAt: presupuesto.updatedAt,
    }
  }
}

