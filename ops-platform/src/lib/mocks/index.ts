/**
 * Servicios mock para desarrollo y presentación
 * Estos servicios simulan las respuestas de la API sin necesidad de backend
 */

// Mock de datos de operaciones
export const mockOperaciones = [
  {
    id: '1',
    numero: 'OP-2026-00130',
    tipo: 'VENTA_DIRECTA',
    fecha: '2026-01-12',
    cliente: { id: '1', razonSocial: 'Cermaq Chile S.A.', rut: '76123456-7' },
    proveedor: { id: '1', razonSocial: 'Forestal Andes Ltda.', rut: '77442030-4' },
    direccionEntrega: 'Puerto Montt, Av. Principal 123',
    ordenCompraCliente: 'OC-36',
    ordenCompraGenerada: { id: '1', numero: 'OC-2026-00015' },
    estadoDocumental: 'INCOMPLETA',
    estadoFinanciero: 'FACTURADA',
    productos: [
      { tipo: 'PV', cantidad: 1000, cantidadEntregada: 990, cantidadDanada: 10, precioVenta: 13500, precioCompra: 10000 },
      { tipo: 'PC', cantidad: 200, cantidadEntregada: 200, cantidadDanada: 0, precioVenta: 18000, precioCompra: 14000 },
    ],
    totalVenta: 17100000,
    totalCompra: 12800000,
    margenBruto: 4300000,
    margenPorcentual: 25.1,
    documentos: [
      { id: '1', tipo: 'GUIA_DESPACHO', numero: '95519', fecha: '2026-01-12', presente: true },
      { id: '2', tipo: 'FACTURA', numero: 'F-00234', fecha: '2026-01-12', presente: true },
      { id: '3', tipo: 'CERTIFICADO_NIMF15', presente: false },
    ],
    pagos: [
      { id: '1', tipo: 'COBRO_CLIENTE', monto: 6750000, fecha: '2026-01-12', metodo: 'TRANSFERENCIA' },
    ],
    observaciones: 'Entregar antes de las 14:00. Contactar a Juan Pérez en planta.',
  },
  {
    id: '2',
    numero: 'OP-2026-00129',
    tipo: 'COMPRA',
    fecha: '2026-01-11',
    proveedor: { id: '1', razonSocial: 'Forestal Andes Ltda.', rut: '77442030-4' },
    estadoDocumental: 'COMPLETA',
    estadoFinanciero: 'PAGADA',
    productos: [
      { tipo: 'PC', cantidad: 1000, cantidadEntregada: 1000, cantidadDanada: 0, precioUnitario: 15000 },
    ],
    totalCompra: 15000000,
    documentos: [
      { id: '4', tipo: 'ORDEN_COMPRA', numero: 'OC-2026-00014', fecha: '2026-01-11', presente: true },
      { id: '5', tipo: 'GUIA_RECEPCION', numero: 'GR-123', fecha: '2026-01-11', presente: true },
    ],
    pagos: [
      { id: '2', tipo: 'PAGO_PROVEEDOR', monto: 15000000, fecha: '2026-01-11', metodo: 'TRANSFERENCIA' },
    ],
  },
]

// Mock de órdenes de compra
export const mockOrdenesCompra = [
  {
    id: '1',
    numero: 'OC-2026-00015',
    fecha: '2026-01-12',
    fechaEntregaEsperada: '2026-01-20',
    proveedor: { id: '1', razonSocial: 'Forestal Andes Ltda.', rut: '77442030-4' },
    direccionEntrega: 'Puerto Montt, Av. Principal 123',
    estado: 'ENVIADA',
    productos: [
      { tipo: 'PV', cantidad: 1000, precioUnitario: 13500, subtotal: 13500000 },
      { tipo: 'PC', cantidad: 200, precioUnitario: 18000, subtotal: 3600000 },
    ],
    total: 17100000,
    pdfGenerado: true,
    pdfUrl: '/uploads/ocs/OC-2026-00015.pdf',
    observaciones: 'Entregar antes de las 14:00.',
    operacionAsociada: { id: '1', numero: 'OP-2026-00130' },
  },
  {
    id: '2',
    numero: 'OC-2026-00014',
    fecha: '2026-01-11',
    fechaEntregaEsperada: '2026-01-18',
    proveedor: { id: '2', razonSocial: 'Proveedor XYZ S.A.', rut: '76543210-1' },
    direccionEntrega: 'Santiago, Calle Principal 456',
    estado: 'RECIBIDA',
    productos: [
      { tipo: 'PC', cantidad: 500, precioUnitario: 18000, subtotal: 9000000 },
    ],
    total: 9000000,
    pdfGenerado: true,
    pdfUrl: '/uploads/ocs/OC-2026-00014.pdf',
  },
]

