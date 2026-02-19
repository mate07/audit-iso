'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white shadow-md">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-lg font-bold tracking-tight text-[#1a365d]">
              SGA <span className="text-primary">ISO 27001</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Sistema de Gestión Académico
            </span>
          </div>
        </div>
        
        {isAuthenticated && (
          <div className="hidden md:flex md:items-center md:gap-8">
            <Link href="/" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">
              Escritorio
            </Link>
            <Link href="/audit/team" className="text-sm font-semibold text-primary transition-colors hover:text-primary/80 border-b-2 border-primary pb-0.5">
              Auditoría
            </Link>
            <Link href="/audit/report" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">
              Reportes
            </Link>
          </div>
        )}

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4 border-l border-border pl-4">
              <div className="flex flex-col items-end -space-y-1 hidden sm:flex">
                <span className="text-xs font-bold text-foreground">{user?.nombre} {user?.apellido}</span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {user?.roleId === 'r-admin' ? 'Administrador' : 'Auditor'}
                </span>
              </div>
              <div className="h-9 w-9 rounded-full bg-accent border border-accent-foreground/10 flex items-center justify-center shadow-sm">
                <span className="text-xs font-bold text-accent-foreground">
                  {user?.nombre?.[0]}{user?.apellido?.[0]}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-destructive gap-1 px-2"
                onClick={logout}
              >
                <LogOut className="h-4 v-4" />
              </Button>
            </div>
          ) : (
            <Link href="/register">
              <Button size="sm" className="font-bold">Registrarse</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
