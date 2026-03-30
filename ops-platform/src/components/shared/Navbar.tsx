'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Users,
  BarChart3,
  Building2,
  Calendar,
  Calculator,
  Landmark,
  Package,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/operaciones', label: 'Operaciones', icon: FileText },
  { href: '/presupuestos', label: 'Presupuestos', icon: Calculator },
  { href: '/ordenes-compra', label: 'Órdenes de Compra', icon: ShoppingCart },
  { href: '/empresas', label: 'Empresas', icon: Building2 },
  { href: '/empresas-factoring', label: 'Emp. factoring', icon: Landmark },
  { href: '/tipos-pallet', label: 'Pallets', icon: Package },
  { href: '/eventos', label: 'Eventos', icon: Calendar },
  { href: '/contactos', label: 'Contactos', icon: Users },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto">
        <div className="flex h-14 items-center gap-2 px-4 lg:px-8 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md hover:shadow-lg'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
