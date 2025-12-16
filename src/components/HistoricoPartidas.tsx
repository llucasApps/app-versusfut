'use client';

import { useState, useEffect } from 'react';
import { supabase, Player, InternalMatch, InternalMatchStats, Match } from '@/lib/supabase';
import { History, Calendar, MapPin, Clock, Trophy, Target, Users, ChevronDown, ChevronUp, Filter } from 'lucide-react';

interface HistoricoPartidasProps {
  teamId: string;
  players: Player[];
}

type FilterType = 'all' | 'external' | 'internal';

interface MatchWithDetails extends Match {
  home_team?: { name: string; logo?: string };
  away_team?: { name: string; logo?: string };
}

export default function HistoricoPartidas({ teamId, players }: HistoricoPartidasProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [internalMatches, setInternalMatches] = useState<InternalMatch[]>([]);
  const [externalMatches, setExternalMatches] = useState<MatchWithDetails[]>([]);
  const [internalStats, setInternalStats] = useState<InternalMatchStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  // Carregar partidas
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Buscar partidas internas concluídas
      const { data: internalData } = await supabase
        .from('internal_matches')
        .select('*')
        .eq('team_id', teamId)
        .eq('status', 'completed')
        .order('match_date', { ascending: false });

      if (internalData) {
        setInternalMatches(internalData);

        // Buscar estatísticas das partidas internas
        const { data: statsData } = await supabase
          .from('internal_match_stats')
          .select('*')
          .in('internal_match_id', internalData.map(m => m.id));

        if (statsData) {
          setInternalStats(statsData);
        }
      }

      // Buscar partidas externas (matches) onde o time participou
      const { data: externalData } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(name, logo),
          away_team:teams!matches_away_team_id_fkey(name, logo)
        `)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .eq('status', 'completed')
        .order('match_date', { ascending: false });

      if (externalData) {
        setExternalMatches(externalData);
      }

      setLoading(false);
    };

    fetchData();
  }, [teamId]);

  // Formatar data
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Obter estatísticas de uma partida interna
  const getInternalMatchStats = (matchId: string) => {
    const stats = internalStats.filter(s => s.internal_match_id === matchId);
    const totalGoals = stats.reduce((sum, s) => sum + s.goals, 0);
    const totalAssists = stats.reduce((sum, s) => sum + s.assists, 0);

    // Top scorer desta partida
    const topScorer = stats.length > 0
      ? stats.reduce((prev, curr) => curr.goals > prev.goals ? curr : prev)
      : null;

    // Top assister desta partida
    const topAssister = stats.length > 0
      ? stats.reduce((prev, curr) => curr.assists > prev.assists ? curr : prev)
      : null;

    return { stats, totalGoals, totalAssists, topScorer, topAssister };
  };

  // Obter nome do jogador
  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player?.name || 'Jogador';
  };

  // Obter foto do jogador
  const getPlayerPhoto = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player?.foto;
  };

  // Combinar e ordenar todas as partidas
  const getAllMatches = () => {
    const internal = internalMatches.map(m => ({
      ...m,
      type: 'internal' as const,
      sortDate: new Date(m.match_date).getTime()
    }));

    const external = externalMatches.map(m => ({
      ...m,
      type: 'external' as const,
      sortDate: new Date(m.match_date).getTime()
    }));

    let combined = [...internal, ...external];

    // Aplicar filtro
    if (filter === 'internal') {
      combined = combined.filter(m => m.type === 'internal');
    } else if (filter === 'external') {
      combined = combined.filter(m => m.type === 'external');
    }

    // Ordenar por data (mais recente primeiro)
    return combined.sort((a, b) => b.sortDate - a.sortDate);
  };

  const allMatches = getAllMatches();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Histórico de Jogos
        </h2>
        <p className="text-white/60">Todas as partidas jogadas pelo time</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'all'
              ? 'bg-[#FF6B00] text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          Todos ({internalMatches.length + externalMatches.length})
        </button>
        <button
          onClick={() => setFilter('external')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'external'
              ? 'bg-[#FF6B00] text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          Partidas Externas ({externalMatches.length})
        </button>
        <button
          onClick={() => setFilter('internal')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'internal'
              ? 'bg-[#FF6B00] text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          Partidas Internas ({internalMatches.length})
        </button>
      </div>

      {/* Lista de Partidas */}
      {allMatches.length > 0 ? (
        <div className="space-y-4">
          {allMatches.map((match) => {
            const isExpanded = expandedMatch === match.id;

            if (match.type === 'internal') {
              const internalMatch = match as InternalMatch & { type: 'internal'; sortDate: number };
              const { stats, totalGoals, totalAssists, topScorer, topAssister } = getInternalMatchStats(internalMatch.id);

              return (
                <div
                  key={`internal-${internalMatch.id}`}
                  className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl overflow-hidden"
                >
                  {/* Header da partida */}
                  <div
                    className="p-4 cursor-pointer hover:bg-white/5 transition-all"
                    onClick={() => setExpandedMatch(isExpanded ? null : internalMatch.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                          <Users className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">Partida Interna</span>
                            <span className="text-purple-500 text-xs bg-purple-500/20 px-2 py-0.5 rounded">
                              Pelada
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-white/40 text-sm mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(internalMatch.match_date)}
                            </span>
                            {internalMatch.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {internalMatch.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[#FF6B00] font-bold">{totalGoals} gols</p>
                          <p className="text-white/40 text-sm">{totalAssists} assist.</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-white/40" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-white/40" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detalhes expandidos */}
                  {isExpanded && (
                    <div className="border-t border-white/10 p-4">
                      {stats.length > 0 ? (
                        <div className="space-y-4">
                          {/* Destaques */}
                          <div className="grid grid-cols-2 gap-4">
                            {topScorer && topScorer.goals > 0 && (
                              <div className="bg-yellow-500/10 rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Trophy className="w-4 h-4 text-yellow-500" />
                                  <span className="text-yellow-500 text-sm font-medium">Artilheiro</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getPlayerPhoto(topScorer.player_id) ? (
                                    <img
                                      src={getPlayerPhoto(topScorer.player_id)!}
                                      alt=""
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 text-xs font-bold">
                                      {getPlayerName(topScorer.player_id).charAt(0)}
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-white text-sm">{getPlayerName(topScorer.player_id)}</p>
                                    <p className="text-yellow-500 text-xs">{topScorer.goals} gols</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {topAssister && topAssister.assists > 0 && (
                              <div className="bg-blue-500/10 rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Target className="w-4 h-4 text-blue-500" />
                                  <span className="text-blue-500 text-sm font-medium">Garçom</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getPlayerPhoto(topAssister.player_id) ? (
                                    <img
                                      src={getPlayerPhoto(topAssister.player_id)!}
                                      alt=""
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 text-xs font-bold">
                                      {getPlayerName(topAssister.player_id).charAt(0)}
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-white text-sm">{getPlayerName(topAssister.player_id)}</p>
                                    <p className="text-blue-500 text-xs">{topAssister.assists} assist.</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Lista completa de estatísticas */}
                          <div>
                            <h4 className="text-white/60 text-sm font-medium mb-2">Estatísticas Completas</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {stats
                                .filter(s => s.goals > 0 || s.assists > 0)
                                .sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists))
                                .map(stat => (
                                  <div key={stat.id} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                                    {getPlayerPhoto(stat.player_id) ? (
                                      <img
                                        src={getPlayerPhoto(stat.player_id)!}
                                        alt=""
                                        className="w-6 h-6 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00] text-xs font-bold">
                                        {getPlayerName(stat.player_id).charAt(0)}
                                      </div>
                                    )}
                                    <span className="text-white text-xs flex-1 truncate">
                                      {getPlayerName(stat.player_id)}
                                    </span>
                                    <div className="flex gap-2 text-xs">
                                      {stat.goals > 0 && (
                                        <span className="text-[#FF6B00]">{stat.goals}G</span>
                                      )}
                                      {stat.assists > 0 && (
                                        <span className="text-blue-500">{stat.assists}A</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-white/40 text-center py-4">
                          Nenhuma estatística registrada para esta partida
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            } else {
              // Partida externa
              const externalMatch = match as MatchWithDetails & { type: 'external'; sortDate: number };
              const isHome = externalMatch.home_team_id === teamId;
              const opponent = isHome ? externalMatch.away_team : externalMatch.home_team;
              const teamScore = isHome ? externalMatch.score_home : externalMatch.score_away;
              const opponentScore = isHome ? externalMatch.score_away : externalMatch.score_home;

              let resultColor = 'text-white/60';
              let resultBg = 'bg-white/10';
              let resultText = 'E';

              if (teamScore != null && opponentScore != null) {
                if (teamScore > opponentScore) {
                  resultColor = 'text-green-500';
                  resultBg = 'bg-green-500/20';
                  resultText = 'V';
                } else if (teamScore < opponentScore) {
                  resultColor = 'text-red-500';
                  resultBg = 'bg-red-500/20';
                  resultText = 'D';
                }
              }

              return (
                <div
                  key={`external-${externalMatch.id}`}
                  className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${resultBg}`}>
                        <span className={`text-lg font-bold ${resultColor}`}>{resultText}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">vs {opponent?.name || 'Time adversário'}</span>
                          <span className="text-[#FF6B00] text-xs bg-[#FF6B00]/20 px-2 py-0.5 rounded">
                            {isHome ? 'Casa' : 'Fora'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-white/40 text-sm mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(externalMatch.match_date)}
                          </span>
                          {externalMatch.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {externalMatch.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {teamScore !== null && opponentScore !== null ? (
                        <p className={`text-2xl font-bold ${resultColor}`}>
                          {teamScore} x {opponentScore}
                        </p>
                      ) : (
                        <p className="text-white/40">Sem placar</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
          <div className="text-center py-12 text-white/40">
            <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Nenhuma partida no histórico</p>
            <p className="text-sm">As partidas jogadas aparecerão aqui</p>
          </div>
        </div>
      )}
    </div>
  );
}
