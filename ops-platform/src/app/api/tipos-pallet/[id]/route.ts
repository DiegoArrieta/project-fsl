import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { updateTipoPalletSchema } from '@/lib/validations/tipo-pallet'

const includeTipos = {
  categoria: true,
  paises: { include: { pais: true } },
} as const

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
    const row = await prisma.tipoPallet.findUnique({
      where: { id },
      include: includeTipos,
    })
    if (!row) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: row })
  } catch (error) {
    console.error('Error al obtener tipo de pallet:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener registro' }, { status: 500 })
  }
}

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
    const data = updateTipoPalletSchema.parse(body)

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: 'Sin cambios' }, { status: 400 })
    }

    const existing = await prisma.tipoPallet.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 })
    }

    if (data.categoriaId) {
      const cat = await prisma.categoriaPallet.findFirst({
        where: { id: data.categoriaId, activo: true },
      })
      if (!cat) {
        return NextResponse.json(
          { success: false, error: 'Categoría no válida o inactiva' },
          { status: 400 }
        )
      }
    }

    if (data.paisIds) {
      const paisesCount = await prisma.pais.count({
        where: { id: { in: data.paisIds }, activo: true },
      })
      if (paisesCount !== data.paisIds.length) {
        return NextResponse.json(
          { success: false, error: 'Uno o más países no son válidos' },
          { status: 400 }
        )
      }
    }

    const patch: Prisma.TipoPalletUpdateInput = {}
    if (data.categoriaId !== undefined) patch.categoria = { connect: { id: data.categoriaId } }
    if (data.codigo !== undefined) patch.codigo = data.codigo
    if (data.nombre !== undefined) patch.nombre = data.nombre.trim()
    if (data.descripcion !== undefined) patch.descripcion = data.descripcion?.trim() || null
    if (data.dimensiones !== undefined) patch.dimensiones = data.dimensiones?.trim() || null
    if (data.requiereCertificacion !== undefined) patch.requiereCertificacion = data.requiereCertificacion
    if (data.activo !== undefined) patch.activo = data.activo

    const hasScalarPatch = Object.keys(patch).length > 0
    const row = await prisma.$transaction(async (tx) => {
      if (data.paisIds) {
        await tx.tipoPalletPais.deleteMany({ where: { tipoPalletId: id } })
        await tx.tipoPalletPais.createMany({
          data: data.paisIds.map((paisId) => ({ tipoPalletId: id, paisId })),
        })
      }
      if (hasScalarPatch) {
        return tx.tipoPallet.update({
          where: { id },
          data: patch,
          include: includeTipos,
        })
      }
      return tx.tipoPallet.findUniqueOrThrow({
        where: { id },
        include: includeTipos,
      })
    })

    return NextResponse.json({
      success: true,
      data: row,
      message: 'Tipo de pallet actualizado',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      )
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Ya existe un tipo con ese código en la misma categoría' },
        { status: 409 }
      )
    }
    console.error('Error al actualizar tipo de pallet:', error)
    return NextResponse.json({ success: false, error: 'Error al actualizar tipo de pallet' }, { status: 500 })
  }
}
