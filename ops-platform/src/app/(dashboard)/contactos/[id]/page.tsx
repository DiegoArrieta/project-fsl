'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ContactoForm } from '@/components/contactos/ContactoForm'
import { type ProveedorInput, type ClienteInput } from '@/lib/validations/contacto'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRutForDisplay } from '@/lib/validations/rut'

async function obtenerContacto(id: string): Promise<{
  tipo: 'proveedor' | 'cliente'
  data: any
}> {
  // Intentar obtener como proveedor primero
  let response = await fetch(`/api/proveedores/${id}`)
  if (response.ok) {
    const result = await response.json()
    return { tipo: 'proveedor', data: result.data }
  }

  // Si no es proveedor, intentar como cliente
  response = await fetch(`/api/clientes/${id}`)
  if (response.ok) {
    const result = await response.json()
    return { tipo: 'cliente', data: result.data }
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
    const error = await response.json()
    throw new Error(error.error || 'Error al actualizar contacto')
  }

  return response.json()
}

export default function ContactoDetallePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: contactoData, isLoading } = useQuery({
    queryKey: ['contacto', id],
    queryFn: () => obtenerContacto(id),
  })

  const mutation = useMutation({
    mutationFn: (data: ProveedorInput | ClienteInput) =>
      actualizarContacto(contactoData!.tipo, id, data),
    onSuccess: () => {
      toast.success(
        `${contactoData!.tipo === 'proveedor' ? 'Proveedor' : 'Cliente'} actualizado correctamente`
      )
      router.push('/contactos')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/contactos">
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
                <p className="text-sm text-muted-foreground">Nombre Fantasía</p>
                <p className="font-medium">{data.nombreFantasia}</p>
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
                  <p className="text-sm text-muted-foreground">Total Operaciones</p>
                  <p className="font-medium">{data.estadisticas.totalOperaciones}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Operaciones Abiertas</p>
                  <p className="font-medium">{data.estadisticas.operacionesAbiertas}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
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

