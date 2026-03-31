'use client'

import { type TipoPalletCatalogoOc, formatTipoPalletAtributosLineaOc } from '@/lib/tipos-pallet/orden-compra-catalogo'

interface TipoPalletSelectItemBodyProps {
  tipo: TipoPalletCatalogoOc
}

export function TipoPalletSelectItemBody({ tipo }: TipoPalletSelectItemBodyProps) {
  return (
    <span className="block truncate pr-1 text-left text-sm text-foreground">
      {formatTipoPalletAtributosLineaOc(tipo)}
    </span>
  )
}
