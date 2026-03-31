export interface DatosEmpresaPdf {
  razonSocial: string
  rut: string
  direccion: string
  telefono?: string
  email?: string
}

export interface DatosProveedorPdf {
  razonSocial: string
  rut: string
  direccion?: string
  telefono?: string
  email?: string
}

export interface LineaProductoPdf {
  tipoPallet: {
    codigo: string
    nombre: string
  }
  cantidad: number
  precioUnitario?: number
  descripcion?: string
}

export interface DatosOrdenCompraPdf {
  numero: string
  fecha: Date
  fechaEntrega?: Date
  direccionEntrega?: string
  observaciones?: string
  empresa: DatosEmpresaPdf
  proveedor: DatosProveedorPdf
  productos: LineaProductoPdf[]
}
