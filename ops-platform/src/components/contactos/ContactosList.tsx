'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { ContactoCard } from './ContactoCard'
import { Search, Plus, Users, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Contacto {
  id: string
  rut: string
  razonSocial: string
  nombreFantasia?: string | null
  direccion?: string | null
  comuna?: string | null
  ciudad?: string | null
  telefono?: string | null
  email?: string | null
  activo: boolean
  totalOperaciones: number
}

interface ContactosResponse {
  success: boolean
  data: Contacto[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

async function fetchContactos(
  tipo: 'proveedor' | 'cliente',
  buscar: string,
  activo: string | null
): Promise<ContactosResponse> {
  const params = new URLSearchParams()
  if (buscar) params.set('buscar', buscar)
  if (activo !== null) params.set('activo', activo)

  const endpoint = tipo === 'proveedor' ? '/api/proveedores' : '/api/clientes'
  const response = await fetch(`${endpoint}?${params.toString()}`)

  if (!response.ok) {
    throw new Error('Error al cargar contactos')
  }

  return response.json()
}

export function ContactosList() {
  const [tipo, setTipo] = useState<'proveedor' | 'cliente'>('proveedor')
  const [buscar, setBuscar] = useState('')
  const [activo, setActivo] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['contactos', tipo, buscar, activo],
    queryFn: () => fetchContactos(tipo, buscar, activo),
  })

  if (error) {
    toast.error('Error al cargar contactos')
  }

  const contactos = data?.data || []
  const total = data?.meta.total || 0

  const LoadingState = () => (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando contactos...</p>
      </CardContent>
    </Card>
  )

  const EmptyState = ({ tipo }: { tipo: string }) => (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <Users className="h-16 w-16 text-muted-foreground opacity-50" />
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">
            No se encontraron {tipo === 'proveedor' ? 'proveedores' : 'clientes'}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {buscar
              ? 'No hay resultados para tu búsqueda. Intenta con otros términos.'
              : `Aún no tienes ${tipo === 'proveedor' ? 'proveedores' : 'clientes'} registrados. Comienza agregando uno.`}
          </p>
        </div>
        {!buscar && (
          <Button asChild size="lg" className="mt-4">
            <Link href={`/contactos/nuevo?tipo=${tipo}`}>
              <Plus className="h-5 w-5 mr-2" />
              Agregar {tipo === 'proveedor' ? 'proveedor' : 'cliente'}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Tabs value={tipo} onValueChange={(v) => setTipo(v as 'proveedor' | 'cliente')}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-2 h-12">
            <TabsTrigger value="proveedor" className="text-base font-semibold">
              <Users className="h-4 w-4 mr-2" />
              Proveedores {tipo === 'proveedor' && total > 0 && <span className="ml-1">({total})</span>}
            </TabsTrigger>
            <TabsTrigger value="cliente" className="text-base font-semibold">
              <Users className="h-4 w-4 mr-2" />
              Clientes {tipo === 'cliente' && total > 0 && <span className="ml-1">({total})</span>}
            </TabsTrigger>
          </TabsList>

          <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto">
            <Link href={`/contactos/nuevo?tipo=${tipo}`}>
              <Plus className="h-5 w-5 mr-2" />
              Nuevo {tipo === 'proveedor' ? 'Proveedor' : 'Cliente'}
            </Link>
          </Button>
        </div>

        <TabsContent value="proveedor" className="space-y-6 mt-6">
          <Card className="shadow-lg border-none">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o RUT..."
                    value={buscar}
                    onChange={(e) => setBuscar(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant={activo === null ? 'default' : 'outline'}
                  onClick={() => setActivo(activo === null ? 'true' : null)}
                  className="sm:w-auto w-full"
                >
                  {activo === null ? 'Todos' : 'Solo Activos'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <LoadingState />
          ) : contactos.length === 0 ? (
            <EmptyState tipo="proveedor" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contactos.map((contacto) => (
                <ContactoCard key={contacto.id} {...contacto} tipo="proveedor" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cliente" className="space-y-6 mt-6">
          <Card className="shadow-lg border-none">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o RUT..."
                    value={buscar}
                    onChange={(e) => setBuscar(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant={activo === null ? 'default' : 'outline'}
                  onClick={() => setActivo(activo === null ? 'true' : null)}
                  className="sm:w-auto w-full"
                >
                  {activo === null ? 'Todos' : 'Solo Activos'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <LoadingState />
          ) : contactos.length === 0 ? (
            <EmptyState tipo="cliente" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contactos.map((contacto) => (
                <ContactoCard key={contacto.id} {...contacto} tipo="cliente" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
