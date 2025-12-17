'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, Menu, X, User, ChevronDown, Users2, Target, Trophy } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/times', label: 'Meus Times', icon: Users },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
];

const partidasSubmenu = [
  { href: '/partidas/interna', label: 'Partida Interna', icon: Users2, description: 'Peladas entre jogadores do time' },
  { href: '/partidas/adversario', label: 'Partida contra Adversário', icon: Target, description: 'Marcar jogos e convites' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [partidasMenuOpen, setPartidasMenuOpen] = useState(false);
  const [mobilePartidasOpen, setMobilePartidasOpen] = useState(false);
  const partidasMenuRef = useRef<HTMLDivElement>(null);
  const { signOut, user, profile } = useAuth();
  const [pendingInvitesCount, setPendingInvitesCount] = useState(0);

  // Fechar menu de partidas ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (partidasMenuRef.current && !partidasMenuRef.current.contains(event.target as Node)) {
        setPartidasMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Verificar se está em uma página de partidas
  const isPartidasActive = pathname.startsWith('/partidas');

  // Buscar contagem de convites pendentes
  useEffect(() => {
    const fetchPendingInvites = async () => {
      if (!user) {
        setPendingInvitesCount(0);
        return;
      }

      // Buscar times do usuário
      const { data: myTeams } = await supabase
        .from('teams')
        .select('id')
        .eq('owner_id', user.id);

      if (!myTeams || myTeams.length === 0) {
        setPendingInvitesCount(0);
        return;
      }

      const teamIds = myTeams.map(t => t.id);

      // Contar convites recebidos pendentes
      const { count } = await supabase
        .from('match_invites')
        .select('*', { count: 'exact', head: true })
        .in('to_team_id', teamIds)
        .eq('status', 'pending');

      setPendingInvitesCount(count || 0);
    };

    fetchPendingInvites();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchPendingInvites, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-sm border-b border-[#FF6B00]/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div 
                className="text-3xl font-normal italic bg-gradient-to-r from-[#FF6B00] to-[#FF8C42] bg-clip-text text-transparent logo-pulse" 
                style={{ fontFamily: 'Italiana, serif', letterSpacing: '0.05em' }}
              >
                VersusFut
              </div>
            </Link>
            
            <div className="flex items-center gap-2">
              {/* Navigation Items */}
              <div className="flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'bg-[#FF6B00]/10 text-[#FF6B00] shadow-[0_0_20px_rgba(255,107,0,0.2)]'
                          : 'text-white/70 hover:text-[#FF6B00] hover:bg-[#FF6B00]/5'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                  );
                })}

                {/* Partidas Dropdown */}
                <div className="relative" ref={partidasMenuRef}>
                  <button
                    onClick={() => setPartidasMenuOpen(!partidasMenuOpen)}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-300 ${
                      isPartidasActive
                        ? 'bg-[#FF6B00]/10 text-[#FF6B00] shadow-[0_0_20px_rgba(255,107,0,0.2)]'
                        : 'text-white/70 hover:text-[#FF6B00] hover:bg-[#FF6B00]/5'
                    }`}
                  >
                    <Trophy className="w-4 h-4" />
                    <span className="font-medium text-sm">Partidas</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${partidasMenuOpen ? 'rotate-180' : ''}`} />
                    {pendingInvitesCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 animate-pulse">
                        {pendingInvitesCount > 99 ? '99+' : pendingInvitesCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {partidasMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-xl shadow-2xl overflow-hidden">
                      {partidasSubmenu.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        const showBadge = item.href === '/partidas/adversario' && pendingInvitesCount > 0;
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setPartidasMenuOpen(false)}
                            className={`flex items-start gap-3 px-4 py-3 transition-all ${
                              isActive
                                ? 'bg-[#FF6B00]/10 text-[#FF6B00]'
                                : 'text-white/70 hover:bg-[#FF6B00]/5 hover:text-[#FF6B00]'
                            }`}
                          >
                            <Icon className="w-5 h-5 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{item.label}</span>
                                {showBadge && (
                                  <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-4 flex items-center justify-center px-1">
                                    {pendingInvitesCount > 99 ? '99+' : pendingInvitesCount}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-white/40 mt-0.5">{item.description}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Perfil */}
                <Link
                  href="/configuracoes"
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-300 ${
                    pathname === '/configuracoes'
                      ? 'bg-[#FF6B00]/10 text-[#FF6B00] shadow-[0_0_20px_rgba(255,107,0,0.2)]'
                      : 'text-white/70 hover:text-[#FF6B00] hover:bg-[#FF6B00]/5'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium text-sm">Perfil</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-sm border-b border-[#FF6B00]/10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div 
                className="text-2xl font-normal italic bg-gradient-to-r from-[#FF6B00] to-[#FF8C42] bg-clip-text text-transparent logo-pulse" 
                style={{ fontFamily: 'Italiana, serif', letterSpacing: '0.05em' }}
              >
                VersusFut
              </div>
            </Link>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-lg transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#0D0D0D] border-b border-[#FF6B00]/10 shadow-2xl">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-[#FF6B00]/10 text-[#FF6B00] shadow-[0_0_20px_rgba(255,107,0,0.2)]'
                        : 'text-white/70 hover:text-[#FF6B00] hover:bg-[#FF6B00]/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}

              {/* Partidas Accordion Mobile */}
              <div>
                <button
                  onClick={() => setMobilePartidasOpen(!mobilePartidasOpen)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    isPartidasActive
                      ? 'bg-[#FF6B00]/10 text-[#FF6B00]'
                      : 'text-white/70 hover:text-[#FF6B00] hover:bg-[#FF6B00]/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5" />
                    <span className="font-medium">Partidas</span>
                    {pendingInvitesCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                        {pendingInvitesCount > 99 ? '99+' : pendingInvitesCount}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobilePartidasOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {mobilePartidasOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#FF6B00]/20 pl-4">
                    {partidasSubmenu.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      const showBadge = item.href === '/partidas/adversario' && pendingInvitesCount > 0;
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setMobilePartidasOpen(false);
                          }}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                            isActive
                              ? 'bg-[#FF6B00]/10 text-[#FF6B00]'
                              : 'text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/5'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm">{item.label}</span>
                          {showBadge && (
                            <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-4 flex items-center justify-center px-1 ml-auto">
                              {pendingInvitesCount > 99 ? '99+' : pendingInvitesCount}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Perfil Mobile */}
              <Link
                href="/configuracoes"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  pathname === '/configuracoes'
                    ? 'bg-[#FF6B00]/10 text-[#FF6B00] shadow-[0_0_20px_rgba(255,107,0,0.2)]'
                    : 'text-white/70 hover:text-[#FF6B00] hover:bg-[#FF6B00]/5'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Perfil</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-16 md:h-20" />
    </>
  );
}
