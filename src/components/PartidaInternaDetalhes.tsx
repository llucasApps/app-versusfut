'use client';

import { useState, useEffect } from 'react';
import { supabase, Player, InternalMatch, InternalMatchAttendance, InternalMatchTeam, InternalMatchTeamPlayer, InternalMatchGame, InternalMatchStats } from '@/lib/supabase';
import { X, Plus, Users, UserPlus, Shuffle, Play, Square, Trophy, Target, Check, ChevronRight, Trash2, Edit, Clock, MapPin, Calendar, Award, Swords, ArrowLeft, Save, UserMinus, RefreshCw } from 'lucide-react';

interface PartidaInternaDetalhesProps {
  match: InternalMatch;
  players: Player[];
  isOwnerMode: boolean;
  onClose: () => void;
  onUpdate: (match: InternalMatch) => void;
}

interface AttendanceWithPlayer extends InternalMatchAttendance {
  player?: Player;
}

interface TeamWithPlayers extends InternalMatchTeam {
  teamPlayers: {
    id: string;
    player_id?: string | null;
    guest_name?: string | null;
    player?: Player;
  }[];
}

export default function PartidaInternaDetalhes({ 
  match, 
  players, 
  isOwnerMode, 
  onClose,
  onUpdate 
}: PartidaInternaDetalhesProps) {
  // Estados
  const [currentMatch, setCurrentMatch] = useState<InternalMatch>(match);
  const [activeSection, setActiveSection] = useState<'lista' | 'times' | 'jogos'>('lista');
  const [loading, setLoading] = useState(true);
  
  // Lista de presença
  const [attendance, setAttendance] = useState<AttendanceWithPlayer[]>([]);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [guestNames, setGuestNames] = useState<string[]>(['']);
  
  // Times
  const [teams, setTeams] = useState<TeamWithPlayers[]>([]);
  const [showSortearModal, setShowSortearModal] = useState(false);
  const [playersPerTeam, setPlayersPerTeam] = useState(5);
  const [hasSorted, setHasSorted] = useState(false);
  const [tempSortedTeams, setTempSortedTeams] = useState<{name: string; color: string; players: AttendanceWithPlayer[]}[]>([]);
  
  // Jogos/Confrontos
  const [games, setGames] = useState<InternalMatchGame[]>([]);
  const [showAddGameModal, setShowAddGameModal] = useState(false);
  const [selectedTeamA, setSelectedTeamA] = useState<string>('');
  const [selectedTeamB, setSelectedTeamB] = useState<string>('');
  const [currentGame, setCurrentGame] = useState<InternalMatchGame | null>(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [gameStats, setGameStats] = useState<{[attendanceId: string]: {goals: number, assists: number}}>({});
  
  // Estatísticas salvas da partida
  const [savedStats, setSavedStats] = useState<{player_id?: string | null; guest_name?: string | null; goals: number; assists: number; game_id?: string | null}[]>([]);

  // Carregar dados
  useEffect(() => {
    fetchData();
  }, [match.id]);

  const fetchData = async () => {
    setLoading(true);
    
    // Buscar lista de presença
    const { data: attendanceData } = await supabase
      .from('internal_match_attendance')
      .select('*, player:players(*)')
      .eq('internal_match_id', match.id);
    
    if (attendanceData) {
      setAttendance(attendanceData);
    }
    
    // Buscar times
    const { data: teamsData } = await supabase
      .from('internal_match_teams')
      .select('*')
      .eq('internal_match_id', match.id);
    
    if (teamsData && teamsData.length > 0) {
      // Buscar jogadores de cada time
      const teamsWithPlayers: TeamWithPlayers[] = [];
      for (const team of teamsData) {
        const { data: teamPlayersData } = await supabase
          .from('internal_match_team_players')
          .select('*, player:players(*)')
          .eq('internal_match_team_id', team.id);
        
        teamsWithPlayers.push({
          ...team,
          teamPlayers: teamPlayersData || []
        });
      }
      setTeams(teamsWithPlayers);
    }
    
    // Buscar jogos/confrontos
    const { data: gamesData } = await supabase
      .from('internal_match_games')
      .select('*')
      .eq('internal_match_id', match.id)
      .order('game_order', { ascending: true });
    
    if (gamesData) {
      setGames(gamesData);
    }
    
    // Buscar estatísticas salvas da partida
    const { data: statsData } = await supabase
      .from('internal_match_stats')
      .select('*')
      .eq('internal_match_id', match.id);
    
    if (statsData) {
      setSavedStats(statsData);
    }
    
    setLoading(false);
  };

  // Formatar data
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Adicionar jogador do elenco à lista
  const handleAddPlayer = async (playerId: string) => {
    const exists = attendance.find(a => a.player_id === playerId);
    if (exists) return;
    
    const { data, error } = await supabase
      .from('internal_match_attendance')
      .insert({
        internal_match_id: match.id,
        player_id: playerId,
        confirmed: true
      })
      .select('*, player:players(*)')
      .single();
    
    if (!error && data) {
      setAttendance([...attendance, data]);
    }
  };

  // Adicionar convidados à lista (múltiplos de uma vez)
  const handleAddGuests = async () => {
    const validNames = guestNames.filter(name => name.trim() !== '');
    if (validNames.length === 0) return;
    
    const guestsToInsert = validNames.map(name => ({
      internal_match_id: match.id,
      guest_name: name.trim(),
      confirmed: true
    }));
    
    const { data, error } = await supabase
      .from('internal_match_attendance')
      .insert(guestsToInsert)
      .select();
    
    if (!error && data) {
      setAttendance([...attendance, ...data]);
      setGuestNames(['']);
      setShowAddGuestModal(false);
    }
  };

  // Adicionar mais um campo de convidado
  const addGuestField = () => {
    setGuestNames([...guestNames, '']);
  };

  // Atualizar nome do convidado em um índice específico
  const updateGuestName = (index: number, value: string) => {
    const newNames = [...guestNames];
    newNames[index] = value;
    setGuestNames(newNames);
  };

  // Remover campo de convidado
  const removeGuestField = (index: number) => {
    if (guestNames.length > 1) {
      setGuestNames(guestNames.filter((_, i) => i !== index));
    }
  };

  // Remover da lista de presença
  const handleRemoveAttendance = async (attendanceId: string) => {
    const { error } = await supabase
      .from('internal_match_attendance')
      .delete()
      .eq('id', attendanceId);
    
    if (!error) {
      setAttendance(attendance.filter(a => a.id !== attendanceId));
    }
  };

  // Sortear times
  const handleSortear = () => {
    const confirmedAttendance = attendance.filter(a => a.confirmed);
    const numTeams = Math.ceil(confirmedAttendance.length / playersPerTeam);
    
    if (confirmedAttendance.length < playersPerTeam * 2) {
      alert(`Precisa de pelo menos ${playersPerTeam * 2} jogadores para formar 2 times.`);
      return;
    }
    
    const shuffled = [...confirmedAttendance].sort(() => Math.random() - 0.5);
    
    const teamColors = ['#FF6B00', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
    const teamNames = ['Time A', 'Time B', 'Time C', 'Time D', 'Time E', 'Time F', 'Time G', 'Time H'];
    
    const newTeams: {name: string; color: string; players: AttendanceWithPlayer[]}[] = [];
    for (let i = 0; i < numTeams; i++) {
      newTeams.push({
        name: teamNames[i],
        color: teamColors[i % teamColors.length],
        players: []
      });
    }
    
    shuffled.forEach((player, index) => {
      const teamIndex = Math.floor(index / playersPerTeam);
      if (teamIndex < numTeams) {
        newTeams[teamIndex].players.push(player);
      } else {
        newTeams[index % numTeams].players.push(player);
      }
    });
    
    setTempSortedTeams(newTeams);
    setHasSorted(true);
  };

  // Salvar times sorteados
  const handleSaveTeams = async () => {
    // Deletar times antigos
    await supabase
      .from('internal_match_teams')
      .delete()
      .eq('internal_match_id', match.id);
    
    // Criar novos times
    const savedTeams: TeamWithPlayers[] = [];
    
    for (const tempTeam of tempSortedTeams) {
      const { data: teamData, error: teamError } = await supabase
        .from('internal_match_teams')
        .insert({
          internal_match_id: match.id,
          team_name: tempTeam.name,
          team_color: tempTeam.color
        })
        .select()
        .single();
      
      if (teamError || !teamData) continue;
      
      // Adicionar jogadores ao time
      const teamPlayersToInsert = tempTeam.players.map(p => ({
        internal_match_team_id: teamData.id,
        player_id: p.player_id || null,
        guest_name: p.guest_name || null,
        attendance_id: p.id
      }));
      
      const { data: playersData } = await supabase
        .from('internal_match_team_players')
        .insert(teamPlayersToInsert)
        .select('*, player:players(*)');
      
      savedTeams.push({
        ...teamData,
        teamPlayers: playersData || []
      });
    }
    
    setTeams(savedTeams);
    setShowSortearModal(false);
    setHasSorted(false);
    setTempSortedTeams([]);
  };

  // Adicionar confronto
  const handleAddGame = async () => {
    if (!selectedTeamA || !selectedTeamB || selectedTeamA === selectedTeamB) return;
    
    const { data, error } = await supabase
      .from('internal_match_games')
      .insert({
        internal_match_id: match.id,
        team_a_id: selectedTeamA,
        team_b_id: selectedTeamB,
        game_order: games.length + 1,
        status: 'pending'
      })
      .select()
      .single();
    
    if (!error && data) {
      setGames([...games, data]);
      setShowAddGameModal(false);
      setSelectedTeamA('');
      setSelectedTeamB('');
    }
  };

  // Iniciar pelada
  const handleStartMatch = async () => {
    const { error } = await supabase
      .from('internal_matches')
      .update({ 
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', match.id);
    
    if (!error) {
      const updated = { ...currentMatch, status: 'in_progress' as const, started_at: new Date().toISOString() };
      setCurrentMatch(updated);
      onUpdate(updated);
    }
  };

  // Encerrar pelada
  const handleEndMatch = async () => {
    if (!confirm('Deseja encerrar a pelada? Todas as estatísticas serão salvas.')) return;
    
    // 1. Atualizar status da partida interna
    const { error } = await supabase
      .from('internal_matches')
      .update({ 
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      .eq('id', match.id);
    
    if (!error) {
      // 2. Finalizar todos os jogos/confrontos que não foram finalizados
      const pendingGames = games.filter(g => g.status !== 'completed');
      if (pendingGames.length > 0) {
        await supabase
          .from('internal_match_games')
          .update({ 
            status: 'completed',
            ended_at: new Date().toISOString()
          })
          .eq('internal_match_id', match.id)
          .neq('status', 'completed');
        
        // Atualizar estado local dos jogos
        setGames(games.map(g => ({ ...g, status: 'completed' as const })));
      }
      
      const updated = { ...currentMatch, status: 'completed' as const, ended_at: new Date().toISOString() };
      setCurrentMatch(updated);
      onUpdate(updated);
    }
  };

  // Iniciar jogo específico
  const handleStartGame = async (gameId: string) => {
    const { error } = await supabase
      .from('internal_match_games')
      .update({ 
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', gameId);
    
    if (!error) {
      setGames(games.map(g => g.id === gameId ? { ...g, status: 'in_progress' as const } : g));
    }
  };

  // Abrir modal de jogo para registrar placar
  const openGameModal = (game: InternalMatchGame) => {
    setCurrentGame(game);
    setGameStats({});
    setShowGameModal(true);
  };

  // Salvar resultado do jogo
  const handleSaveGameResult = async () => {
    if (!currentGame) return;
    
    // Atualizar placar do jogo
    const { error: gameError } = await supabase
      .from('internal_match_games')
      .update({ 
        score_a: currentGame.score_a,
        score_b: currentGame.score_b,
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      .eq('id', currentGame.id);
    
    if (gameError) {
      alert('Erro ao salvar resultado.');
      return;
    }
    
    // Salvar estatísticas individuais
    const statsToInsert = Object.entries(gameStats)
      .filter(([_, stats]) => stats.goals > 0 || stats.assists > 0)
      .map(([attendanceId, stats]) => {
        const att = attendance.find(a => a.id === attendanceId);
        return {
          internal_match_id: match.id,
          game_id: currentGame.id,
          player_id: att?.player_id || null,
          guest_name: att?.guest_name || null,
          goals: stats.goals,
          assists: stats.assists
        };
      });
    
    if (statsToInsert.length > 0) {
      await supabase
        .from('internal_match_stats')
        .insert(statsToInsert);
    }
    
    // Atualizar estado local
    setGames(games.map(g => 
      g.id === currentGame.id 
        ? { ...g, score_a: currentGame.score_a, score_b: currentGame.score_b, status: 'completed' as const }
        : g
    ));
    
    setShowGameModal(false);
    setCurrentGame(null);
  };

  // Obter nome do time
  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.team_name || 'Time';
  };

  // Obter cor do time
  const getTeamColor = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.team_color || '#FF6B00';
  };

  // Obter jogadores de um time
  const getTeamPlayers = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.teamPlayers || [];
  };

  // Jogadores do elenco que ainda não estão na lista
  const availablePlayers = players.filter(p => 
    !attendance.find(a => a.player_id === p.id)
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="w-8 h-8 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={onClose}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            
            {/* Status Badge */}
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentMatch.status === 'scheduled' ? 'bg-yellow-500/20 text-yellow-500' :
              currentMatch.status === 'in_progress' ? 'bg-green-500/20 text-green-500' :
              currentMatch.status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
              'bg-red-500/20 text-red-500'
            }`}>
              {currentMatch.status === 'scheduled' ? 'Agendada' :
               currentMatch.status === 'in_progress' ? 'Em Andamento' :
               currentMatch.status === 'completed' ? 'Concluída' : 'Cancelada'}
            </div>
          </div>

          {/* Info da Partida */}
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6 mb-6">
            <h1 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Partida Interna
            </h1>
            <div className="flex flex-wrap gap-4 text-white/60">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FF6B00]" />
                {formatDate(currentMatch.match_date)}
              </span>
              {currentMatch.match_time && (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF6B00]" />
                  {currentMatch.match_time.slice(0, 5)}
                </span>
              )}
              {currentMatch.location && (
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF6B00]" />
                  {currentMatch.location}
                </span>
              )}
            </div>
            
            {/* Botões de ação */}
            {isOwnerMode && currentMatch.status === 'scheduled' && (
              <button
                onClick={handleStartMatch}
                className="mt-4 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition-all"
              >
                <Play className="w-5 h-5" />
                Iniciar Pelada
              </button>
            )}
            
            {isOwnerMode && currentMatch.status === 'in_progress' && (
              <button
                onClick={handleEndMatch}
                className="mt-4 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition-all"
              >
                <Square className="w-5 h-5" />
                Encerrar Pelada
              </button>
            )}
          </div>

          {/* Navegação por seções */}
          <div className="flex gap-2 mb-6 border-b border-white/10">
            <button
              onClick={() => setActiveSection('lista')}
              className={`px-4 py-3 font-medium transition-all ${
                activeSection === 'lista'
                  ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Lista ({attendance.length})
              </span>
            </button>
            <button
              onClick={() => setActiveSection('times')}
              className={`px-4 py-3 font-medium transition-all ${
                activeSection === 'times'
                  ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Shuffle className="w-4 h-4" />
                Times ({teams.length})
              </span>
            </button>
            <button
              onClick={() => setActiveSection('jogos')}
              className={`px-4 py-3 font-medium transition-all ${
                activeSection === 'jogos'
                  ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Swords className="w-4 h-4" />
                Jogos ({games.length})
              </span>
            </button>
          </div>

          {/* Seção: Lista de Presença */}
          {activeSection === 'lista' && (
            <div className="space-y-4">
              {/* Ações */}
              {isOwnerMode && currentMatch.status !== 'completed' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddPlayerModal(true)}
                    className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white px-4 py-2 rounded-xl transition-all"
                  >
                    <UserPlus className="w-5 h-5" />
                    Adicionar do Elenco
                  </button>
                  <button
                    onClick={() => setShowAddGuestModal(true)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Adicionar Convidado
                  </button>
                </div>
              )}
              
              {/* Lista */}
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-4">
                {attendance.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {attendance.map((att, index) => (
                      <div 
                        key={att.id}
                        className="flex items-center gap-2 p-3 bg-white/5 rounded-xl group"
                      >
                        <span className="w-6 h-6 flex items-center justify-center bg-[#FF6B00]/20 text-[#FF6B00] text-xs font-bold rounded-full">
                          {index + 1}
                        </span>
                        {att.player?.foto ? (
                          <img src={att.player.foto} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00] text-xs font-bold">
                            {(att.player?.name || att.guest_name || '?').charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">
                            {att.player?.name || att.guest_name}
                          </p>
                          {att.guest_name && (
                            <p className="text-white/40 text-xs">Convidado</p>
                          )}
                        </div>
                        {isOwnerMode && currentMatch.status !== 'completed' && (
                          <button
                            onClick={() => handleRemoveAttendance(att.id)}
                            className="p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/40">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum jogador na lista</p>
                    <p className="text-sm">Adicione jogadores do elenco ou convidados</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Seção: Times */}
          {activeSection === 'times' && (
            <div className="space-y-4">
              {/* Ações */}
              {isOwnerMode && currentMatch.status !== 'completed' && attendance.length >= 4 && (
                <button
                  onClick={() => {
                    setShowSortearModal(true);
                    setHasSorted(false);
                    setTempSortedTeams([]);
                  }}
                  className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white px-4 py-2 rounded-xl transition-all"
                >
                  <Shuffle className="w-5 h-5" />
                  {teams.length > 0 ? 'Sortear Novamente' : 'Sortear Times'}
                </button>
              )}
              
              {/* Times */}
              {teams.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {teams.map(team => (
                    <div 
                      key={team.id}
                      className="p-4 rounded-xl border-2"
                      style={{ borderColor: team.team_color || '#FF6B00', backgroundColor: `${team.team_color}10` }}
                    >
                      <h4 className="font-bold text-lg mb-3" style={{ color: team.team_color || '#FF6B00' }}>
                        {team.team_name}
                      </h4>
                      <div className="space-y-2">
                        {team.teamPlayers.map(tp => (
                          <div key={tp.id} className="flex items-center gap-2">
                            {tp.player?.foto ? (
                              <img src={tp.player.foto} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ backgroundColor: `${team.team_color || '#FF6B00'}30`, color: team.team_color || '#FF6B00' }}
                              >
                                {(tp.player?.name || tp.guest_name || '?').charAt(0)}
                              </div>
                            )}
                            <span className="text-white text-sm">{tp.player?.name || tp.guest_name}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-white/40 text-sm mt-3">
                        {team.teamPlayers.length} jogadores
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
                  <div className="text-center py-8 text-white/40">
                    <Shuffle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum time formado</p>
                    <p className="text-sm">Adicione jogadores à lista e faça o sorteio</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Seção: Jogos/Confrontos */}
          {activeSection === 'jogos' && (
            <div className="space-y-4">
              {/* Ações */}
              {isOwnerMode && teams.length >= 2 && currentMatch.status !== 'completed' && (
                <button
                  onClick={() => setShowAddGameModal(true)}
                  className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white px-4 py-2 rounded-xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar Confronto
                </button>
              )}
              
              {/* Resumo da Partida Encerrada */}
              {currentMatch.status === 'completed' && games.length > 0 && (
                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-green-500/30 rounded-2xl p-6 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-6 h-6 text-green-500" />
                    <h3 className="text-lg font-bold text-white">Resumo da Pelada</h3>
                  </div>
                  
                  {/* Estatísticas Gerais */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-[#FF6B00]">{games.length}</p>
                      <p className="text-white/60 text-sm">Jogos</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-[#FF6B00]">
                        {games.reduce((acc, g) => acc + g.score_a + g.score_b, 0)}
                      </p>
                      <p className="text-white/60 text-sm">Gols</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-[#FF6B00]">{attendance.length}</p>
                      <p className="text-white/60 text-sm">Jogadores</p>
                    </div>
                  </div>
                  
                  {/* Artilheiros e Garçons */}
                  {savedStats.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Artilheiros */}
                      <div className="bg-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="w-5 h-5 text-[#FF6B00]" />
                          <h4 className="font-bold text-white">Artilheiros</h4>
                        </div>
                        <div className="space-y-2">
                          {(() => {
                            const goalScorers = savedStats
                              .filter(s => s.goals > 0)
                              .reduce((acc, s) => {
                                const key = s.player_id || s.guest_name || '';
                                if (!acc[key]) {
                                  acc[key] = { ...s, goals: 0 };
                                }
                                acc[key].goals += s.goals;
                                return acc;
                              }, {} as {[key: string]: typeof savedStats[0]});
                            
                            const sorted = Object.values(goalScorers).sort((a, b) => b.goals - a.goals).slice(0, 5);
                            
                            if (sorted.length === 0) {
                              return <p className="text-white/40 text-sm">Nenhum gol registrado</p>;
                            }
                            
                            return sorted.map((stat, idx) => {
                              const player = stat.player_id 
                                ? attendance.find(a => a.player_id === stat.player_id)?.player 
                                : null;
                              const name = player?.name || stat.guest_name || 'Desconhecido';
                              
                              return (
                                <div key={idx} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[#FF6B00] font-bold text-sm">{idx + 1}º</span>
                                    <span className="text-white text-sm">{name}</span>
                                  </div>
                                  <span className="text-[#FF6B00] font-bold">{stat.goals} gols</span>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                      
                      {/* Garçons */}
                      <div className="bg-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Award className="w-5 h-5 text-blue-500" />
                          <h4 className="font-bold text-white">Garçons</h4>
                        </div>
                        <div className="space-y-2">
                          {(() => {
                            const assisters = savedStats
                              .filter(s => s.assists > 0)
                              .reduce((acc, s) => {
                                const key = s.player_id || s.guest_name || '';
                                if (!acc[key]) {
                                  acc[key] = { ...s, assists: 0 };
                                }
                                acc[key].assists += s.assists;
                                return acc;
                              }, {} as {[key: string]: typeof savedStats[0]});
                            
                            const sorted = Object.values(assisters).sort((a, b) => b.assists - a.assists).slice(0, 5);
                            
                            if (sorted.length === 0) {
                              return <p className="text-white/40 text-sm">Nenhuma assistência registrada</p>;
                            }
                            
                            return sorted.map((stat, idx) => {
                              const player = stat.player_id 
                                ? attendance.find(a => a.player_id === stat.player_id)?.player 
                                : null;
                              const name = player?.name || stat.guest_name || 'Desconhecido';
                              
                              return (
                                <div key={idx} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-blue-500 font-bold text-sm">{idx + 1}º</span>
                                    <span className="text-white text-sm">{name}</span>
                                  </div>
                                  <span className="text-blue-500 font-bold">{stat.assists} assist.</span>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Lista de Jogos */}
              {games.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <Swords className="w-5 h-5 text-[#FF6B00]" />
                    Confrontos
                  </h4>
                  {games.map((game, index) => (
                    <div 
                      key={game.id}
                      className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-white/40 text-sm">Jogo {index + 1}</span>
                          <div className="flex items-center gap-3">
                            <span 
                              className="font-bold text-sm sm:text-base"
                              style={{ color: getTeamColor(game.team_a_id) }}
                            >
                              {getTeamName(game.team_a_id)}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xl sm:text-2xl font-bold text-white">{game.score_a}</span>
                              <span className="text-white/40">x</span>
                              <span className="text-xl sm:text-2xl font-bold text-white">{game.score_b}</span>
                            </div>
                            <span 
                              className="font-bold text-sm sm:text-base"
                              style={{ color: getTeamColor(game.team_b_id) }}
                            >
                              {getTeamName(game.team_b_id)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {game.status === 'pending' && isOwnerMode && currentMatch.status === 'in_progress' && (
                            <button
                              onClick={() => {
                                handleStartGame(game.id);
                                openGameModal({ ...game, status: 'in_progress' });
                              }}
                              className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm transition-all"
                            >
                              <Play className="w-4 h-4" />
                              Iniciar
                            </button>
                          )}
                          {game.status === 'in_progress' && isOwnerMode && (
                            <button
                              onClick={() => openGameModal(game)}
                              className="flex items-center gap-1 bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white px-3 py-1 rounded-lg text-sm transition-all"
                            >
                              <Edit className="w-4 h-4" />
                              Registrar
                            </button>
                          )}
                          {game.status === 'completed' && (
                            <span className="text-green-500 text-sm flex items-center gap-1">
                              <Check className="w-4 h-4" />
                              Finalizado
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Mostrar gols e assistências do jogo quando finalizado */}
                      {game.status === 'completed' && savedStats.filter(s => s.game_id === game.id && (s.goals > 0 || s.assists > 0)).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="flex flex-wrap gap-3 text-sm">
                            {savedStats.filter(s => s.game_id === game.id && s.goals > 0).map((stat, idx) => {
                              const player = stat.player_id 
                                ? attendance.find(a => a.player_id === stat.player_id)?.player 
                                : null;
                              const name = player?.name || stat.guest_name || '?';
                              return (
                                <span key={`goal-${idx}`} className="flex items-center gap-1 text-white/70">
                                  <Target className="w-3 h-3 text-[#FF6B00]" />
                                  {name} ({stat.goals})
                                </span>
                              );
                            })}
                            {savedStats.filter(s => s.game_id === game.id && s.assists > 0).map((stat, idx) => {
                              const player = stat.player_id 
                                ? attendance.find(a => a.player_id === stat.player_id)?.player 
                                : null;
                              const name = player?.name || stat.guest_name || '?';
                              return (
                                <span key={`assist-${idx}`} className="flex items-center gap-1 text-white/70">
                                  <Award className="w-3 h-3 text-blue-500" />
                                  {name} ({stat.assists})
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
                  <div className="text-center py-8 text-white/40">
                    <Swords className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum confronto agendado</p>
                    <p className="text-sm">Monte os times primeiro e adicione confrontos</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Adicionar Jogador do Elenco */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-md border border-[#FF6B00]/20 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Adicionar do Elenco</h3>
              <button onClick={() => setShowAddPlayerModal(false)} className="text-white/60 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {availablePlayers.length > 0 ? (
              <div className="space-y-2">
                {availablePlayers.map(player => (
                  <button
                    key={player.id}
                    onClick={() => {
                      handleAddPlayer(player.id);
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                  >
                    {player.foto ? (
                      <img src={player.foto} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00] font-bold">
                        {player.name.charAt(0)}
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-white font-medium">{player.name}</p>
                      <p className="text-white/40 text-sm">{player.position}</p>
                    </div>
                    <Plus className="w-5 h-5 text-[#FF6B00] ml-auto" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-white/40 text-center py-4">Todos os jogadores já estão na lista</p>
            )}
          </div>
        </div>
      )}

      {/* Modal: Adicionar Convidados */}
      {showAddGuestModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-md border border-[#FF6B00]/20 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Adicionar Convidados</h3>
              <button onClick={() => { setShowAddGuestModal(false); setGuestNames(['']); }} className="text-white/60 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-3 mb-4">
              {guestNames.map((name, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => updateGuestName(index, e.target.value)}
                    placeholder={`Nome do convidado ${index + 1}`}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-[#FF6B00] focus:outline-none"
                    autoFocus={index === guestNames.length - 1}
                  />
                  {guestNames.length > 1 && (
                    <button
                      onClick={() => removeGuestField(index)}
                      className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {/* Botão para adicionar mais um campo */}
            <button
              onClick={addGuestField}
              className="w-full flex items-center justify-center gap-2 mb-4 py-2 border border-dashed border-white/20 text-white/60 rounded-xl hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all"
            >
              <Plus className="w-5 h-5" />
              Adicionar mais um convidado
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={() => { setShowAddGuestModal(false); setGuestNames(['']); }}
                className="flex-1 px-4 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddGuests}
                disabled={!guestNames.some(n => n.trim() !== '')}
                className="flex-1 px-4 py-3 bg-[#FF6B00] text-white rounded-xl hover:bg-[#FF6B00]/80 transition-all disabled:opacity-50"
              >
                Adicionar ({guestNames.filter(n => n.trim() !== '').length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Sortear Times */}
      {showSortearModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-2xl border border-[#FF6B00]/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Sortear Times</h3>
              <button onClick={() => setShowSortearModal(false)} className="text-white/60 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {!hasSorted ? (
              <>
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
                    {attendance.length} jogadores na lista = {Math.ceil(attendance.length / playersPerTeam)} times
                  </p>
                </div>
                
                <button
                  onClick={handleSortear}
                  disabled={attendance.length < playersPerTeam * 2}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF6B00] text-white px-4 py-3 rounded-xl hover:bg-[#FF6B00]/80 transition-all disabled:opacity-50"
                >
                  <Shuffle className="w-5 h-5" />
                  Sortear Times
                </button>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {tempSortedTeams.map((team, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-xl border-2"
                      style={{ borderColor: team.color, backgroundColor: `${team.color}10` }}
                    >
                      <h4 className="font-bold text-lg mb-3" style={{ color: team.color }}>
                        {team.name}
                      </h4>
                      <div className="space-y-2">
                        {team.players.map(att => (
                          <div key={att.id} className="flex items-center gap-2">
                            {att.player?.foto ? (
                              <img src={att.player.foto} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ backgroundColor: `${team.color}30`, color: team.color }}
                              >
                                {(att.player?.name || att.guest_name || '?').charAt(0)}
                              </div>
                            )}
                            <span className="text-white text-sm">{att.player?.name || att.guest_name}</span>
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
                    onClick={() => setHasSorted(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Sortear Novamente
                  </button>
                  <button
                    onClick={handleSaveTeams}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#FF6B00] text-white rounded-xl hover:bg-[#FF6B00]/80 transition-all"
                  >
                    <Save className="w-5 h-5" />
                    Salvar Times
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal: Adicionar Confronto */}
      {showAddGameModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-md border border-[#FF6B00]/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Adicionar Confronto</h3>
              <button onClick={() => setShowAddGameModal(false)} className="text-white/60 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Botão Sortear Aleatório */}
            <button
              onClick={() => {
                const availableTeams = [...teams];
                if (availableTeams.length >= 2) {
                  const shuffled = availableTeams.sort(() => Math.random() - 0.5);
                  setSelectedTeamA(shuffled[0].id);
                  setSelectedTeamB(shuffled[1].id);
                }
              }}
              className="w-full flex items-center justify-center gap-2 mb-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
            >
              <Shuffle className="w-5 h-5" />
              Sortear Times Aleatoriamente
            </button>
            
            <div className="space-y-4">
              <select
                value={selectedTeamA}
                onChange={(e) => setSelectedTeamA(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
              >
                <option value="">Selecione o primeiro time...</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.team_name}</option>
                ))}
              </select>
              
              <div className="text-center text-white/40 font-bold">vs</div>
              
              <select
                value={selectedTeamB}
                onChange={(e) => setSelectedTeamB(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
              >
                <option value="">Selecione o segundo time...</option>
                {teams.filter(t => t.id !== selectedTeamA).map(team => (
                  <option key={team.id} value={team.id}>{team.team_name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddGameModal(false)}
                className="flex-1 px-4 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddGame}
                disabled={!selectedTeamA || !selectedTeamB}
                className="flex-1 px-4 py-3 bg-[#FF6B00] text-white rounded-xl hover:bg-[#FF6B00]/80 transition-all disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Registrar Resultado do Jogo */}
      {showGameModal && currentGame && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-2xl border border-[#FF6B00]/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Registrar Resultado</h3>
              <button onClick={() => setShowGameModal(false)} className="text-white/60 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Placar */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="text-center">
                <p className="font-bold mb-2" style={{ color: getTeamColor(currentGame.team_a_id) }}>
                  {getTeamName(currentGame.team_a_id)}
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={currentGame.score_a}
                  onChange={(e) => setCurrentGame({ ...currentGame, score_a: parseInt(e.target.value) || 0 })}
                  className="w-20 h-20 text-4xl font-bold text-center bg-white/10 border border-white/20 rounded-xl text-white focus:border-[#FF6B00] focus:outline-none [appearance:textfield]"
                />
              </div>
              <span className="text-3xl text-white/40">x</span>
              <div className="text-center">
                <p className="font-bold mb-2" style={{ color: getTeamColor(currentGame.team_b_id) }}>
                  {getTeamName(currentGame.team_b_id)}
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={currentGame.score_b}
                  onChange={(e) => setCurrentGame({ ...currentGame, score_b: parseInt(e.target.value) || 0 })}
                  className="w-20 h-20 text-4xl font-bold text-center bg-white/10 border border-white/20 rounded-xl text-white focus:border-[#FF6B00] focus:outline-none [appearance:textfield]"
                />
              </div>
            </div>
            
            {/* Estatísticas por jogador */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium">Estatísticas Individuais</h4>
                <div className="flex items-center gap-4 text-xs text-white/60">
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-[#FF6B00]" />
                    Gols
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-blue-500" />
                    Assist.
                  </span>
                </div>
              </div>
              
              {/* Time A */}
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${getTeamColor(currentGame.team_a_id)}10` }}>
                <p className="font-medium mb-2" style={{ color: getTeamColor(currentGame.team_a_id) }}>
                  {getTeamName(currentGame.team_a_id)}
                </p>
                <div className="space-y-2">
                  {getTeamPlayers(currentGame.team_a_id).map(tp => {
                    const att = attendance.find(a => 
                      (a.player_id && a.player_id === tp.player_id) || 
                      (a.guest_name && a.guest_name === tp.guest_name)
                    );
                    if (!att) return null;
                    
                    return (
                      <div key={tp.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
                        <span className="text-white text-sm flex-1">{tp.player?.name || tp.guest_name}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4 text-[#FF6B00]" />
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={gameStats[att.id]?.goals || 0}
                              onChange={(e) => setGameStats({
                                ...gameStats,
                                [att.id]: {
                                  ...gameStats[att.id],
                                  goals: parseInt(e.target.value) || 0,
                                  assists: gameStats[att.id]?.assists || 0
                                }
                              })}
                              className="w-12 bg-white/10 border border-white/10 rounded px-2 py-1 text-white text-center text-sm focus:border-[#FF6B00] focus:outline-none [appearance:textfield]"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-blue-500" />
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={gameStats[att.id]?.assists || 0}
                              onChange={(e) => setGameStats({
                                ...gameStats,
                                [att.id]: {
                                  ...gameStats[att.id],
                                  goals: gameStats[att.id]?.goals || 0,
                                  assists: parseInt(e.target.value) || 0
                                }
                              })}
                              className="w-12 bg-white/10 border border-white/10 rounded px-2 py-1 text-white text-center text-sm focus:border-[#FF6B00] focus:outline-none [appearance:textfield]"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Time B */}
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${getTeamColor(currentGame.team_b_id)}10` }}>
                <p className="font-medium mb-2" style={{ color: getTeamColor(currentGame.team_b_id) }}>
                  {getTeamName(currentGame.team_b_id)}
                </p>
                <div className="space-y-2">
                  {getTeamPlayers(currentGame.team_b_id).map(tp => {
                    const att = attendance.find(a => 
                      (a.player_id && a.player_id === tp.player_id) || 
                      (a.guest_name && a.guest_name === tp.guest_name)
                    );
                    if (!att) return null;
                    
                    return (
                      <div key={tp.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
                        <span className="text-white text-sm flex-1">{tp.player?.name || tp.guest_name}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4 text-[#FF6B00]" />
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={gameStats[att.id]?.goals || 0}
                              onChange={(e) => setGameStats({
                                ...gameStats,
                                [att.id]: {
                                  ...gameStats[att.id],
                                  goals: parseInt(e.target.value) || 0,
                                  assists: gameStats[att.id]?.assists || 0
                                }
                              })}
                              className="w-12 bg-white/10 border border-white/10 rounded px-2 py-1 text-white text-center text-sm focus:border-[#FF6B00] focus:outline-none [appearance:textfield]"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-blue-500" />
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={gameStats[att.id]?.assists || 0}
                              onChange={(e) => setGameStats({
                                ...gameStats,
                                [att.id]: {
                                  ...gameStats[att.id],
                                  goals: gameStats[att.id]?.goals || 0,
                                  assists: parseInt(e.target.value) || 0
                                }
                              })}
                              className="w-12 bg-white/10 border border-white/10 rounded px-2 py-1 text-white text-center text-sm focus:border-[#FF6B00] focus:outline-none [appearance:textfield]"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowGameModal(false)}
                className="flex-1 px-4 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveGameResult}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all"
              >
                Finalizar Jogo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
