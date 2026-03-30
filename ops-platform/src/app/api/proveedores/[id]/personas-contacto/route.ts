import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { personaContactoSchema } from '@/lib/validations/persona-contacto'
import { serializePersonaContacto } from '@/lib/personas-contacto/serialize'
import { z } from 'zod'

/**
 * GET /api/proveedores/[id]/personas-contacto
 * POST /api/proveedores/[id]/personas-contacto
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

    const proveedor = await prisma.proveedor.findUnique({ where: { id }, select: { id: true } })
    if (!proveedor) {
      return NextResponse.json({ success: false, error: 'Proveedor no encontrado' }, { status: 404 })
    }

    const rows = await prisma.contactoPersona.findMany({
      where: { proveedorId: id },
      orderBy: [{ esPrincipal: 'desc' }, { nombre: 'asc' }],
    })

    return NextResponse.json({
      success: true,
      data: rows.map(serializePersonaContacto),
    })
  } catch (error) {
    console.error('Error al listar personas de contacto:', error)
    return NextResponse.json(
      { success: false, error: 'Error al listar personas de contacto' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const proveedor = await prisma.proveedor.findUnique({ where: { id }, select: { id: true } })
    if (!proveedor) {
      return NextResponse.json({ success: false, error: 'Proveedor no encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = personaContactoSchema.parse(body)
    const email = parsed.email === '' || parsed.email === undefined ? null : parsed.email

    const created = await prisma.$transaction(async (tx) => {
      if (parsed.esPrincipal) {
        await tx.contactoPersona.updateMany({
          where: { proveedorId: id, esPrincipal: true },
          data: { esPrincipal: false },
        })
      }

      return tx.contactoPersona.create({
        data: {
          proveedorId: id,
          clienteId: null,
          nombre: parsed.nombre,
          cargo: parsed.cargo ?? null,
          email,
          telefono: parsed.telefono ?? null,
          esPrincipal: parsed.esPrincipal ?? false,
          notas: parsed.notas ?? null,
        },
      })
    })

    return NextResponse.json(
      {
        success: true,
        data: serializePersonaContacto(created),
        message: 'Persona de contacto creada',
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      )
    }
    console.error('Error al crear persona de contacto:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear persona de contacto' },
      { status: 500 }
    )
  }
}
