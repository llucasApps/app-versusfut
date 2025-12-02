'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, Search, Mail, Menu, X, Settings, User, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/times', label: 'Meus Times', icon: Users },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/buscar', label: 'Buscar Times', icon: Search },
  { href: '/convites', label: 'Convites', icon: Mail },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'owner' | 'player'>('owner');

  // Carregar modo de visualização do localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('viewMode') as 'owner' | 'player' | null;
    if (savedMode) {
      setViewMode(savedMode);
    }
  }, []);

  // Salvar modo de visualização no localStorage
  const handleViewModeChange = (mode: 'owner' | 'player') => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
    // Disparar evento customizado para outros componentes reagirem
    window.dispatchEvent(new CustomEvent('viewModeChange', { detail: mode }));
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-sm border-b border-[#FF6B00]/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="text-3xl font-bold bg-gradient-to-r from-[#FF6B00] to-[#FF8C42] bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
                VersusFut
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => handleViewModeChange('owner')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300 ${
                    viewMode === 'owner'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_20px_rgba(255,107,0,0.3)]'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Dono de Time</span>
                </button>
                <button
                  onClick={() => handleViewModeChange('player')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300 ${
                    viewMode === 'player'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_20px_rgba(255,107,0,0.3)]'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Jogador</span>
                </button>
              </div>

              {/* Navigation Items */}
              <div className="flex items-center gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
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
              <div className="text-2xl font-bold bg-gradient-to-r from-[#FF6B00] to-[#FF8C42] bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
              {/* View Mode Toggle Mobile */}
              <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 mb-2">
                <button
                  onClick={() => handleViewModeChange('owner')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all duration-300 ${
                    viewMode === 'owner'
                      ? 'bg-[#FF6B00] text-white'
                      : 'text-white/60'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span className="text-xs font-medium">Dono</span>
                </button>
                <button
                  onClick={() => handleViewModeChange('player')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all duration-300 ${
                    viewMode === 'player'
                      ? 'bg-[#FF6B00] text-white'
                      : 'text-white/60'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="text-xs font-medium">Jogador</span>
                </button>
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
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
            </div>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-16 md:h-20" />
    </>
  );
}
