'use client';

import Navigation from '@/components/Navigation';
import { myTeams } from '@/lib/mock-data';
import { ArrowLeft, Edit, Users, Trophy, TrendingUp, Target, Calendar, MapPin, Clipboard } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

type Tab = 'resumo' | 'elenco' | 'taticas';

export default function TeamDetailPage() {
  const params = useParams();
  const team = myTeams.find(t => t.id === params.id);
  const [activeTab, setActiveTab] = useState<Tab>('resumo');

  if (!team) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚽</div>
          <h2 className="text-2xl font-bold text-white mb-2">Time não encontrado</h2>
          <Link href="/times" className="text-[#FF6B00] hover:text-[#FF6B00]/80">
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
        <Link href="/times" className="inline-flex items-center gap-2 text-white/60 hover:text-[#FF6B00] transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          Voltar para Meus Times
        </Link>

        {/* Team Header */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6 sm:p-8 mb-8">
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
            
            <Link href={`/times/${team.id}/editar`} className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Editar Time
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FF6B00]/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-[#FF6B00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{team.players.length}</div>
              <div className="text-white/60 text-sm">Jogadores</div>
            </div>
            <div className="bg-[#FF6B00]/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-[#FF6B00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{totalMatches}</div>
              <div className="text-white/60 text-sm">Partidas</div>
            </div>
            <div className="bg-[#FF6B00]/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-[#FF6B00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{winRate}%</div>
              <div className="text-white/60 text-sm">Aproveitamento</div>
            </div>
            <div className="bg-[#FF6B00]/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-[#FF6B00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {goalDifference > 0 ? '+' : ''}{goalDifference}
              </div>
              <div className="text-white/60 text-sm">Saldo de Gols</div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('resumo')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'resumo'
                ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Resumo
          </button>
          <button
            onClick={() => setActiveTab('elenco')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'elenco'
                ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Elenco
          </button>
          <button
            onClick={() => setActiveTab('taticas')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'taticas'
                ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Táticas
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'resumo' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Stats */}
            <div className="lg:col-span-2 space-y-8">
              {/* Performance Stats */}
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Estatísticas de Desempenho
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-[#FF6B00]" />
                        <span className="text-white font-medium">Vitórias</span>
                      </div>
                      <span className="text-[#FF6B00] font-bold text-xl">{team.stats.wins}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] h-full rounded-full"
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
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Estatísticas de Gols
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#FF6B00] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
                    <div className={`text-4xl font-bold mb-2 ${goalDifference > 0 ? 'text-[#FF6B00]' : 'text-white/60'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
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
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Ações Rápidas
                </h3>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveTab('elenco')}
                    className="w-full flex items-center gap-3 p-4 bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 rounded-xl transition-all group"
                  >
                    <Users className="w-5 h-5 text-[#FF6B00]" />
                    <div className="flex-1 text-left">
                      <div className="text-white font-medium">Ver Elenco</div>
                      <div className="text-white/60 text-sm">{team.players.length} jogadores</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('taticas')}
                    className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
                  >
                    <Clipboard className="w-5 h-5 text-white/60 group-hover:text-[#FF6B00]" />
                    <div className="flex-1 text-left">
                      <div className="text-white font-medium">Ver Táticas</div>
                      <div className="text-white/60 text-sm">Prancheta tática</div>
                    </div>
                  </button>

                  <Link href="/agenda" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group">
                    <Calendar className="w-5 h-5 text-white/60 group-hover:text-[#FF6B00]" />
                    <div className="flex-1">
                      <div className="text-white font-medium">Ver Agenda</div>
                      <div className="text-white/60 text-sm">Próximos jogos</div>
                    </div>
                  </Link>

                  <Link href="/buscar" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group">
                    <MapPin className="w-5 h-5 text-white/60 group-hover:text-[#FF6B00]" />
                    <div className="flex-1">
                      <div className="text-white font-medium">Buscar Adversários</div>
                      <div className="text-white/60 text-sm">Encontre times</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Top Players */}
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
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
                          index === 0 ? 'bg-[#FF6B00]/20 text-[#FF6B00]' : 'bg-white/10 text-white/60'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">{player.name}</div>
                          <div className="text-white/60 text-xs">{player.position}</div>
                        </div>
                        <div className="text-[#FF6B00] font-bold">{player.stats.goals}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'elenco' && (
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Elenco Completo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.players.map((player) => (
                <div key={player.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-[#FF6B00]/20 rounded-full flex items-center justify-center text-[#FF6B00] font-bold text-lg">
                      {player.number}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{player.name}</div>
                      <div className="text-white/60 text-sm">{player.position}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <div className="text-white/60">Gols</div>
                      <div className="text-[#FF6B00] font-bold">{player.stats.goals}</div>
                    </div>
                    <div>
                      <div className="text-white/60">Assist.</div>
                      <div className="text-white font-bold">{player.stats.assists}</div>
                    </div>
                    <div>
                      <div className="text-white/60">Jogos</div>
                      <div className="text-white font-bold">{player.stats.matches}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'taticas' && (
          <div>
            <Link 
              href={`/times/${team.id}/taticas`}
              className="block bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-8 hover:border-[#FF6B00]/40 transition-all"
            >
              <div className="text-center">
                <Clipboard className="w-16 h-16 text-[#FF6B00] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Táticas de {team.name}
                </h2>
                <p className="text-white/60 mb-6">
                  Gerencie as táticas e formações do seu time
                </p>
                <div className="inline-flex items-center gap-2 text-[#FF6B00] font-medium">
                  Acessar Prancheta Tática
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </div>
              </div>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
