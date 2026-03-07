'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { EmpresaForm } from '@/components/empresas/EmpresaForm'
import { type EmpresaInput } from '@/lib/validations/empresa'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function obtenerEmpresa(id: string) {
  const response = await fetch(`/api/empresas/${id}`)
  if (!response.ok) {
    throw new Error('Empresa no encontrada')
  }
  const result = await response.json()
  return result.data
}

async function actualizarEmpresa(id: string, data: EmpresaInput) {
  const response = await fetch(`/api/empresas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al actualizar empresa')
  }

  return response.json()
}

export default function EditarEmpresaPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: empresa, isLoading } = useQuery({
    queryKey: ['empresa', id],
    queryFn: () => obtenerEmpresa(id),
  })

  const mutation = useMutation({
    mutationFn: (data: EmpresaInput) => actualizarEmpresa(id, data),
    onSuccess: () => {
      toast.success('Empresa actualizada correctamente')
      router.push(`/empresas/${id}`)
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

  if (!empresa) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Empresa no encontrada</p>
          <Button asChild className="mt-4">
            <Link href="/empresas">Volver a Empresas</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/empresas/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Empresa</h1>
          <p className="text-muted-foreground mt-2">Modifica los datos de la empresa</p>
        </div>
      </div>

      <EmpresaForm
        initialData={empresa}
        onSubmit={async (data) => {
          await mutation.mutateAsync(data)
        }}
        onCancel={() => router.push(`/empresas/${id}`)}
        isLoading={mutation.isPending}
      />
    </div>
  )
}

