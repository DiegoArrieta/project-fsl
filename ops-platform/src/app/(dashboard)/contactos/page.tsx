import { ContactosList } from '@/components/contactos/ContactosList'

export default function ContactosPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Contactos</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona proveedores y clientes
        </p>
      </div>
      <ContactosList />
    </div>
  )
}

