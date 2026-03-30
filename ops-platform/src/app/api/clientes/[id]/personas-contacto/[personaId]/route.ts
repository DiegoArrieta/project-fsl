import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { personaContactoSchema } from '@/lib/validations/persona-contacto'
import { serializePersonaContacto } from '@/lib/personas-contacto/serialize'
import { z } from 'zod'

/**
 * GET /api/clientes/[id]/personas-contacto/[personaId]
 * PUT /api/clientes/[id]/personas-contacto/[personaId]
 * DELETE /api/clientes/[id]/personas-contacto/[personaId]
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; personaId: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id, personaId } = await params

    const row = await prisma.contactoPersona.findFirst({
      where: { id: personaId, clienteId: id },
    })

    if (!row) {
      return NextResponse.json({ success: false, error: 'Persona de contacto no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: serializePersonaContacto(row) })
  } catch (error) {
    console.error('Error al obtener persona de contacto:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener persona de contacto' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; personaId: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id, personaId } = await params

    const existing = await prisma.contactoPersona.findFirst({
      where: { id: personaId, clienteId: id },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Persona de contacto no encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = personaContactoSchema.parse(body)
    const email = parsed.email === '' || parsed.email === undefined ? null : parsed.email

    const updated = await prisma.$transaction(async (tx) => {
      if (parsed.esPrincipal) {
        await tx.contactoPersona.updateMany({
          where: { clienteId: id, esPrincipal: true, id: { not: personaId } },
          data: { esPrincipal: false },
        })
      }

      return tx.contactoPersona.update({
        where: { id: personaId },
        data: {
          nombre: parsed.nombre,
          cargo: parsed.cargo ?? null,
          email,
          telefono: parsed.telefono ?? null,
          esPrincipal: parsed.esPrincipal ?? false,
          notas: parsed.notas ?? null,
        },
      })
    })

    return NextResponse.json({
      success: true,
      data: serializePersonaContacto(updated),
      message: 'Persona de contacto actualizada',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', issues: error.issues },
        { status: 400 }
      )
    }
    console.error('Error al actualizar persona de contacto:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar persona de contacto' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; personaId: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { id, personaId } = await params

    const existing = await prisma.contactoPersona.findFirst({
      where: { id: personaId, clienteId: id },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Persona de contacto no encontrada' }, { status: 404 })
    }

    await prisma.contactoPersona.delete({ where: { id: personaId } })

    return NextResponse.json({ success: true, message: 'Persona de contacto eliminada' })
  } catch (error) {
    console.error('Error al eliminar persona de contacto:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar persona de contacto' },
      { status: 500 }
    )
  }
}
