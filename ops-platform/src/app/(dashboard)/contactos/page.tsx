import { ContactosList } from '@/components/contactos/ContactosList'

export default function ContactosPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Contactos</h1>
        <p className="text-lg text-muted-foreground">Gestiona proveedores y clientes de tu negocio</p>
      </div>
      <ContactosList />
    </div>
  )
}
