'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, Search, Mail, Menu, X, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  const handleLogout = () => {
    // Futuramente: implementar logout real
    // Por enquanto, apenas redireciona para a página inicial
    window.location.href = '/';
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
