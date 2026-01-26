'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, ShoppingCart, Users, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/operaciones', label: 'Operaciones', icon: FileText },
  { href: '/ordenes-compra', label: 'Órdenes de Compra', icon: ShoppingCart },
  { href: '/contactos', label: 'Contactos', icon: Users },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-muted/40">
      <div className="container mx-auto">
        <div className="flex h-12 items-center gap-1 px-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-background hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

