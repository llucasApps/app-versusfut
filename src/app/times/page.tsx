'use client';

import Navigation from '@/components/Navigation';
import { myTeams } from '@/lib/mock-data';
import { Plus, Users, Trophy, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TimesPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Meus Times
            </h1>
            <p className="text-white/60 text-base sm:text-lg">Gerencie seus times e acompanhe o desempenho</p>
          </div>
          
          <Link href="/times/criar" className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] flex items-center gap-2 justify-center sm:justify-start">
            <Plus className="w-5 h-5" />
            Criar Time
          </Link>
        </div>

        {/* Times Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myTeams.map((team) => {
            const totalMatches = team.stats.wins + team.stats.draws + team.stats.losses;
            const winRate = totalMatches > 0 ? Math.round((team.stats.wins / totalMatches) * 100) : 0;
            
            return (
              <div key={team.id} className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl overflow-hidden hover:border-[#FF6B00]/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.15)] group">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">{team.logo}</div>
                    <div className="px-3 py-1 bg-[#FF6B00]/10 rounded-full">
                      <div className="text-[#FF6B00] text-sm font-bold">{winRate}% vitórias</div>
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
                    <div className="p-2 bg-[#FF6B00]/10 rounded-lg">
                      <Users className="w-5 h-5 text-[#FF6B00]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white/60 text-sm">Jogadores</div>
                      <div className="text-white font-bold text-lg">{team.players.length}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#FF6B00]/10 rounded-lg">
                      <Trophy className="w-5 h-5 text-[#FF6B00]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white/60 text-sm">Vitórias</div>
                      <div className="text-white font-bold text-lg">{team.stats.wins}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#FF6B00]/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-[#FF6B00]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white/60 text-sm">Gols Marcados</div>
                      <div className="text-white font-bold text-lg">{team.stats.goalsFor}</div>
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
                        className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] h-full rounded-full transition-all duration-500"
                        style={{ width: `${winRate}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-0 flex gap-3">
                  <Link 
                    href={`/times/${team.id}`}
                    className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 text-center flex items-center justify-center gap-2"
                  >
                    Ver Detalhes
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link 
                    href={`/times/${team.id}/elenco`}
                    className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center"
                  >
                    <Users className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State (if no teams) */}
        {myTeams.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">⚽</div>
            <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Nenhum time cadastrado
            </h3>
            <p className="text-white/60 mb-8">Crie seu primeiro time e comece a jogar!</p>
            <Link href="/times/criar" className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)]">
              <Plus className="w-5 h-5" />
              Criar Primeiro Time
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
