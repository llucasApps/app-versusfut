'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, Search, Mail, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/times', label: 'Meus Times', icon: Users },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/buscar', label: 'Buscar Times', icon: Search },
  { href: '/convites', label: 'Convites', icon: Mail },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-sm border-b border-[#FF6B35]/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="text-3xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
                VersusFut
              </div>
            </Link>
            
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
                        ? 'bg-[#FF6B35]/10 text-[#FF6B35] shadow-[0_0_20px_rgba(255,107,53,0.2)]'
                        : 'text-white/70 hover:text-[#FF6B35] hover:bg-[#FF6B35]/5'
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
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-sm border-b border-[#FF6B35]/10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
                VersusFut
              </div>
            </Link>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#FF6B35] hover:bg-[#FF6B35]/10 rounded-lg transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#0D0D0D] border-b border-[#FF6B35]/10 shadow-2xl">
            <div className="px-4 py-3 space-y-1">
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
                        ? 'bg-[#FF6B35]/10 text-[#FF6B35] shadow-[0_0_20px_rgba(255,107,53,0.2)]'
                        : 'text-white/70 hover:text-[#FF6B35] hover:bg-[#FF6B35]/5'
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
