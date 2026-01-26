'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ContactoCard } from './ContactoCard'
import { Search, Plus } from 'lucide-react'
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

  return (
    <div className="space-y-6">
      <Tabs value={tipo} onValueChange={(v) => setTipo(v as 'proveedor' | 'cliente')}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="proveedor">
              Proveedores {total > 0 && `(${total})`}
            </TabsTrigger>
            <TabsTrigger value="cliente">
              Clientes {total > 0 && `(${total})`}
            </TabsTrigger>
          </TabsList>

          <Button asChild>
            <Link href={`/contactos/nuevo?tipo=${tipo}`}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo {tipo === 'proveedor' ? 'Proveedor' : 'Cliente'}
            </Link>
          </Button>
        </div>

        <TabsContent value="proveedor" className="space-y-4">
          <div className="flex gap-4">
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
            >
              {activo === null ? 'Todos' : 'Solo Activos'}
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : contactos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron proveedores
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contactos.map((contacto) => (
                <ContactoCard key={contacto.id} {...contacto} tipo="proveedor" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cliente" className="space-y-4">
          <div className="flex gap-4">
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
            >
              {activo === null ? 'Todos' : 'Solo Activos'}
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : contactos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron clientes
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

