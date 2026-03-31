/**
 * Normaliza la respuesta de la API (Prisma) para las vistas de órdenes de compra.
 */

import { formatTipoPalletAtributosLineaDesdeInput } from '@/lib/tipos-pallet/orden-compra-catalogo'

export interface OrdenCompraProductoUi {
  /** Código y nombre del tipo de pallet */
  tipo: string
  /** categoría - medidas - [NIMF 15] - países; null si faltan relaciones en la API */
  detallePallet: string | null
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface OrdenCompraUi {
  id: string
  numero: string
  fecha: string
  fechaEntregaEsperada: string | null
  estado: string
  proveedor: { id: string; razonSocial: string; rut: string } | null
  direccionEntrega: string | null
  productos: OrdenCompraProductoUi[]
  total: number
  pdfGenerado: boolean
  pdfUrl: string | null
  observaciones: string | null
  operacionAsociada: { id: string; numero: string } | null
}

interface ApiLinea {
  cantidad: number
  precioUnitario: unknown
  tipoPallet?: {
    codigo?: string | null
    nombre?: string | null
    dimensiones?: string | null
    requiereCertificacion?: boolean
    categoria?: { nombre: string } | null
    paises?: Array<{ pais: { nombre: string; codigoIso: string } }> | null
  } | null
}

interface ApiOrdenCompra {
  id: string
  numero: string
  fecha: string | Date
  fechaEntrega?: string | Date | null
  estado: string
  direccionEntrega?: string | null
  observaciones?: string | null
  pdfGenerado?: boolean
  pdfUrl?: string | null
  proveedor?: { id: string; razonSocial: string; rut: string } | null
  operacion?: { id: string; numero: string } | null
  lineas?: ApiLinea[] | null
}

export function mapOrdenCompraApiToUi(api: ApiOrdenCompra): OrdenCompraUi {
  const lineas = api.lineas ?? []
  const productos: OrdenCompraProductoUi[] = lineas.map((l) => {
    const pu = l.precioUnitario != null ? Number(l.precioUnitario) : 0
    const subtotal = l.cantidad * pu
    const tp = l.tipoPallet
    const etiquetaTipo =
      tp?.codigo && tp?.nombre
        ? `${tp.codigo} — ${tp.nombre}`
        : (tp?.codigo ?? tp?.nombre ?? '—')

    let detallePallet: string | null = null
    if (
      tp?.categoria?.nombre &&
      typeof tp.requiereCertificacion === 'boolean' &&
      Array.isArray(tp.paises)
    ) {
      detallePallet = formatTipoPalletAtributosLineaDesdeInput({
        categoria: tp.categoria,
        dimensiones: tp.dimensiones ?? null,
        requiereCertificacion: tp.requiereCertificacion,
        paises: tp.paises,
      })
    }

    return {
      tipo: etiquetaTipo,
      detallePallet,
      cantidad: l.cantidad,
      precioUnitario: pu,
      subtotal,
    }
  })
  const total = productos.reduce((s, p) => s + p.subtotal, 0)

  return {
    id: api.id,
    numero: api.numero,
    fecha: typeof api.fecha === 'string' ? api.fecha : api.fecha.toISOString(),
    fechaEntregaEsperada:
      api.fechaEntrega == null
        ? null
        : typeof api.fechaEntrega === 'string'
          ? api.fechaEntrega
          : api.fechaEntrega.toISOString(),
    estado: api.estado,
    proveedor: api.proveedor ?? null,
    direccionEntrega: api.direccionEntrega ?? null,
    productos,
    total,
    pdfGenerado: Boolean(api.pdfGenerado),
    pdfUrl: api.pdfUrl ?? null,
    observaciones: api.observaciones ?? null,
    operacionAsociada: api.operacion ? { id: api.operacion.id, numero: api.operacion.numero } : null,
  }
}
