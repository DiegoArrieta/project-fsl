'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { EmpresaForm } from '@/components/empresas/EmpresaForm'
import { type EmpresaInput } from '@/lib/validations/empresa'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function crearEmpresa(data: EmpresaInput) {
  const response = await fetch('/api/empresas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al crear empresa')
  }

  return response.json()
}

export default function NuevaEmpresaPage() {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: crearEmpresa,
    onSuccess: () => {
      toast.success('Empresa creada correctamente')
      router.push('/empresas')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/empresas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nueva Empresa</h1>
          <p className="text-muted-foreground mt-2">Completa los datos de la empresa</p>
        </div>
      </div>

      <EmpresaForm
        onSubmit={async (data) => {
          await mutation.mutateAsync(data)
        }}
        onCancel={() => router.push('/empresas')}
        isLoading={mutation.isPending}
      />
    </div>
  )
}

