'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, Search, Mail, Menu, X, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/times', label: 'Meus Times', icon: Users },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/buscar', label: 'Marcar Jogo', icon: Search },
  { href: '/convites', label: 'Convites', icon: Mail },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut, user, profile } = useAuth();
  const [pendingInvitesCount, setPendingInvitesCount] = useState(0);

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
            
            <div className="flex items-center gap-4">
              {/* Navigation Items */}
              <div className="flex items-center gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const showBadge = item.href === '/convites' && pendingInvitesCount > 0;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'bg-[#FF6B00]/10 text-[#FF6B00] shadow-[0_0_20px_rgba(255,107,0,0.2)]'
                          : 'text-white/70 hover:text-[#FF6B00] hover:bg-[#FF6B00]/5'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {showBadge && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 animate-pulse">
                          {pendingInvitesCount > 99 ? '99+' : pendingInvitesCount}
                        </span>
                      )}
                    </Link>
                  );
                })}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-white/70 hover:text-red-500 hover:bg-red-500/10"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
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
            <div className="px-4 py-3 space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const showBadge = item.href === '/convites' && pendingInvitesCount > 0;
                
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
                    {showBadge && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 ml-auto">
                        {pendingInvitesCount > 99 ? '99+' : pendingInvitesCount}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Logout Button Mobile */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-white/70 hover:text-red-500 hover:bg-red-500/10"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-16 md:h-20" />
    </>
  );
}
