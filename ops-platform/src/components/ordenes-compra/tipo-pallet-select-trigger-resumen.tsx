'use client'

import { SelectValue } from '@/components/ui/select'
import {
  type TipoPalletCatalogoOc,
  formatTipoPalletAtributosLineaOc,
} from '@/lib/tipos-pallet/orden-compra-catalogo'

interface TipoPalletSelectTriggerResumenProps {
  tipo: TipoPalletCatalogoOc | undefined
}

export function TipoPalletSelectTriggerResumen({ tipo }: TipoPalletSelectTriggerResumenProps) {
  return (
    <>
      <span className="min-w-0 flex-1 truncate text-left text-sm text-foreground">
        {tipo ? formatTipoPalletAtributosLineaOc(tipo) : (
          <span className="text-muted-foreground">Seleccionar tipo de pallet</span>
        )}
      </span>
      <SelectValue placeholder="Seleccionar tipo de pallet" className="sr-only" />
    </>
  )
}
