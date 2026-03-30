import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { updateEmpresaFactoringSchema } from '@/lib/validations/empresa-factoring'

/**
 * GET /api/empresas-factoring/:id
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
    const row = await prisma.empresaFactoring.findUnique({ where: { id } })
    if (!row) {
      return NextResponse.json({ success: false, error: 'No encontrada' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: row })
  } catch (error) {
    console.error('Error al obtener empresa de factoring:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener registro' }, { status: 500 })
  }
}

/**
 * PUT /api/empresas-factoring/:id
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
    const data = updateEmpresaFactoringSchema.parse(body)

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: 'Sin cambios' }, { status: 400 })
    }

    const existing = await prisma.empresaFactoring.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'No encontrada' }, { status: 404 })
    }

    const patch: Prisma.EmpresaFactoringUpdateInput = {}
    if (data.nombre !== undefined) patch.nombre = data.nombre.trim()
    if (data.rut !== undefined) patch.rut = data.rut?.trim() || null
    if (data.contacto !== undefined) patch.contacto = data.contacto?.trim() || null
    if (data.telefono !== undefined) patch.telefono = data.telefono?.trim() || null
    if (data.email !== undefined) patch.email = data.email?.trim() || null
    if (data.notas !== undefined) patch.notas = data.notas?.trim() || null
    if (data.activo !== undefined) patch.activo = data.activo

    const row = await prisma.empresaFactoring.update({
      where: { id },
      data: patch,
    })

    return NextResponse.json({
      success: true,
      data: row,
      message: 'Empresa de factoring actualizada',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      )
    }
    console.error('Error al actualizar empresa de factoring:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar empresa de factoring' },
      { status: 500 }
    )
  }
}
