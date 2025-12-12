'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

// Rotas que não precisam de autenticação
const publicRoutes = ['/login', '/register', '/forgot-password'];

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    if (!loading && !user && !isPublicRoute) {
      router.replace('/login');
    }
  }, [user, loading, router, isPublicRoute]);

  // Mostra loading enquanto verifica autenticação (apenas para rotas protegidas)
  if (loading && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#FF6B00] animate-spin" />
          <p className="text-white/60">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está logado e não é rota pública, mostra loading (vai redirecionar)
  if (!user && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#FF6B00] animate-spin" />
          <p className="text-white/60">Redirecionando...</p>
        </div>
      </div>
    );
  }

  // Rota pública ou usuário autenticado
  return <>{children}</>;
}
