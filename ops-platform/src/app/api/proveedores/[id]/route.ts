import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { proveedorSchema } from '@/lib/validations/contacto'
import { z } from 'zod'

/**
 * GET /api/proveedores/[id]
 * Obtener proveedor por ID
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

    const proveedor = await prisma.proveedor.findUnique({
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

    if (!proveedor) {
      return NextResponse.json(
        { success: false, error: 'Proveedor no encontrado' },
        { status: 404 }
      )
    }

    // Calcular estadísticas
    const operacionesAbiertas = await prisma.operacion.count({
      where: {
        proveedorId: id,
        estadoFinanciero: { not: 'CERRADA' },
      },
    })

    const ultimaOperacion = proveedor.operaciones[0]?.fecha || null

    return NextResponse.json({
      success: true,
      data: {
        id: proveedor.id,
        rut: proveedor.rut,
        razonSocial: proveedor.razonSocial,
        nombreFantasia: proveedor.nombreFantasia,
        direccion: proveedor.direccion,
        comuna: proveedor.comuna,
        ciudad: proveedor.ciudad,
        telefono: proveedor.telefono,
        email: proveedor.email,
        activo: proveedor.activo,
        createdAt: proveedor.createdAt,
        updatedAt: proveedor.updatedAt,
        estadisticas: {
          totalOperaciones: proveedor._count.operaciones,
          operacionesAbiertas,
          ultimaOperacion: ultimaOperacion ? ultimaOperacion.toISOString().split('T')[0] : null,
        },
        ultimasOperaciones: proveedor.operaciones,
      },
    })
  } catch (error) {
    console.error('Error al obtener proveedor:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener proveedor' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/proveedores/[id]
 * Actualizar proveedor
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
    const validatedData = proveedorSchema.parse(body)

    // Verificar que el proveedor exista
    const existingProveedor = await prisma.proveedor.findUnique({
      where: { id },
    })

    if (!existingProveedor) {
      return NextResponse.json(
        { success: false, error: 'Proveedor no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el RUT no esté en uso por otro proveedor
    if (validatedData.rut !== existingProveedor.rut) {
      const rutExists = await prisma.proveedor.findUnique({
        where: { rut: validatedData.rut },
      })

      if (rutExists) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un proveedor con este RUT' },
          { status: 409 }
        )
      }
    }

    // Actualizar proveedor
    const proveedor = await prisma.proveedor.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: proveedor.id,
        rut: proveedor.rut,
        razonSocial: proveedor.razonSocial,
        message: 'Proveedor actualizado correctamente',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error al actualizar proveedor:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar proveedor' },
      { status: 500 }
    )
  }
}

