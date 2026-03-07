'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { PresupuestoForm } from '@/components/presupuestos/PresupuestoForm'
import { type CreatePresupuestoDto } from '@/modules/presupuestos/dto/create-presupuesto.dto'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function crearPresupuesto(data: CreatePresupuestoDto) {
  const response = await fetch('/api/presupuestos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al crear presupuesto')
  }

  return response.json()
}

export default function NuevoPresupuestoPage() {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: crearPresupuesto,
    onSuccess: (response) => {
      toast.success('Presupuesto creado correctamente')
      router.push(`/presupuestos/${response.data.id}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/presupuestos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Presupuesto</h1>
          <p className="text-muted-foreground mt-2">Crea una nueva cotización para un cliente</p>
        </div>
      </div>

      <PresupuestoForm
        onSubmit={async (data) => {
          await mutation.mutateAsync(data)
        }}
        onCancel={() => router.push('/presupuestos')}
        isLoading={mutation.isPending}
      />
    </div>
  )
}

