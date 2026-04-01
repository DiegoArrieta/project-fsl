/**
 * Forma mínima de operación devuelta por GET /api/operaciones y GET /api/operaciones/[id]
 */

export interface FuenteCompraOperacionLineaApi {
  ordenCompraId: string
  ordenCompraNumero: string
  proveedorRazonSocial: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface DesgloseCompraOperacionLineaApi {
  operacionLineaId: string
  tipoPalletId: string
  cantidadVenta: number
  cantidadCompradaRecibida: number
  hayDesvioCantidad: boolean
  fuentes: FuenteCompraOperacionLineaApi[]
}

export interface OperacionLineaApi {
  id: string
  tipoPalletId: string
  presupuestoLineaId?: string | null
  cantidad: number
  cantidadEntregada: number
  cantidadDanada: number
  precioUnitario?: string | number | { toString: () => string } | null
  precioVentaUnitario?: string | number | { toString: () => string } | null
  precioCompraUnitario?: string | number | { toString: () => string } | null
  tipoPallet?: {
    nombre?: string
    codigo?: string
  } | null
}

export interface DocumentoOperacionApi {
  id: string
  tipo: string
  numeroDocumento?: string | null
  archivoUrl?: string | null
  archivoNombre?: string | null
  archivoTipo?: string | null
  /** ISO desde Prisma `uploadedAt` */
  uploadedAt?: string | Date | null
  presente?: boolean
}

export interface PagoOperacionApi {
  id: string
  tipo: string
  monto: string | number | { toString: () => string }
  fechaPago: string
  metodoPago?: string | null
}

export interface FactoringOperacionApi {
  id?: string
  empresaFactoringId?: string
  /** Catálogo (include en GET operación) */
  empresaFactoring?: {
    id: string
    nombre: string
    rut?: string | null
    contacto?: string | null
    telefono?: string | null
    email?: string | null
    activo?: boolean
  } | null
  fechaFactoring?: string
  montoFactura?: string | number | { toString: () => string }
  montoAdelantado?: string | number | { toString: () => string }
  comisionFactoring?: string | number | { toString: () => string } | null
  fechaVencimiento?: string | null
  observaciones?: string | null
}

export interface OperacionClienteApi {
  razonSocial: string
  rut: string
}

export interface OperacionProveedorRowApi {
  proveedor?: {
    razonSocial?: string
    rut?: string
  } | null
}

export interface OperacionApi {
  id: string
  numero: string
  tipo: string
  fecha: string
  cliente?: OperacionClienteApi | null
  proveedores?: OperacionProveedorRowApi[]
  direccionEntrega?: string | null
  ordenCompraCliente?: string | null
  estadoDocumental: string
  estadoFinanciero: string
  observaciones?: string | null
  lineas?: OperacionLineaApi[]
  documentos?: DocumentoOperacionApi[]
  pagos?: PagoOperacionApi[]
  factoring?: FactoringOperacionApi | null
  /** Órdenes de compra en estado RECIBIDA vinculadas a la operación */
  ordenesCompra?: Array<{
    id: string
    numero: string
    estado: string
    proveedor?: { razonSocial: string; rut?: string | null }
    lineas?: unknown[]
  }>
  /** Desglose de compras por línea (OC RECIBIDA) para margen multi-proveedor */
  desgloseCompraPorLinea?: DesgloseCompraOperacionLineaApi[]
}
