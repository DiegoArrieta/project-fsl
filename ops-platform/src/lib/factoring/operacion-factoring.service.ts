import { prisma } from '@/lib/db'
import type { CreateFactoringInput, UpdateFactoringInput } from '@/lib/validations/factoring'

function esOperacionVenta(tipo: string): boolean {
  return String(tipo).startsWith('VENTA_')
}

export async function crearFactoringOperacion(operacionId: string, data: CreateFactoringInput) {
  const operacion = await prisma.operacion.findUnique({
    where: { id: operacionId },
    include: { factoring: true },
  })

  if (!operacion) {
    return { ok: false, error: 'Operación no encontrada', status: 404 }
  }

  if (!esOperacionVenta(operacion.tipo)) {
    return { ok: false, error: 'El factoring solo aplica a operaciones de venta', status: 400 }
  }

  if (operacion.estadoFinanciero === 'CERRADA') {
    return {
      ok: false,
      error: 'No se puede registrar factoring en una operación cerrada',
      status: 400,
    }
  }

  if (operacion.factoring) {
    return { ok: false, error: 'Esta operación ya tiene factoring registrado', status: 409 }
  }

  const empresaF = await prisma.empresaFactoring.findUnique({
    where: { id: data.empresaFactoringId },
  })
  if (!empresaF || !empresaF.activo) {
    return {
      ok: false,
      error: 'Empresa de factoring no existe o está inactiva',
      status: 400,
    }
  }

  const factoring = await prisma.factoring.create({
    data: {
      operacionId,
      empresaFactoringId: data.empresaFactoringId,
      fechaFactoring: new Date(data.fechaFactoring),
      montoFactura: data.montoFactura,
      montoAdelantado: data.montoAdelantado,
      comisionFactoring: data.comisionFactoring ?? null,
      fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : null,
      observaciones: data.observaciones?.trim() || null,
    },
    include: { empresaFactoring: true },
  })

  return { ok: true, data: factoring }
}

export async function actualizarFactoringOperacion(operacionId: string, data: UpdateFactoringInput) {
  const operacion = await prisma.operacion.findUnique({
    where: { id: operacionId },
    include: { factoring: true },
  })

  if (!operacion?.factoring) {
    return { ok: false, error: 'No existe factoring para esta operación', status: 404 }
  }

  if (operacion.estadoFinanciero === 'CERRADA') {
    return {
      ok: false,
      error: 'No se puede editar factoring en una operación cerrada',
      status: 400,
    }
  }

  const patch: {
    empresaFactoringId?: string
    fechaFactoring?: Date
    montoFactura?: number
    montoAdelantado?: number
    comisionFactoring?: number | null
    fechaVencimiento?: Date | null
    observaciones?: string | null
  } = {}

  if (data.empresaFactoringId !== undefined) {
    const empresaF = await prisma.empresaFactoring.findUnique({
      where: { id: data.empresaFactoringId },
    })
    if (!empresaF || !empresaF.activo) {
      return {
        ok: false,
        error: 'Empresa de factoring no existe o está inactiva',
        status: 400,
      }
    }
    patch.empresaFactoringId = data.empresaFactoringId
  }
  if (data.fechaFactoring !== undefined) {
    patch.fechaFactoring = new Date(data.fechaFactoring)
  }
  if (data.montoFactura !== undefined) {
    patch.montoFactura = data.montoFactura
  }
  if (data.montoAdelantado !== undefined) {
    patch.montoAdelantado = data.montoAdelantado
  }
  if (data.comisionFactoring !== undefined) {
    patch.comisionFactoring = data.comisionFactoring
  }
  if (data.fechaVencimiento !== undefined) {
    patch.fechaVencimiento = data.fechaVencimiento ? new Date(data.fechaVencimiento) : null
  }
  if (data.observaciones !== undefined) {
    patch.observaciones = data.observaciones?.trim() || null
  }

  const factoring = await prisma.factoring.update({
    where: { operacionId },
    data: patch,
    include: { empresaFactoring: true },
  })

  return { ok: true, data: factoring }
}
