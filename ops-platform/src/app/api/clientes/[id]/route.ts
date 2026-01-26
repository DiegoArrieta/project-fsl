import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { clienteSchema } from '@/lib/validations/contacto'
import { z } from 'zod'

/**
 * GET /api/clientes/[id]
 * Obtener cliente por ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        _count: {
          select: { operaciones: true },
        },
        operaciones: {
          take: 5,
          orderBy: { fecha: 'desc' },
          select: {
            id: true,
            numero: true,
            fecha: true,
            tipo: true,
            estadoDocumental: true,
            estadoFinanciero: true,
          },
        },
      },
    })

    if (!cliente) {
      return NextResponse.json(
        { success: false, error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // Calcular estadísticas
    const operacionesAbiertas = await prisma.operacion.count({
      where: {
        clienteId: id,
        estadoFinanciero: { not: 'CERRADA' },
      },
    })

    const ultimaOperacion = cliente.operaciones[0]?.fecha || null

    return NextResponse.json({
      success: true,
      data: {
        id: cliente.id,
        rut: cliente.rut,
        razonSocial: cliente.razonSocial,
        nombreFantasia: cliente.nombreFantasia,
        direccion: cliente.direccion,
        comuna: cliente.comuna,
        ciudad: cliente.ciudad,
        telefono: cliente.telefono,
        email: cliente.email,
        activo: cliente.activo,
        createdAt: cliente.createdAt,
        updatedAt: cliente.updatedAt,
        estadisticas: {
          totalOperaciones: cliente._count.operaciones,
          operacionesAbiertas,
          ultimaOperacion: ultimaOperacion ? ultimaOperacion.toISOString().split('T')[0] : null,
        },
        ultimasOperaciones: cliente.operaciones,
      },
    })
  } catch (error) {
    console.error('Error al obtener cliente:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener cliente' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/clientes/[id]
 * Actualizar cliente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = clienteSchema.parse(body)

    // Verificar que el cliente exista
    const existingCliente = await prisma.cliente.findUnique({
      where: { id },
    })

    if (!existingCliente) {
      return NextResponse.json(
        { success: false, error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el RUT no esté en uso por otro cliente
    if (validatedData.rut !== existingCliente.rut) {
      const rutExists = await prisma.cliente.findUnique({
        where: { rut: validatedData.rut },
      })

      if (rutExists) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un cliente con este RUT' },
          { status: 409 }
        )
      }
    }

    // Actualizar cliente
    const cliente = await prisma.cliente.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: cliente.id,
        rut: cliente.rut,
        razonSocial: cliente.razonSocial,
        message: 'Cliente actualizado correctamente',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error al actualizar cliente:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar cliente' },
      { status: 500 }
    )
  }
}

