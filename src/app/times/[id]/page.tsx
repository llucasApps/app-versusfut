'use client';

import Navigation from '@/components/Navigation';
import { myTeams } from '@/lib/mock-data';
import { ArrowLeft, Edit, Users, Trophy, TrendingUp, Target, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function TeamDetailPage() {
  const params = useParams();
  const team = myTeams.find(t => t.id === params.id);

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

  const totalMatches = team.stats.wins + team.stats.draws + team.stats.losses;
  const winRate = totalMatches > 0 ? Math.round((team.stats.wins / totalMatches) * 100) : 0;
  const goalDifference = team.stats.goalsFor - team.stats.goalsAgainst;

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back Button */}
        <Link href="/times" className="inline-flex items-center gap-2 text-white/60 hover:text-[#00FF00] transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          Voltar para Meus Times
        </Link>

        {/* Team Header */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="text-6xl sm:text-7xl">{team.logo}</div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {team.name}
                </h1>
                <p className="text-white/60 text-lg">{team.description}</p>
              </div>
            </div>
            
            <Link href={`/times/${team.id}/editar`} className="bg-[#00FF00] hover:bg-[#00FF00]/90 text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,0,0.3)] flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Editar Time
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#00FF00]/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-[#00FF00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{team.players.length}</div>
              <div className="text-white/60 text-sm">Jogadores</div>
            </div>
            <div className="bg-[#00FF00]/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-[#00FF00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{totalMatches}</div>
              <div className="text-white/60 text-sm">Partidas</div>
            </div>
            <div className="bg-[#00FF00]/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-[#00FF00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{winRate}%</div>
              <div className="text-white/60 text-sm">Aproveitamento</div>
            </div>
            <div className="bg-[#00FF00]/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-[#00FF00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {goalDifference > 0 ? '+' : ''}{goalDifference}
              </div>
              <div className="text-white/60 text-sm">Saldo de Gols</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Stats */}
          <div className="lg:col-span-2 space-y-8">
            {/* Performance Stats */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Estatísticas de Desempenho
              </h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-[#00FF00]" />
                      <span className="text-white font-medium">Vitórias</span>
                    </div>
                    <span className="text-[#00FF00] font-bold text-xl">{team.stats.wins}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#00FF00] to-[#00CC00] h-full rounded-full"
                      style={{ width: `${totalMatches > 0 ? (team.stats.wins / totalMatches) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-white/60" />
                      <span className="text-white font-medium">Empates</span>
                    </div>
                    <span className="text-white font-bold text-xl">{team.stats.draws}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-white/40 h-full rounded-full"
                      style={{ width: `${totalMatches > 0 ? (team.stats.draws / totalMatches) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-red-500" />
                      <span className="text-white font-medium">Derrotas</span>
                    </div>
                    <span className="text-white/60 font-bold text-xl">{team.stats.losses}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-red-500/40 h-full rounded-full"
                      style={{ width: `${totalMatches > 0 ? (team.stats.losses / totalMatches) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Goals Stats */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Estatísticas de Gols
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#00FF00] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {team.stats.goalsFor}
                  </div>
                  <div className="text-white/60">Gols Marcados</div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-white/60 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {team.stats.goalsAgainst}
                  </div>
                  <div className="text-white/60">Gols Sofridos</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${goalDifference > 0 ? 'text-[#00FF00]' : 'text-white/60'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {goalDifference > 0 ? '+' : ''}{goalDifference}
                  </div>
                  <div className="text-white/60">Saldo</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Média de gols por partida</span>
                  <span className="text-white font-bold">
                    {totalMatches > 0 ? (team.stats.goalsFor / totalMatches).toFixed(1) : '0.0'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Ações Rápidas
              </h3>
              
              <div className="space-y-3">
                <Link href={`/times/${team.id}/elenco`} className="flex items-center gap-3 p-4 bg-[#00FF00]/10 hover:bg-[#00FF00]/20 rounded-xl transition-all group">
                  <Users className="w-5 h-5 text-[#00FF00]" />
                  <div className="flex-1">
                    <div className="text-white font-medium">Ver Elenco</div>
                    <div className="text-white/60 text-sm">{team.players.length} jogadores</div>
                  </div>
                </Link>

                <Link href="/agenda" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group">
                  <Calendar className="w-5 h-5 text-white/60 group-hover:text-[#00FF00]" />
                  <div className="flex-1">
                    <div className="text-white font-medium">Ver Agenda</div>
                    <div className="text-white/60 text-sm">Próximos jogos</div>
                  </div>
                </Link>

                <Link href="/buscar" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group">
                  <MapPin className="w-5 h-5 text-white/60 group-hover:text-[#00FF00]" />
                  <div className="flex-1">
                    <div className="text-white font-medium">Buscar Adversários</div>
                    <div className="text-white/60 text-sm">Encontre times</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Top Players */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Artilheiros
              </h3>
              
              <div className="space-y-3">
                {team.players
                  .sort((a, b) => b.stats.goals - a.stats.goals)
                  .slice(0, 3)
                  .map((player, index) => (
                    <div key={player.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-[#00FF00]/20 text-[#00FF00]' : 'bg-white/10 text-white/60'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{player.name}</div>
                        <div className="text-white/60 text-xs">{player.position}</div>
                      </div>
                      <div className="text-[#00FF00] font-bold">{player.stats.goals}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
