'use client';

import Navigation from '@/components/Navigation';
import { opponentTeams, allTeams } from '@/lib/mock-data';
import { Search, Users, Trophy, TrendingUp, MapPin, Send } from 'lucide-react';
import { useState } from 'react';

export default function BuscarPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredTeams = opponentTeams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Buscar Times
          </h1>
          <p className="text-white/60 text-base sm:text-lg">Encontre adversários e desafie para uma partida</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Buscar times por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-xl py-4 px-12 text-white placeholder:text-white/40 focus:outline-none focus:border-[#00FF00]/40 transition-all"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-xl p-5">
            <div className="text-3xl font-bold text-[#00FF00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {opponentTeams.length}
            </div>
            <div className="text-white/60 text-sm">Times Disponíveis</div>
          </div>
          
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-xl p-5">
            <div className="text-3xl font-bold text-[#00FF00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {allTeams.length}
            </div>
            <div className="text-white/60 text-sm">Total de Times</div>
          </div>
          
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-xl p-5 col-span-2 sm:col-span-1">
            <div className="text-3xl font-bold text-[#00FF00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {filteredTeams.length}
            </div>
            <div className="text-white/60 text-sm">Resultados</div>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => {
            const totalMatches = team.stats.wins + team.stats.draws + team.stats.losses;
            const winRate = totalMatches > 0 ? Math.round((team.stats.wins / totalMatches) * 100) : 0;
            
            return (
              <div key={team.id} className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-2xl overflow-hidden hover:border-[#00FF00]/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,0,0.15)] group">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">{team.logo}</div>
                    <div className="px-3 py-1 bg-[#00FF00]/10 rounded-full">
                      <div className="text-[#00FF00] text-sm font-bold">{winRate}% vitórias</div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {team.name}
                  </h3>
                  <p className="text-white/60 text-sm">{team.description}</p>
                </div>

                {/* Stats */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#00FF00]/10 rounded-lg">
                      <Trophy className="w-5 h-5 text-[#00FF00]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white/60 text-sm">Vitórias</div>
                      <div className="text-white font-bold text-lg">{team.stats.wins}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#00FF00]/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-[#00FF00]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white/60 text-sm">Gols Marcados</div>
                      <div className="text-white font-bold text-lg">{team.stats.goalsFor}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#00FF00]/10 rounded-lg">
                      <Users className="w-5 h-5 text-[#00FF00]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white/60 text-sm">Partidas Jogadas</div>
                      <div className="text-white font-bold text-lg">{totalMatches}</div>
                    </div>
                  </div>

                  {/* Record */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/60">Desempenho</span>
                      <span className="text-white font-medium">{team.stats.wins}V - {team.stats.draws}E - {team.stats.losses}D</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#00FF00] to-[#00CC00] h-full rounded-full transition-all duration-500"
                        style={{ width: `${winRate}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-0 flex gap-3">
                  <button className="flex-1 bg-[#00FF00] hover:bg-[#00FF00]/90 text-black font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Desafiar
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTeams.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-20 h-20 text-white/20 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Nenhum time encontrado
            </h3>
            <p className="text-white/60">Tente buscar com outros termos ou limpe o filtro.</p>
          </div>
        )}
      </main>
    </div>
  );
}
