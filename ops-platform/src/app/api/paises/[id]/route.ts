import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { updatePaisSchema } from '@/lib/validations/pais'

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
    const row = await prisma.pais.findUnique({ where: { id } })
    if (!row) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: row })
  } catch (error) {
    console.error('Error al obtener país:', error)
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
    const data = updatePaisSchema.parse(body)

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: 'Sin cambios' }, { status: 400 })
    }

    const existing = await prisma.pais.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 })
    }

    const patch: Prisma.PaisUpdateInput = {}
    if (data.codigoIso !== undefined) patch.codigoIso = data.codigoIso
    if (data.nombre !== undefined) patch.nombre = data.nombre.trim()
    if (data.activo !== undefined) patch.activo = data.activo

    const row = await prisma.pais.update({
      where: { id },
      data: patch,
    })

    return NextResponse.json({ success: true, data: row, message: 'País actualizado' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      )
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Ya existe un país con ese código ISO' },
        { status: 409 }
      )
    }
    console.error('Error al actualizar país:', error)
    return NextResponse.json({ success: false, error: 'Error al actualizar país' }, { status: 500 })
  }
}
