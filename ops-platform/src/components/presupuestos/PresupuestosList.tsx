'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PresupuestoCard } from './PresupuestoCard'
import { Search, Plus, Calculator, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Presupuesto {
  id: string
  numero: string
  clienteId: string
  cliente?: { razonSocial: string }
  fecha: string
  total: number
  estado: 'BORRADOR' | 'ENVIADO' | 'ACEPTADO' | 'RECHAZADO'
  ciudad?: string | null
}

interface PresupuestosResponse {
  success: boolean
  data: Presupuesto[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

async function fetchPresupuestos(
  buscar: string,
  estado: string | null
): Promise<PresupuestosResponse> {
  const params = new URLSearchParams()
  if (buscar) params.set('buscar', buscar)
  if (estado && estado !== 'all') params.set('estado', estado)

  const response = await fetch(`/api/presupuestos?${params.toString()}`)

  if (!response.ok) {
    throw new Error('Error al cargar presupuestos')
  }

  return response.json()
}

export function PresupuestosList() {
  const [buscar, setBuscar] = useState('')
  const [estado, setEstado] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['presupuestos', buscar, estado],
    queryFn: () => fetchPresupuestos(buscar, estado),
  })

  if (error) {
    toast.error('Error al cargar presupuestos')
  }

  const presupuestos = data?.data || []
  const total = data?.meta.total || 0

  const LoadingState = () => (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando presupuestos...</p>
      </CardContent>
    </Card>
  )

  const EmptyState = () => (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-semibold mb-2">No hay presupuestos</p>
        <p className="text-muted-foreground text-center mb-4">
          {buscar || estado
            ? 'No se encontraron presupuestos con los filtros aplicados'
            : 'Comienza creando tu primer presupuesto de venta'}
        </p>
        {!buscar && !estado && (
          <Button asChild>
            <Link href="/presupuestos/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Crear Presupuesto
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Presupuestos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona cotizaciones y presupuestos de venta para tus clientes
          </p>
        </div>
        <Button asChild>
          <Link href="/presupuestos/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Presupuesto
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, cliente..."
                  value={buscar}
                  onChange={(e) => setBuscar(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={estado || 'all'}
              onValueChange={(value) => setEstado(value === 'all' ? null : value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="BORRADOR">Borrador</SelectItem>
                <SelectItem value="ENVIADO">Enviado</SelectItem>
                <SelectItem value="ACEPTADO">Aceptado</SelectItem>
                <SelectItem value="RECHAZADO">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <div>
        {isLoading ? (
          <LoadingState />
        ) : presupuestos.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Mostrando {presupuestos.length} de {total} presupuesto{total !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {presupuestos.map((presupuesto) => (
                <PresupuestoCard 
                  key={presupuesto.id} 
                  id={presupuesto.id}
                  numero={presupuesto.numero}
                  clienteNombre={presupuesto.cliente?.razonSocial || 'Desconocido'}
                  fecha={presupuesto.fecha}
                  total={presupuesto.total}
                  estado={presupuesto.estado}
                  ciudad={presupuesto.ciudad}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

