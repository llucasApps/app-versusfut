'use client';

import { useState, useEffect } from 'react';
import { supabase, Player, InternalMatch, InternalMatchStats } from '@/lib/supabase';
import { Plus, Trophy, Award, Shuffle, Calendar, MapPin, Clock, X, Check, Target, Users, Trash2, Edit, ChevronRight, Eye } from 'lucide-react';
import PartidaInternaDetalhes from './PartidaInternaDetalhes';

interface PartidasInternasProps {
  teamId: string;
  players: Player[];
  isOwnerMode: boolean;
}

interface PlayerWithStats extends Player {
  internal_goals: number;
  internal_assists: number;
}

interface RankingPlayer {
  id: string;
  name: string;
  foto: string | null;
  internal_goals: number;
  internal_assists: number;
}

interface SortedTeam {
  name: string;
  color: string;
  players: Player[];
}

export default function PartidasInternas({ teamId, players, isOwnerMode }: PartidasInternasProps) {
  // Estados
  const [internalMatches, setInternalMatches] = useState<InternalMatch[]>([]);
  const [internalStats, setInternalStats] = useState<InternalMatchStats[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal de agendar partida
  const [showAddMatchModal, setShowAddMatchModal] = useState(false);
  const [newMatch, setNewMatch] = useState({
    match_date: '',
    match_time: '',
    location: '',
    description: ''
  });
  const [savingMatch, setSavingMatch] = useState(false);
  
  // Modal de sorteio
  const [showSortearModal, setShowSortearModal] = useState(false);
  const [selectedPlayersForSort, setSelectedPlayersForSort] = useState<string[]>([]);
  const [playersPerTeam, setPlayersPerTeam] = useState(5);
  const [sortedTeams, setSortedTeams] = useState<SortedTeam[]>([]);
  const [hasSorted, setHasSorted] = useState(false);
  
  // Modal de detalhes da partida (novo componente completo)
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [selectedMatchForDetails, setSelectedMatchForDetails] = useState<InternalMatch | null>(null);

  // Carregar partidas internas
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Buscar partidas internas
      const { data: matchesData, error: matchesError } = await supabase
        .from('internal_matches')
        .select('*')
        .eq('team_id', teamId)
        .order('match_date', { ascending: false });
      
      if (matchesError) {
        console.error('Erro ao buscar partidas internas:', matchesError);
      } else {
        setInternalMatches(matchesData || []);
      }
      
      // Buscar estatísticas (só se houver partidas)
      const matchIds = (matchesData || []).map(m => m.id);
      if (matchIds.length > 0) {
        const { data: statsData, error: statsError } = await supabase
          .from('internal_match_stats')
          .select('*')
          .in('internal_match_id', matchIds);
        
        if (!statsError && statsData) {
          setInternalStats(statsData);
        } else {
          console.error('Erro ao buscar estatísticas:', statsError);
        }
      } else {
        setInternalStats([]);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [teamId]);

  // Calcular ranking de artilheiros e garçons internos
  const getInternalRanking = () => {
    const playerStatsMap: {[playerId: string]: {goals: number, assists: number}} = {};
    const guestStatsMap: {[guestName: string]: {goals: number, assists: number}} = {};
    
    internalStats.forEach(stat => {
      if (stat.player_id) {
        // Jogador do elenco
        if (!playerStatsMap[stat.player_id]) {
          playerStatsMap[stat.player_id] = { goals: 0, assists: 0 };
        }
        playerStatsMap[stat.player_id].goals += stat.goals;
        playerStatsMap[stat.player_id].assists += stat.assists;
      } else if (stat.guest_name) {
        // Convidado
        if (!guestStatsMap[stat.guest_name]) {
          guestStatsMap[stat.guest_name] = { goals: 0, assists: 0 };
        }
        guestStatsMap[stat.guest_name].goals += stat.goals;
        guestStatsMap[stat.guest_name].assists += stat.assists;
      }
    });
    
    // Jogadores do elenco com stats
    const playersWithStats: RankingPlayer[] = players.map(p => ({
      id: p.id,
      name: p.name,
      foto: p.foto || null,
      internal_goals: playerStatsMap[p.id]?.goals || 0,
      internal_assists: playerStatsMap[p.id]?.assists || 0
    }));
    
    // Convidados como "jogadores virtuais" para o ranking
    const guestsWithStats: RankingPlayer[] = Object.entries(guestStatsMap).map(([guestName, stats]) => ({
      id: `guest_${guestName}`,
      name: guestName,
      foto: null,
      internal_goals: stats.goals,
      internal_assists: stats.assists
    }));
    
    const allWithStats: RankingPlayer[] = [...playersWithStats, ...guestsWithStats];
    
    const topScorers = [...allWithStats]
      .filter(p => p.internal_goals > 0)
      .sort((a, b) => b.internal_goals - a.internal_goals)
      .slice(0, 5);
    
    const topAssisters = [...allWithStats]
      .filter(p => p.internal_assists > 0)
      .sort((a, b) => b.internal_assists - a.internal_assists)
      .slice(0, 5);
    
    return { topScorers, topAssisters };
  };

  const { topScorers, topAssisters } = getInternalRanking();

  // Agendar nova partida
  const handleAddMatch = async () => {
    if (!newMatch.match_date) return;
    
    setSavingMatch(true);
    
    const { data, error } = await supabase
      .from('internal_matches')
      .insert({
        team_id: teamId,
        match_date: newMatch.match_date,
        match_time: newMatch.match_time || null,
        location: newMatch.location || null,
        description: newMatch.description || null,
        status: 'scheduled'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao agendar partida:', error);
      alert('Erro ao agendar partida. Tente novamente.');
    } else {
      setInternalMatches([data, ...internalMatches]);
      setShowAddMatchModal(false);
      setNewMatch({ match_date: '', match_time: '', location: '', description: '' });
    }
    
    setSavingMatch(false);
  };

  // Cancelar partida
  const handleCancelMatch = async (matchId: string) => {
    if (!confirm('Deseja cancelar esta partida?')) return;
    
    const { error } = await supabase
      .from('internal_matches')
      .update({ status: 'cancelled' })
      .eq('id', matchId);
    
    if (error) {
      console.error('Erro ao cancelar partida:', error);
    } else {
      setInternalMatches(internalMatches.map(m => 
        m.id === matchId ? { ...m, status: 'cancelled' } : m
      ));
    }
  };

  // Excluir partida
  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm('Deseja excluir esta partida permanentemente?')) return;
    
    const { error } = await supabase
      .from('internal_matches')
      .delete()
      .eq('id', matchId);
    
    if (error) {
      console.error('Erro ao excluir partida:', error);
    } else {
      setInternalMatches(internalMatches.filter(m => m.id !== matchId));
    }
  };

  // Marcar partida como concluída
  const handleCompleteMatch = async (matchId: string) => {
    const { error } = await supabase
      .from('internal_matches')
      .update({ status: 'completed' })
      .eq('id', matchId);
    
    if (error) {
      console.error('Erro ao concluir partida:', error);
    } else {
      setInternalMatches(internalMatches.map(m => 
        m.id === matchId ? { ...m, status: 'completed' } : m
      ));
    }
  };

  // Sortear times
  const handleSortear = () => {
    const numTeams = Math.ceil(selectedPlayersForSort.length / playersPerTeam);
    
    if (selectedPlayersForSort.length < playersPerTeam) {
      alert(`Selecione pelo menos ${playersPerTeam} jogadores para formar um time.`);
      return;
    }
    
    if (numTeams < 2) {
      alert(`Selecione mais jogadores para formar pelo menos 2 times de ${playersPerTeam} jogadores.`);
      return;
    }
    
    const selectedPlayers = players.filter(p => selectedPlayersForSort.includes(p.id));
    const shuffled = [...selectedPlayers].sort(() => Math.random() - 0.5);
    
    const teamColors = ['#FF6B00', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
    const teamNames = ['Time A', 'Time B', 'Time C', 'Time D', 'Time E', 'Time F', 'Time G', 'Time H'];
    
    const teams: SortedTeam[] = [];
    for (let i = 0; i < numTeams; i++) {
      teams.push({
        name: teamNames[i],
        color: teamColors[i % teamColors.length],
        players: []
      });
    }
    
    // Distribuir jogadores - preenche cada time até o limite antes de ir pro próximo
    shuffled.forEach((player, index) => {
      const teamIndex = Math.floor(index / playersPerTeam);
      if (teamIndex < numTeams) {
        teams[teamIndex].players.push(player);
      } else {
        // Jogadores extras vão para os times existentes de forma distribuída
        teams[index % numTeams].players.push(player);
      }
    });
    
    setSortedTeams(teams);
    setHasSorted(true);
  };

  // Resetar sorteio
  const handleResetSorteio = () => {
    setSortedTeams([]);
    setHasSorted(false);
  };

  // Toggle seleção de jogador para sorteio
  const togglePlayerSelection = (playerId: string) => {
    if (selectedPlayersForSort.includes(playerId)) {
      setSelectedPlayersForSort(selectedPlayersForSort.filter(id => id !== playerId));
    } else {
      setSelectedPlayersForSort([...selectedPlayersForSort, playerId]);
    }
  };

  // Selecionar todos os jogadores disponíveis
  const selectAllAvailable = () => {
    const availableIds = players.filter(p => p.available).map(p => p.id);
    setSelectedPlayersForSort(availableIds);
  };


  // Formatar data
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Partidas agendadas (futuras ou em andamento)
  const upcomingMatches = internalMatches.filter(m => 
    m.status === 'scheduled' || m.status === 'in_progress'
  );

  // Partidas concluídas
  const completedMatches = internalMatches.filter(m => m.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Partidas Internas
          </h2>
          <p className="text-white/60">Treinos e peladas entre os jogadores do time</p>
        </div>
        {isOwnerMode && (
          <button
            onClick={() => setShowAddMatchModal(true)}
            className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white px-4 py-2 rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Agendar Partida
          </button>
        )}
      </div>

      {/* Ranking de Artilheiros e Garçons Internos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Artilheiro Interno */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-lg font-bold text-white">Artilheiro Interno</h3>
          </div>
          {topScorers.length > 0 ? (
            <div className="space-y-3">
              {topScorers.map((player, index) => (
                <div key={player.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-white/10 text-white/60'
                  }`}>
                    {index + 1}
                  </span>
                  {player.foto ? (
                    <img src={player.foto} alt={player.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00] text-sm font-bold">
                      {player.name.charAt(0)}
                    </div>
                  )}
                  <span className="flex-1 text-white">{player.name}</span>
                  <span className="text-[#FF6B00] font-bold">{player.internal_goals} gols</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/40">
              <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum gol registrado</p>
              <p className="text-sm">Os gols aparecerão aqui após as partidas</p>
            </div>
          )}
        </div>

        {/* Garçom Interno */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Award className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-white">Garçom Interno</h3>
          </div>
          {topAssisters.length > 0 ? (
            <div className="space-y-3">
              {topAssisters.map((player, index) => (
                <div key={player.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${
                    index === 0 ? 'bg-blue-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-white/10 text-white/60'
                  }`}>
                    {index + 1}
                  </span>
                  {player.foto ? (
                    <img src={player.foto} alt={player.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 text-sm font-bold">
                      {player.name.charAt(0)}
                    </div>
                  )}
                  <span className="flex-1 text-white">{player.name}</span>
                  <span className="text-blue-500 font-bold">{player.internal_assists} assist.</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/40">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma assistência registrada</p>
              <p className="text-sm">Registre o desempenho nas partidas</p>
            </div>
          )}
        </div>
      </div>

      {/* Sorteador de Times */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#FF6B00]/20 rounded-lg">
            <Shuffle className="w-6 h-6 text-[#FF6B00]" />
          </div>
          <h3 className="text-lg font-bold text-white">Sorteador de Times</h3>
        </div>
        <p className="text-white/60 mb-4">
          Selecione os jogadores disponíveis e sorteie times equilibrados para a pelada.
        </p>
        <button 
          onClick={() => {
            setShowSortearModal(true);
            setHasSorted(false);
            setSortedTeams([]);
            selectAllAvailable();
          }}
          className="flex items-center gap-2 bg-[#FF6B00]/20 hover:bg-[#FF6B00]/30 text-[#FF6B00] px-4 py-2 rounded-xl transition-all"
        >
          <Shuffle className="w-5 h-5" />
          Sortear Times
        </button>
      </div>

      {/* Lista de Partidas Agendadas */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Próximas Partidas</h3>
        {upcomingMatches.length > 0 ? (
          <div className="space-y-3">
            {upcomingMatches.map(match => (
              <div 
                key={match.id} 
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => {
                  setSelectedMatchForDetails(match);
                  setShowDetalhesModal(true);
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    match.status === 'in_progress' ? 'bg-green-500/20' : 'bg-[#FF6B00]/20'
                  }`}>
                    <Calendar className={`w-6 h-6 ${
                      match.status === 'in_progress' ? 'text-green-500' : 'text-[#FF6B00]'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{formatDate(match.match_date)}</span>
                      {match.match_time && (
                        <span className="text-white/60 text-sm flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {match.match_time.slice(0, 5)}
                        </span>
                      )}
                      {match.status === 'in_progress' && (
                        <span className="text-green-500 text-xs bg-green-500/20 px-2 py-0.5 rounded animate-pulse">
                          Em Andamento
                        </span>
                      )}
                    </div>
                    {match.location && (
                      <p className="text-white/40 text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {match.location}
                      </p>
                    )}
                    {match.description && (
                      <p className="text-white/40 text-sm">{match.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMatchForDetails(match);
                      setShowDetalhesModal(true);
                    }}
                    className="p-2 text-[#FF6B00] hover:bg-[#FF6B00]/20 rounded-lg transition-all"
                    title="Ver detalhes"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  {isOwnerMode && match.status === 'scheduled' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelMatch(match.id);
                        }}
                        className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-all"
                        title="Cancelar partida"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-white/40">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma partida agendada</p>
          </div>
        )}
      </div>

      {/* Partidas Concluídas (últimas 5) */}
      {completedMatches.length > 0 && (
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Partidas Recentes</h3>
          <div className="space-y-3">
            {completedMatches.slice(0, 5).map(match => {
              const matchStatsData = internalStats.filter(s => s.internal_match_id === match.id);
              const totalGoals = matchStatsData.reduce((sum, s) => sum + s.goals, 0);
              
              return (
                <div 
                  key={match.id} 
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedMatchForDetails(match);
                    setShowDetalhesModal(true);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-xl">
                      <Check className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{formatDate(match.match_date)}</span>
                        <span className="text-green-500 text-xs bg-green-500/20 px-2 py-0.5 rounded">
                          Concluída
                        </span>
                      </div>
                      {match.location && (
                        <p className="text-white/40 text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {match.location}
                        </p>
                      )}
                      <p className="text-white/60 text-sm">
                        {totalGoals} gols registrados
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMatchForDetails(match);
                        setShowDetalhesModal(true);
                      }}
                      className="p-2 text-[#FF6B00] hover:bg-[#FF6B00]/20 rounded-lg transition-all"
                      title="Ver detalhes"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {isOwnerMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMatch(match.id);
                        }}
                        className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-all"
                        title="Excluir partida"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    <ChevronRight className="w-5 h-5 text-white/40" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Agendar Partida */}
      {showAddMatchModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-md border border-[#FF6B00]/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Agendar Partida Interna</h3>
              <button onClick={() => setShowAddMatchModal(false)} className="text-white/60 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2 text-sm font-medium">Data *</label>
                <input
                  type="date"
                  value={newMatch.match_date}
                  onChange={(e) => setNewMatch({ ...newMatch, match_date: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-white/80 mb-2 text-sm font-medium">Horário</label>
                <input
                  type="time"
                  value={newMatch.match_time}
                  onChange={(e) => setNewMatch({ ...newMatch, match_time: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-white/80 mb-2 text-sm font-medium">Local</label>
                <input
                  type="text"
                  value={newMatch.location}
                  onChange={(e) => setNewMatch({ ...newMatch, location: e.target.value })}
                  placeholder="Ex: Quadra do Clube"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-white/80 mb-2 text-sm font-medium">Descrição</label>
                <textarea
                  value={newMatch.description}
                  onChange={(e) => setNewMatch({ ...newMatch, description: e.target.value })}
                  placeholder="Ex: Pelada de terça"
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-[#FF6B00] focus:outline-none resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddMatchModal(false)}
                className="flex-1 px-4 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddMatch}
                disabled={!newMatch.match_date || savingMatch}
                className="flex-1 px-4 py-3 bg-[#FF6B00] text-white rounded-xl hover:bg-[#FF6B00]/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingMatch ? 'Salvando...' : 'Agendar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sortear Times */}
      {showSortearModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-2xl border border-[#FF6B00]/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Sortear Times</h3>
              <button onClick={() => setShowSortearModal(false)} className="text-white/60 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {!hasSorted ? (
              <>
                {/* Configuração do sorteio */}
                <div className="mb-6">
                  <label className="block text-white/80 mb-2 text-sm font-medium">Jogadores por Time</label>
                  <div className="flex gap-2 flex-wrap">
                    {[2, 3, 4, 5, 6, 7, 8].map(num => (
                      <button
                        key={num}
                        onClick={() => setPlayersPerTeam(num)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          playersPerTeam === num
                            ? 'bg-[#FF6B00] text-white'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <p className="text-white/40 text-xs mt-2">
                    {selectedPlayersForSort.length > 0 && (
                      <>
                        {selectedPlayersForSort.length} jogadores selecionados = {Math.ceil(selectedPlayersForSort.length / playersPerTeam)} times
                        {selectedPlayersForSort.length % playersPerTeam !== 0 && (
                          <span className="text-yellow-500"> (sobram {selectedPlayersForSort.length % playersPerTeam})</span>
                        )}
                      </>
                    )}
                  </p>
                </div>
                
                {/* Seleção de jogadores */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-white/80 text-sm font-medium">
                      Selecionar Jogadores ({selectedPlayersForSort.length} selecionados)
                    </label>
                    <button
                      onClick={selectAllAvailable}
                      className="text-[#FF6B00] text-sm hover:underline"
                    >
                      Selecionar disponíveis
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                    {players.map(player => (
                      <button
                        key={player.id}
                        onClick={() => togglePlayerSelection(player.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                          selectedPlayersForSort.includes(player.id)
                            ? 'bg-[#FF6B00]/20 border border-[#FF6B00]'
                            : 'bg-white/5 border border-transparent hover:bg-white/10'
                        } ${!player.available ? 'opacity-50' : ''}`}
                      >
                        {player.foto ? (
                          <img src={player.foto} alt={player.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00] text-xs font-bold">
                            {player.name.charAt(0)}
                          </div>
                        )}
                        <span className="text-white text-sm truncate">{player.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={handleSortear}
                  disabled={selectedPlayersForSort.length < playersPerTeam * 2}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] text-white px-4 py-3 rounded-xl hover:bg-[#FF6B00]/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Shuffle className="w-5 h-5" />
                  Sortear Times ({playersPerTeam} por time)
                </button>
              </>
            ) : (
              <>
                {/* Resultado do sorteio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {sortedTeams.map((team, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-xl border-2"
                      style={{ borderColor: team.color, backgroundColor: `${team.color}10` }}
                    >
                      <h4 className="font-bold text-lg mb-3" style={{ color: team.color }}>
                        {team.name}
                      </h4>
                      <div className="space-y-2">
                        {team.players.map(player => (
                          <div key={player.id} className="flex items-center gap-2">
                            {player.foto ? (
                              <img src={player.foto} alt={player.name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ backgroundColor: `${team.color}30`, color: team.color }}
                              >
                                {player.name.charAt(0)}
                              </div>
                            )}
                            <span className="text-white text-sm">{player.name}</span>
                            <span className="text-white/40 text-xs">({player.position})</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-white/40 text-sm mt-3">
                        {team.players.length} jogadores
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleResetSorteio}
                    className="flex-1 px-4 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all"
                  >
                    Sortear Novamente
                  </button>
                  <button
                    onClick={() => setShowSortearModal(false)}
                    className="flex-1 px-4 py-3 bg-[#FF6B00] text-white rounded-xl hover:bg-[#FF6B00]/80 transition-all"
                  >
                    Fechar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Partida */}
      {showDetalhesModal && selectedMatchForDetails && (
        <PartidaInternaDetalhes
          match={selectedMatchForDetails}
          players={players}
          isOwnerMode={isOwnerMode}
          onClose={() => {
            setShowDetalhesModal(false);
            setSelectedMatchForDetails(null);
          }}
          onUpdate={(updatedMatch) => {
            setInternalMatches(internalMatches.map(m => 
              m.id === updatedMatch.id ? updatedMatch : m
            ));
            setSelectedMatchForDetails(updatedMatch);
          }}
        />
      )}
    </div>
  );
}
