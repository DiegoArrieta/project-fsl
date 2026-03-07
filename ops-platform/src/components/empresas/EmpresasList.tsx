'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmpresaCard } from './EmpresaCard'
import { Search, Plus, Building2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Empresa {
  id: string
  nombre: string
  rut: string
  tipoEmpresa: 'PROVEEDOR' | 'CLIENTE' | 'TRANSPORTISTA' | 'OTRO'
  contacto?: string | null
  direccion?: string | null
  telefono?: string | null
  email?: string | null
  estado: 'ACTIVA' | 'INACTIVA'
  totalOperaciones?: number
}

interface EmpresasResponse {
  success: boolean
  data: Empresa[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

async function fetchEmpresas(
  buscar: string,
  tipoEmpresa: string | null,
  estado: string | null
): Promise<EmpresasResponse> {
  const params = new URLSearchParams()
  if (buscar) params.set('buscar', buscar)
  if (tipoEmpresa) params.set('tipoEmpresa', tipoEmpresa)
  if (estado) params.set('estado', estado)

  const response = await fetch(`/api/empresas?${params.toString()}`)

  if (!response.ok) {
    throw new Error('Error al cargar empresas')
  }

  return response.json()
}

export function EmpresasList() {
  const [buscar, setBuscar] = useState('')
  const [tipoEmpresa, setTipoEmpresa] = useState<string | null>(null)
  const [estado, setEstado] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['empresas', buscar, tipoEmpresa, estado],
    queryFn: () => fetchEmpresas(buscar, tipoEmpresa, estado),
  })

  if (error) {
    toast.error('Error al cargar empresas')
  }

  const empresas = data?.data || []
  const total = data?.meta.total || 0

  const LoadingState = () => (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando empresas...</p>
      </CardContent>
    </Card>
  )

  const EmptyState = () => (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-semibold mb-2">No hay empresas</p>
        <p className="text-muted-foreground text-center mb-4">
          {buscar || tipoEmpresa || estado
            ? 'No se encontraron empresas con los filtros aplicados'
            : 'Comienza agregando tu primera empresa'}
        </p>
        {!buscar && !tipoEmpresa && !estado && (
          <Button asChild>
            <Link href="/empresas/nueva">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Empresa
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
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las empresas que interactúan con el sistema
          </p>
        </div>
        <Button asChild>
          <Link href="/empresas/nueva">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Empresa
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
                  placeholder="Buscar por nombre, RUT..."
                  value={buscar}
                  onChange={(e) => setBuscar(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={tipoEmpresa || 'all'}
              onValueChange={(value) => setTipoEmpresa(value === 'all' ? null : value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="PROVEEDOR">Proveedor</SelectItem>
                <SelectItem value="CLIENTE">Cliente</SelectItem>
                <SelectItem value="TRANSPORTISTA">Transportista</SelectItem>
                <SelectItem value="OTRO">Otro</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={estado || 'all'}
              onValueChange={(value) => setEstado(value === 'all' ? null : value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ACTIVA">Activa</SelectItem>
                <SelectItem value="INACTIVA">Inactiva</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <div>
        {isLoading ? (
          <LoadingState />
        ) : empresas.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Mostrando {empresas.length} de {total} empresa{total !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {empresas.map((empresa) => (
                <EmpresaCard key={empresa.id} {...empresa} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

