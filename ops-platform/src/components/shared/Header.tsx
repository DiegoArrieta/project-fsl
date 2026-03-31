'use client'

import { useState, useEffect, startTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getAppVersion } from '@/lib/app-version'
import { LogOut, User, Settings } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    startTransition(() => {
      setMounted(true)
    })
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border/70 bg-background shadow-sm transition-shadow group-hover:shadow-md">
            <Image
              src="/brand/logo.jpg"
              alt="Forestal Santa Lucía"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
              Forestal Santa Lucía
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Sistema de Gestión</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono tabular-nums leading-tight">
                v{getAppVersion()}
              </Badge>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {mounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-accent hover:shadow-md transition-all"
                >
                  <div className="p-1.5 bg-primary/10 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium hidden sm:inline">Usuario</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-semibold">Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onSelect={() => {
                    void signOut({ callbackUrl: '/login' })
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" aria-hidden />
                  <span className="font-medium">Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              className="flex items-center gap-2 hover:bg-accent hover:shadow-md transition-all"
              disabled
            >
              <div className="p-1.5 bg-primary/10 rounded-full">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium hidden sm:inline">Usuario</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
