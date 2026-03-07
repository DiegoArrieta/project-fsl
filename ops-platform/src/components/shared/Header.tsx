'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="p-2 bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
            <span className="text-2xl">🌲</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
              Forestal Santa Lucía
            </span>
            <span className="text-xs text-muted-foreground font-medium">Sistema de Gestión</span>
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
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-medium">Cerrar Sesión</span>
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
