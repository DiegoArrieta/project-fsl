/** Líneas con tipo de pallet y datos para detalle (vista OC, PDF, etc.). */
export const ordenCompraLineasConTipoPalletDetalle = {
  lineas: {
    include: {
      tipoPallet: {
        include: {
          categoria: true,
          paises: { include: { pais: true } },
        },
      },
      presupuestoLinea: {
        select: {
          id: true,
          presupuestoId: true,
          presupuesto: { select: { id: true, numero: true, estado: true } },
        },
      },
    },
  },
} as const
