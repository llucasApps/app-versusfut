'use client';

import Navigation from '@/components/Navigation';
import { myTeams } from '@/lib/mock-data';
import { ArrowLeft, UserPlus, Trophy, Target, Calendar, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TeamRosterPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const team = myTeams.find(t => t.id === resolvedParams.id);

  if (!team) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚽</div>
          <h2 className="text-2xl font-bold text-white mb-2">Time não encontrado</h2>
          <Link href="/times" className="text-[#00FF00] hover:text-[#00FF00]/80">
            Voltar para Meus Times
          </Link>
        </div>
      </div>
    );
  }

  const availablePlayers = team.players.filter(p => p.available);
  const unavailablePlayers = team.players.filter(p => !p.available);

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back Button */}
        <Link href={`/times/${team.id}`} className="inline-flex items-center gap-2 text-white/60 hover:text-[#00FF00] transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          Voltar para {team.name}
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Elenco - {team.name}
            </h1>
            <p className="text-white/60">
              {team.players.length} jogadores • {availablePlayers.length} disponíveis
            </p>
          </div>
          
          <button className="bg-[#00FF00] hover:bg-[#00FF00]/90 text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,0,0.3)] flex items-center gap-2 justify-center sm:justify-start">
            <UserPlus className="w-5 h-5" />
            Adicionar Jogador
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-[#00FF00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {team.players.reduce((acc, p) => acc + p.stats.goals, 0)}
            </div>
            <div className="text-white/60 text-sm">Gols Totais</div>
          </div>
          
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-[#00FF00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {team.players.reduce((acc, p) => acc + p.stats.assists, 0)}
            </div>
            <div className="text-white/60 text-sm">Assistências</div>
          </div>
          
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-[#00FF00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {availablePlayers.length}
            </div>
            <div className="text-white/60 text-sm">Disponíveis</div>
          </div>
          
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white/60 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {unavailablePlayers.length}
            </div>
            <div className="text-white/60 text-sm">Indisponíveis</div>
          </div>
        </div>

        {/* Players List */}
        <div className="space-y-6">
          {/* Available Players */}
          {availablePlayers.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <CheckCircle className="w-6 h-6 text-[#00FF00]" />
                Jogadores Disponíveis
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availablePlayers.map((player) => (
                  <div key={player.id} className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-xl p-5 hover:border-[#00FF00]/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,0,0.1)]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#00FF00]/10 rounded-full flex items-center justify-center">
                          <span className="text-[#00FF00] font-bold text-lg">{player.number}</span>
                        </div>
                        <div>
                          <h3 className="text-white font-bold">{player.name}</h3>
                          <p className="text-white/60 text-sm">{player.position}</p>
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-[#00FF00]/20 rounded-full">
                        <CheckCircle className="w-4 h-4 text-[#00FF00]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Trophy className="w-4 h-4 text-[#00FF00]" />
                          <span className="text-[#00FF00] font-bold">{player.stats.goals}</span>
                        </div>
                        <div className="text-white/60 text-xs">Gols</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Target className="w-4 h-4 text-white/60" />
                          <span className="text-white font-bold">{player.stats.assists}</span>
                        </div>
                        <div className="text-white/60 text-xs">Assist.</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Calendar className="w-4 h-4 text-white/60" />
                          <span className="text-white font-bold">{player.stats.matches}</span>
                        </div>
                        <div className="text-white/60 text-xs">Jogos</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unavailable Players */}
          {unavailablePlayers.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <XCircle className="w-6 h-6 text-white/40" />
                Jogadores Indisponíveis
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unavailablePlayers.map((player) => (
                  <div key={player.id} className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-white/10 rounded-xl p-5 opacity-60">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                          <span className="text-white/60 font-bold text-lg">{player.number}</span>
                        </div>
                        <div>
                          <h3 className="text-white font-bold">{player.name}</h3>
                          <p className="text-white/60 text-sm">{player.position}</p>
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-white/10 rounded-full">
                        <XCircle className="w-4 h-4 text-white/40" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Trophy className="w-4 h-4 text-white/40" />
                          <span className="text-white/60 font-bold">{player.stats.goals}</span>
                        </div>
                        <div className="text-white/60 text-xs">Gols</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Target className="w-4 h-4 text-white/40" />
                          <span className="text-white/60 font-bold">{player.stats.assists}</span>
                        </div>
                        <div className="text-white/60 text-xs">Assist.</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Calendar className="w-4 h-4 text-white/40" />
                          <span className="text-white/60 font-bold">{player.stats.matches}</span>
                        </div>
                        <div className="text-white/60 text-xs">Jogos</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
