import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Alerta, TipoAlerta } from '@/lib/dashboard/alertas'

export interface DashboardViewModel {
  documentosFaltantes: number
  pagosPendientes: number
  operacionesAbiertas: number
  cerradas30Dias: number
  compras: number
  ventas: number
  pendientes: Array<{ tipo: 'DOCUMENTO' | 'PAGO'; operacion: string; descripcion: string }>
  actividadReciente: Array<{ accion: string; tiempo: string; enlace: string }>
}

interface EstadisticasPayload {
  estadisticasOperaciones: {
    porTipo: { compra: number; ventaDirecta: number; ventaComision: number }
  }
  operacionesPendientes: {
    documentosIncompletos: number
    pagoPendiente: number
    facturadas: number
  }
  resumenGlobal?: {
    operacionesAbiertas: number
    cerradas30Dias: number
  }
}

interface ActividadItem {
  descripcion: string
  fecha: string | Date
  enlace: string
}

function mapAlertaTipoToPendienteColumn(tipo: TipoAlerta): 'DOCUMENTO' | 'PAGO' {
  if (tipo === 'DOCUMENTOS_INCOMPLETOS' || tipo === 'OPERACION_ANTIGUA') return 'DOCUMENTO'
  return 'PAGO'
}

export function buildDashboardViewModel(
  estadisticas: EstadisticasPayload,
  alertas: Alerta[],
  actividad: ActividadItem[]
): DashboardViewModel {
  const porTipo = estadisticas.estadisticasOperaciones.porTipo
  const pend = estadisticas.operacionesPendientes
  const resumen = estadisticas.resumenGlobal

  return {
    documentosFaltantes: pend.documentosIncompletos,
    pagosPendientes: pend.pagoPendiente + pend.facturadas,
    operacionesAbiertas: resumen?.operacionesAbiertas ?? 0,
    cerradas30Dias: resumen?.cerradas30Dias ?? 0,
    compras: porTipo.compra,
    ventas: porTipo.ventaDirecta + porTipo.ventaComision,
    pendientes: alertas.map((a) => ({
      tipo: mapAlertaTipoToPendienteColumn(a.tipo),
      operacion: a.operacionNumero,
      descripcion: a.descripcion,
    })),
    actividadReciente: actividad.map((item) => ({
      accion: item.descripcion,
      tiempo: formatDistanceToNow(new Date(item.fecha), { addSuffix: true, locale: es }),
      enlace: item.enlace,
    })),
  }
}
