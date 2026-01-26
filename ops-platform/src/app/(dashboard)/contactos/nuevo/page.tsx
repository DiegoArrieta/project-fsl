'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { ContactoForm } from '@/components/contactos/ContactoForm'
import { type ProveedorInput, type ClienteInput } from '@/lib/validations/contacto'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function crearContacto(
  tipo: 'proveedor' | 'cliente',
  data: ProveedorInput | ClienteInput
) {
  const endpoint = tipo === 'proveedor' ? '/api/proveedores' : '/api/clientes'
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al crear contacto')
  }

  return response.json()
}

function NuevoContactoForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tipo = (searchParams.get('tipo') || 'proveedor') as 'proveedor' | 'cliente'

  const mutation = useMutation({
    mutationFn: (data: ProveedorInput | ClienteInput) => crearContacto(tipo, data),
    onSuccess: () => {
      toast.success(`${tipo === 'proveedor' ? 'Proveedor' : 'Cliente'} creado correctamente`)
      router.push('/contactos')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/contactos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            Nuevo {tipo === 'proveedor' ? 'Proveedor' : 'Cliente'}
          </h1>
          <p className="text-muted-foreground mt-2">
            Completa los datos del {tipo === 'proveedor' ? 'proveedor' : 'cliente'}
          </p>
        </div>
      </div>

      <ContactoForm
        tipo={tipo}
        onSubmit={async (data) => {
          await mutation.mutateAsync(data)
        }}
        onCancel={() => router.push('/contactos')}
        isLoading={mutation.isPending}
      />
    </div>
  )
}

export default function NuevoContactoPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8">Cargando...</div>}>
      <NuevoContactoForm />
    </Suspense>
  )
}

