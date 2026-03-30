'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'

interface Proveedor {
  id: string
  razonSocial: string
  rut: string
}

interface ProveedoresSelectorProps {
  proveedores: Proveedor[]
  proveedoresSeleccionados: string[]
  onChange: (proveedores: string[]) => void
  error?: string
}

export function ProveedoresSelector({
  proveedores,
  proveedoresSeleccionados,
  onChange,
  error,
}: ProveedoresSelectorProps) {
  /** Valor temporal del desplegable (se limpía tras incorporar a la lista) */
  const [selectedProveedor, setSelectedProveedor] = useState<string>('')

  const handleElegirProveedor = (value: string) => {
    if (!value) return
    if (!proveedoresSeleccionados.includes(value)) {
      onChange([...proveedoresSeleccionados, value])
    }
    setSelectedProveedor('')
  }

  const eliminarProveedor = (proveedorId: string) => {
    onChange(proveedoresSeleccionados.filter((id) => id !== proveedorId))
  }

  const proveedoresDisponibles = proveedores.filter(
    (p) => !proveedoresSeleccionados.includes(p.id)
  )

  const getProveedorNombre = (proveedorId: string) => {
    const proveedor = proveedores.find((p) => p.id === proveedorId)
    return proveedor ? `${proveedor.razonSocial} (${proveedor.rut})` : proveedorId
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <div className="flex-1">
          <Select
            value={selectedProveedor || undefined}
            onValueChange={handleElegirProveedor}
          >
            <SelectTrigger className={error ? 'border-destructive' : ''} aria-label="Agregar proveedor a la operación">
              <SelectValue placeholder="Elegir proveedor para añadirlo a la lista…" />
            </SelectTrigger>
            <SelectContent className="z-200">
              {proveedoresDisponibles.map((proveedor) => (
                <SelectItem key={proveedor.id} value={proveedor.id}>
                  {proveedor.razonSocial} - {proveedor.rut}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          Cada proveedor que elija se incorpora de inmediato. Use la X para quitar uno de la lista.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {proveedoresSeleccionados.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Proveedores seleccionados:</p>
          <div className="space-y-2">
            {proveedoresSeleccionados.map((proveedorId) => (
              <div
                key={proveedorId}
                className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200"
              >
                <span className="text-sm">{getProveedorNombre(proveedorId)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => eliminarProveedor(proveedorId)}
                  className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}





