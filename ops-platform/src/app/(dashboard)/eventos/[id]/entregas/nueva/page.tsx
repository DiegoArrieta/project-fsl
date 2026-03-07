'use client'

import { useParams, useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { EntregaForm } from '@/components/entregas/EntregaForm'
import { type EntregaInput } from '@/lib/validations/entrega'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function crearEntrega(data: EntregaInput) {
  const response = await fetch('/api/entregas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al crear entrega')
  }

  return response.json()
}

export default function NuevaEntregaPage() {
  const params = useParams()
  const router = useRouter()
  const eventoId = params.id as string

  const mutation = useMutation({
    mutationFn: crearEntrega,
    onSuccess: () => {
      toast.success('Entrega creada correctamente')
      router.push(`/eventos/${eventoId}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/eventos/${eventoId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nueva Entrega</h1>
          <p className="text-muted-foreground mt-2">Completa los datos de la entrega</p>
        </div>
      </div>

      <EntregaForm
        eventoId={eventoId}
        onSubmit={async (data) => {
          await mutation.mutateAsync(data)
        }}
        onCancel={() => router.push(`/eventos/${eventoId}`)}
        isLoading={mutation.isPending}
      />
    </div>
  )
}

