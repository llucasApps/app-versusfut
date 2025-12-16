'use client';

import { useState } from 'react';
import { Search, Mail } from 'lucide-react';
import BuscarContent from '@/components/BuscarContent';
import ConvitesContent from '@/components/ConvitesContent';
import Navigation from '@/components/Navigation';

type Tab = 'marcar' | 'convites';

export default function PartidaAdversarioPage() {
  const [activeTab, setActiveTab] = useState<Tab>('marcar');

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navigation />
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Partida contra Adversário</h1>
          <p className="text-white/60">Encontre adversários e gerencie seus convites de partidas</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-[#1A1A1A] p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('marcar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'marcar'
                ? 'bg-[#FF6B00] text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Search className="w-4 h-4" />
            Marcar Jogo
          </button>
          <button
            onClick={() => setActiveTab('convites')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'convites'
                ? 'bg-[#FF6B00] text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail className="w-4 h-4" />
            Convites
          </button>
        </div>

        {/* Content */}
        {activeTab === 'marcar' && <BuscarContent />}
        {activeTab === 'convites' && <ConvitesContent />}
      </div>
    </div>
  );
}
