export interface AceptarPresupuestoRespuesta {
  success: boolean
  data: {
    presupuesto: unknown
    operacionId: string
  }
  message?: string
}

export async function aceptarPresupuestoPorId(presupuestoId: string): Promise<AceptarPresupuestoRespuesta> {
  const id = presupuestoId.trim()
  if (!id) {
    throw new Error('Falta el identificador del presupuesto')
  }

  const response = await fetch(`/api/presupuestos/${encodeURIComponent(id)}/aceptar`, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })

  const raw = await response.text()
  let parsed: Partial<AceptarPresupuestoRespuesta> & { error?: string } = {}
  if (raw) {
    try {
      parsed = JSON.parse(raw) as typeof parsed
    } catch {
      if (response.status === 404) {
        throw new Error(
          'No se encontró la acción de aceptar (404). Revisa que la app esté actualizada o vuelve a cargar la página.'
        )
      }
      throw new Error(`Error del servidor (${response.status})`)
    }
  }

  if (!response.ok) {
    const msg =
      typeof parsed.error === 'string'
        ? parsed.error
        : response.status === 404
          ? 'Recurso no encontrado (404)'
          : 'Error al aceptar presupuesto'
    throw new Error(msg)
  }

  if (!parsed.data?.operacionId) {
    throw new Error('La respuesta no incluye el id de la operación creada')
  }

  return parsed as AceptarPresupuestoRespuesta
}
