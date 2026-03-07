import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { empresaSchema } from '@/lib/validations/empresa'
import { z } from 'zod'

/**
 * GET /api/empresas/[id]
 * Obtener empresa por ID con estadísticas
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

    const empresa = await prisma.empresa.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            entregas: true,
            entregasReceptoras: true,
            proveedores: true,
            clientes: true,
          },
        },
        proveedores: {
          take: 5,
          select: {
            id: true,
            razonSocial: true,
            activo: true,
          },
        },
        clientes: {
          take: 5,
          select: {
            id: true,
            razonSocial: true,
            activo: true,
          },
        },
      },
    })

    if (!empresa) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 404 }
      )
    }

    // Obtener operaciones asociadas a través de proveedores/clientes
    const operacionesProveedor = await prisma.operacionProveedor.count({
      where: {
        proveedor: {
          empresaId: id,
        },
      },
    })

    const operacionesCliente = await prisma.operacion.count({
      where: {
        cliente: {
          empresaId: id,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: empresa.id,
        nombre: empresa.nombre,
        rut: empresa.rut,
        tipoEmpresa: empresa.tipoEmpresa,
        contacto: empresa.contacto,
        direccion: empresa.direccion,
        telefono: empresa.telefono,
        email: empresa.email,
        estado: empresa.estado,
        createdAt: empresa.createdAt,
        updatedAt: empresa.updatedAt,
        estadisticas: {
          totalEntregas: empresa._count.entregas + empresa._count.entregasReceptoras,
          totalProveedores: empresa._count.proveedores,
          totalClientes: empresa._count.clientes,
          totalOperaciones: operacionesProveedor + operacionesCliente,
        },
        proveedores: empresa.proveedores,
        clientes: empresa.clientes,
      },
    })
  } catch (error) {
    console.error('Error al obtener empresa:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener empresa' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/empresas/[id]
 * Actualizar empresa
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
    const validatedData = empresaSchema.parse(body)

    // Verificar que la empresa exista
    const existingEmpresa = await prisma.empresa.findUnique({
      where: { id },
    })

    if (!existingEmpresa) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el RUT no esté en uso por otra empresa
    if (validatedData.rut !== existingEmpresa.rut) {
      const rutExists = await prisma.empresa.findUnique({
        where: { rut: validatedData.rut },
      })

      if (rutExists) {
        return NextResponse.json(
          { success: false, error: 'Ya existe una empresa con este RUT' },
          { status: 409 }
        )
      }
    }

    // Actualizar empresa
    const empresa = await prisma.empresa.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: empresa.id,
        nombre: empresa.nombre,
        rut: empresa.rut,
        message: 'Empresa actualizada correctamente',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error al actualizar empresa:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar empresa' },
      { status: 500 }
    )
  }
}