// Mock de contactos
export const mockProveedores = [
  {
    id: '1',
    rut: '77442030-4',
    razonSocial: 'FORESTAL ANDES LIMITADA',
    nombreFantasia: 'Forestal Andes',
    direccion: 'Camino Freire a Barros Arana KM.2',
    comuna: 'Freire',
    ciudad: 'Temuco',
    telefono: '45-2378200',
    email: 'administracion@forestalandes.cl',
    activo: true,
    totalOperaciones: 15,
  },
]

export const mockClientes = [
  {
    id: '1',
    rut: '76123456-7',
    razonSocial: 'CERMAQ CHILE S.A.',
    nombreFantasia: 'Cermaq',
    direccion: 'Av. Costanera 123',
    comuna: 'Puerto Montt',
    ciudad: 'Puerto Montt',
    telefono: '65-2345678',
    email: 'contacto@cermaq.cl',
    activo: true,
    totalOperaciones: 8,
  },
]

// Mock de tipos de pallet
export const mockTiposPallet = [
  { id: '1', codigo: 'PV', nombre: 'Pallet Verde', descripcion: 'Pallet estándar sin certificación' },
  { id: '2', codigo: 'PR', nombre: 'Pallet Recuperado', descripcion: 'Pallet reutilizado' },
  { id: '3', codigo: 'PC', nombre: 'Pallet Certificado', descripcion: 'Pallet con certificación NIMF-15' },
]

// Funciones mock para simular llamadas API
export const mockApi = {
  operaciones: {
    listar: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simular delay
      return { success: true, data: mockOperaciones, meta: { total: mockOperaciones.length, page: 1, pageSize: 20 } }
    },
    obtener: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const operacion = mockOperaciones.find((o) => o.id === id)
      return operacion ? { success: true, data: operacion } : { success: false, error: 'No encontrado' }
    },
    crear: async (data: any) => {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return { success: true, data: { id: 'new-1', ...data, numero: 'OP-2026-00131' } }
    },
    actualizar: async (id: string, data: any) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return { success: true, data: { id, ...data } }
    },
  },
  ordenesCompra: {
    listar: async () => {
      await new Promise((resolve) => setTimeout(resolve, 400))
      return { success: true, data: mockOrdenesCompra, meta: { total: mockOrdenesCompra.length, page: 1, pageSize: 20 } }
    },
    obtener: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const oc = mockOrdenesCompra.find((o) => o.id === id)
      return oc ? { success: true, data: oc } : { success: false, error: 'No encontrado' }
    },
    crear: async (data: any) => {
      await new Promise((resolve) => setTimeout(resolve, 600))
      return { success: true, data: { id: 'new-oc-1', ...data, numero: 'OC-2026-00016' } }
    },
  },
  contactos: {
    proveedores: {
      listar: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300))
        return { success: true, data: mockProveedores, meta: { total: mockProveedores.length } }
      },
    },
    clientes: {
      listar: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300))
        return { success: true, data: mockClientes, meta: { total: mockClientes.length } }
      },
    },
  },
  dashboard: {
    resumen: async () => {
      await new Promise((resolve) => setTimeout(resolve, 400))
      return {
        success: true,
        data: {
          documentosFaltantes: 5,
          pagosPendientes: 3,
          operacionesAbiertas: 23,
          cerradas30Dias: 18,
          compras: 12,
          ventas: 11,
          ocBorrador: 2,
          ocEnviadas: 5,
          pendientes: [
            { tipo: 'DOCUMENTO', operacion: 'OP-2026-00123', descripcion: 'Falta Guía de Despacho' },
            { tipo: 'DOCUMENTO', operacion: 'OP-2026-00124', descripcion: 'Falta Certificado NIMF-15' },
            { tipo: 'PAGO', operacion: 'OP-2026-00120', descripcion: '$2.500.000 pendiente' },
          ],
          actividadReciente: [
            { accion: 'OP-2026-00130 creada', tiempo: 'hace 2 horas' },
            { accion: 'Documento agregado a OP-2026-00129', tiempo: 'hace 3 horas' },
            { accion: 'OP-2026-00128 cerrada', tiempo: 'hace 5 horas' },
          ],
        },
      }
    },
  },
}

