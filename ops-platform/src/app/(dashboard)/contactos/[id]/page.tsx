'use client'

import { Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ContactoForm } from '@/components/contactos/ContactoForm'
import { PersonasContactoMantenedor } from '@/components/contactos/PersonasContactoMantenedor'
import { type ProveedorInput, type ClienteInput } from '@/lib/validations/contacto'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Package, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRutForDisplay } from '@/lib/validations/rut'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ContactoDetalleResult } from '@/types/contacto-detalle'

async function obtenerContacto(
  id: string,
  tipoPreferido: 'proveedor' | 'cliente' | null
): Promise<ContactoDetalleResult> {
  const tryProveedor = async (): Promise<ContactoDetalleResult | null> => {
    const response = await fetch(`/api/proveedores/${id}`)
    if (!response.ok) return null
    const result = await response.json()
    return { tipo: 'proveedor', data: result.data }
  }

  const tryCliente = async (): Promise<ContactoDetalleResult | null> => {
    const response = await fetch(`/api/clientes/${id}`)
    if (!response.ok) return null
    const result = await response.json()
    return { tipo: 'cliente', data: result.data }
  }

  if (tipoPreferido === 'cliente') {
    const c = await tryCliente()
    if (c) return c
    const p = await tryProveedor()
    if (p) return p
  } else if (tipoPreferido === 'proveedor') {
    const p = await tryProveedor()
    if (p) return p
    const c = await tryCliente()
    if (c) return c
  } else {
    const p = await tryProveedor()
    if (p) return p
    const c = await tryCliente()
    if (c) return c
  }

  throw new Error('Contacto no encontrado')
}

async function actualizarContacto(
  tipo: 'proveedor' | 'cliente',
  id: string,
  data: ProveedorInput | ClienteInput
) {
  const endpoint = tipo === 'proveedor' ? `/api/proveedores/${id}` : `/api/clientes/${id}`
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}))
    throw new Error((errBody as { error?: string }).error || 'Error al actualizar contacto')
  }

  return response.json()
}

function ContactoDetalleContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const id = params.id as string

  const tipoParam = searchParams.get('tipo')
  const tipoPreferido: 'proveedor' | 'cliente' | null =
    tipoParam === 'proveedor' || tipoParam === 'cliente' ? tipoParam : null

  const {
    data: contactoData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['contacto', id, tipoPreferido],
    queryFn: () => obtenerContacto(id, tipoPreferido),
    enabled: Boolean(id),
  })

  const mutation = useMutation({
    mutationFn: (data: ProveedorInput | ClienteInput) => {
      if (!contactoData) throw new Error('Sin datos de contacto')
      return actualizarContacto(contactoData.tipo, id, data)
    },
    onSuccess: () => {
      const label = contactoData?.tipo === 'proveedor' ? 'Proveedor' : 'Cliente'
      toast.success(`${label} actualizado correctamente`)
      queryClient.invalidateQueries({ queryKey: ['contacto', id] })
      queryClient.invalidateQueries({ queryKey: ['contactos'] })
      router.push('/contactos')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">Cargando contacto…</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12 space-y-4">
          <p className="text-destructive">{error instanceof Error ? error.message : 'Error al cargar'}</p>
          <Button asChild>
            <Link href="/contactos">Volver a Contactos</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!contactoData) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Contacto no encontrado</p>
          <Button asChild className="mt-4">
            <Link href="/contactos">Volver a Contactos</Link>
          </Button>
        </div>
      </div>
    )
  }

  const { tipo, data } = contactoData
  const rutFormateado = formatRutForDisplay(data.rut)
  const ultimas = data.ultimasOperaciones ?? []

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/contactos" aria-label="Volver a contactos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{data.razonSocial}</h1>
          <p className="text-muted-foreground mt-2">
            {tipo === 'proveedor' ? 'Proveedor' : 'Cliente'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">RUT</p>
              <p className="font-medium">{rutFormateado}</p>
            </div>
            {data.nombreFantasia && (
              <div>
                <p className="text-sm text-muted-foreground">Nombre fantasía</p>
                <p className="font-medium">{data.nombreFantasia}</p>
              </div>
            )}
            {data.telefono && (
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{data.telefono}</p>
              </div>
            )}
            {data.email && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium break-all">{data.email}</p>
              </div>
            )}
            {(data.direccion || data.comuna || data.ciudad) && (
              <div>
                <p className="text-sm text-muted-foreground">Ubicación</p>
                <p className="font-medium">
                  {[data.direccion, [data.comuna, data.ciudad].filter(Boolean).join(', ')]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <Badge variant={data.activo ? 'default' : 'secondary'}>
                {data.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            {data.estadisticas && (
              <div className="pt-4 border-t space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Total operaciones</p>
                  <p className="font-medium">{data.estadisticas.totalOperaciones}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Operaciones abiertas</p>
                  <p className="font-medium">{data.estadisticas.operacionesAbiertas}</p>
                </div>
                {data.estadisticas.ultimaOperacion && (
                  <div>
                    <p className="text-sm text-muted-foreground">Última operación</p>
                    <p className="font-medium">{data.estadisticas.ultimaOperacion}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <PersonasContactoMantenedor entidadId={id} tipoEntidad={tipo} />

          {ultimas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" aria-hidden />
                  Últimas operaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ultimas.map((op) => (
                  <div
                    key={op.id}
                    className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold">{op.numero}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(op.fecha), "d MMM yyyy", { locale: es })} · {op.tipo.replace(/_/g, ' ')} ·{' '}
                        {op.estadoFinanciero}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/operaciones/${op.id}`}>
                        Ver
                        <ExternalLink className="h-3.5 w-3.5 ml-1" aria-hidden />
                      </Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <ContactoForm
            tipo={tipo}
            initialData={data}
            onSubmit={async (formData) => {
              await mutation.mutateAsync(formData)
            }}
            onCancel={() => router.push('/contactos')}
            isLoading={mutation.isPending}
          />
        </div>
      </div>
    </div>
  )
}

export default function ContactoDetallePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
        </div>
      }
    >
      <ContactoDetalleContent />
    </Suspense>
  )
}
