'use client';

import Navigation from '@/components/Navigation';
import PartidaInternaDetalhes from '@/components/PartidaInternaDetalhes';
import { supabase, Match, Team, TeamAvailableDate, TeamAgendaSettings, InternalMatch, Player } from '@/lib/supabase';
import { Calendar, Clock, MapPin, Filter, CheckCircle, AlertCircle, Settings, ChevronLeft, ChevronRight, Save, MessageSquare, X, User, Upload, Trophy, Loader2, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Tipo estendido para incluir tipo de partida e status in_progress
type AgendaMatch = Omit<Match, 'status'> & { 
  match_type?: 'interna' | 'adversario';
  status: Match['status'] | 'in_progress';
};

export default function AgendaPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'matches' | 'settings'>('matches');
  const [filter, setFilter] = useState<'confirmed' | 'in_progress' | 'completed'>('confirmed');
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Times do usuário
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  
  // Partidas do Supabase
  const [matches, setMatches] = useState<AgendaMatch[]>([]);
  
  // Estados para configurações de agenda
  const [configMonth, setConfigMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [observation, setObservation] = useState('');
  const [savedConfig, setSavedConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  
  // Estado para modal de detalhes da partida
  const [selectedMatch, setSelectedMatch] = useState<AgendaMatch | null>(null);
  
  // Estados para edição de jogo finalizado
  const [editingScore, setEditingScore] = useState(false);
  const [scoreHome, setScoreHome] = useState('');
  const [scoreAway, setScoreAway] = useState('');
  const [highlightPlayer, setHighlightPlayer] = useState({ name: '', photo: '' });
  
  // Estados para modal de partida interna (usando componente existente)
  const [showInternalMatchDetails, setShowInternalMatchDetails] = useState(false);
  const [selectedInternalMatchData, setSelectedInternalMatchData] = useState<InternalMatch | null>(null);
  const [internalMatchPlayers, setInternalMatchPlayers] = useState<Player[]>([]);

  // Carregar times do usuário
  useEffect(() => {
    const fetchUserTeams = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', user.id)
        .order('name');

      if (!error && data) {
        setUserTeams(data);
        if (data.length > 0 && !selectedTeamId) {
          setSelectedTeamId(data[0].id);
        }
      }
      setLoading(false);
    };

    fetchUserTeams();
    setMounted(true);
  }, [user]);

  // Carregar partidas e configurações quando o time é selecionado
  useEffect(() => {
    const fetchMatchesAndSettings = async () => {
      if (!selectedTeamId) return;

      const allMatches: AgendaMatch[] = [];

      // 1. Carregar partidas contra adversários (match_invites com status accepted ou completed)
      const { data: invitesData } = await supabase
        .from('match_invites')
        .select('*')
        .or(`from_team_id.eq.${selectedTeamId},to_team_id.eq.${selectedTeamId}`)
        .in('status', ['accepted', 'completed'])
        .order('proposed_date', { ascending: false });

      if (invitesData) {
        invitesData.forEach(invite => {
          allMatches.push({
            id: invite.id,
            team_id: invite.from_team_id,
            home_team_id: invite.from_team_id,
            away_team_id: invite.to_team_id,
            home_team_name: invite.from_team_name || 'Time Casa',
            away_team_name: invite.to_team_name || 'Time Visitante',
            match_date: invite.proposed_date,
            match_time: invite.proposed_time || '00:00',
            location: invite.location || 'A definir',
            status: invite.status === 'accepted' ? 'confirmed' : 'completed',
            score_home: invite.score_home ?? null,
            score_away: invite.score_away ?? null,
            highlight_player_name: invite.highlight_player_name || null,
            highlight_player_photo: invite.highlight_player_photo || null,
            created_at: invite.created_at,
            match_type: 'adversario',
          });
        });
      }

      // 2. Carregar partidas internas (internal_matches)
      const { data: internalData } = await supabase
        .from('internal_matches')
        .select('*')
        .eq('team_id', selectedTeamId)
        .in('status', ['scheduled', 'in_progress', 'completed'])
        .order('match_date', { ascending: false });

      if (internalData) {
        internalData.forEach(internal => {
          allMatches.push({
            id: internal.id,
            team_id: internal.team_id,
            home_team_id: internal.team_id,
            away_team_id: internal.team_id,
            home_team_name: 'Time A',
            away_team_name: 'Time B',
            match_date: internal.match_date,
            match_time: internal.match_time || '00:00',
            location: internal.location || 'A definir',
            status: internal.status === 'completed' ? 'completed' : internal.status === 'in_progress' ? 'in_progress' : 'confirmed',
            score_home: internal.score_team_a ?? null,
            score_away: internal.score_team_b ?? null,
            highlight_player_name: null,
            highlight_player_photo: null,
            created_at: internal.created_at,
            match_type: 'interna',
          });
        });
      }

      // Ordenar por data
      allMatches.sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());
      setMatches(allMatches);

      // Carregar datas disponíveis
      const { data: datesData } = await supabase
        .from('team_available_dates')
        .select('*')
        .eq('team_id', selectedTeamId);

      if (datesData) {
        setAvailableDates(datesData.map(d => d.available_date));
      }

      // Carregar configurações de agenda
      const { data: settingsData } = await supabase
        .from('team_agenda_settings')
        .select('*')
        .eq('team_id', selectedTeamId)
        .single();

      if (settingsData) {
        setObservation(settingsData.observation || '');
      } else {
        setObservation('');
      }
    };

    fetchMatchesAndSettings();
  }, [selectedTeamId]);

  
  // Função para abrir modal com dados carregados
  const openMatchDetails = (match: AgendaMatch) => {
    setSelectedMatch(match);
    setScoreHome(match.score_home?.toString() || '');
    setScoreAway(match.score_away?.toString() || '');
    setHighlightPlayer({
      name: match.highlight_player_name || '',
      photo: match.highlight_player_photo || ''
    });
    setEditingScore(false);
  };

  // Função para salvar placar e destaque
  const saveMatchResult = async () => {
    if (!selectedMatch) return;

    const { error } = await supabase
      .from('matches')
      .update({
        score_home: parseInt(scoreHome) || 0,
        score_away: parseInt(scoreAway) || 0,
        highlight_player_name: highlightPlayer.name || null,
        highlight_player_photo: highlightPlayer.photo || null,
        status: 'completed'
      })
      .eq('id', selectedMatch.id);

    if (error) {
      console.error('Erro ao salvar resultado:', error);
      alert('Erro ao salvar resultado. Tente novamente.');
      return;
    }

    // Recarregar partidas após salvar
    const { data: matchesData } = await supabase
      .from('matches')
      .select('*')
      .or(`team_id.eq.${selectedTeamId},home_team_id.eq.${selectedTeamId},away_team_id.eq.${selectedTeamId}`)
      .order('match_date', { ascending: false });
    if (matchesData) setMatches(matchesData);
    
    setEditingScore(false);
    setSelectedMatch(null);
  };

  // Função para upload de foto do destaque
  const handleHighlightPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTeamId) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${selectedTeamId}/highlight_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('team-photos')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError);
      // Fallback para base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setHighlightPlayer(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('team-photos')
      .getPublicUrl(fileName);

    setHighlightPlayer(prev => ({ ...prev, photo: publicUrl }));
  };

  // Abrir modal de partida interna (usando componente existente)
  const openInternalMatchDetails = async (match: AgendaMatch) => {
    const { data: internalMatchData } = await supabase
      .from('internal_matches')
      .select('*')
      .eq('id', match.id)
      .single();
    
    if (internalMatchData) {
      const { data: playersData } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', internalMatchData.team_id);
      
      setSelectedInternalMatchData(internalMatchData);
      setInternalMatchPlayers(playersData || []);
      setShowInternalMatchDetails(true);
    }
  };

  // Partidas filtradas
  const confirmedMatches = matches.filter(m => 
    m.status === 'confirmed' || m.status === 'scheduled' || m.status === 'pending'
  );
  const inProgressMatches = matches.filter(m => m.status === 'in_progress');
  const completedMatches = matches.filter(m => m.status === 'completed');
  
  const statusFilteredMatches = filter === 'confirmed' 
    ? confirmedMatches 
    : filter === 'in_progress' 
      ? inProgressMatches 
      : completedMatches;
  
  const filteredMatches = filterMonth 
    ? statusFilteredMatches.filter(m => m.match_date.startsWith(filterMonth))
    : statusFilteredMatches;
  
  const availableMonths = [...new Set(
    matches.map(m => m.match_date.substring(0, 7))
  )].sort().reverse();

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { icon: CheckCircle, text: 'Confirmado', color: 'text-green-500', bg: 'bg-green-500/20' };
      case 'scheduled':
      case 'pending':
        return { icon: AlertCircle, text: 'Pendente', color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
      case 'in_progress':
        return { icon: Play, text: 'Em andamento', color: 'text-blue-500', bg: 'bg-blue-500/20' };
      case 'completed':
        return { icon: CheckCircle, text: 'Finalizado', color: 'text-white/50', bg: 'bg-white/10' };
      default:
        return { icon: AlertCircle, text: 'Pendente', color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
    }
  };

  const formatDate = (dateString: string) => {
    if (!mounted) return '';
    // Adiciona T12:00:00 para evitar problema de timezone (data interpretada como UTC)
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Funções do calendário de configuração
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const toggleDate = (dateKey: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dateKey);
    
    // Não permitir selecionar datas passadas
    if (selectedDate < today) return;
    
    setAvailableDates(prev => 
      prev.includes(dateKey) 
        ? prev.filter(d => d !== dateKey)
        : [...prev, dateKey]
    );
  };

  const isPastDate = (year: number, month: number, day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(year, month, day);
    return checkDate < today;
  };

  const saveConfig = async () => {
    if (!selectedTeamId) return;
    
    setSavingConfig(true);
    
    // Salvar datas disponíveis - primeiro remove todas e depois insere as novas
    await supabase
      .from('team_available_dates')
      .delete()
      .eq('team_id', selectedTeamId);

    if (availableDates.length > 0) {
      const datesToInsert = availableDates.map(date => ({
        team_id: selectedTeamId,
        available_date: date
      }));

      const { error: datesError } = await supabase
        .from('team_available_dates')
        .insert(datesToInsert);

      if (datesError) {
        console.error('Erro ao salvar datas:', datesError);
        alert('Erro ao salvar datas disponíveis.');
        setSavingConfig(false);
        return;
      }
    }

    // Salvar ou atualizar observação
    const { data: existingSettings } = await supabase
      .from('team_agenda_settings')
      .select('id')
      .eq('team_id', selectedTeamId)
      .single();

    if (existingSettings) {
      await supabase
        .from('team_agenda_settings')
        .update({ observation, updated_at: new Date().toISOString() })
        .eq('team_id', selectedTeamId);
    } else {
      await supabase
        .from('team_agenda_settings')
        .insert({ team_id: selectedTeamId, observation });
    }

    setSavingConfig(false);
    setSavedConfig(true);
    setTimeout(() => setSavedConfig(false), 3000);
  };

  const renderConfigCalendar = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(configMonth);
    const days = [];
    const year = configMonth.getFullYear();
    const month = configMonth.getMonth();

    // Dias vazios no início
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 sm:h-12" />);
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(year, month, day);
      const isAvailable = availableDates.includes(dateKey);
      const isPast = isPastDate(year, month, day);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => toggleDate(dateKey)}
          disabled={isPast}
          className={`h-10 sm:h-12 rounded-lg font-medium text-sm transition-all ${
            isPast
              ? 'text-white/20 cursor-not-allowed'
              : isAvailable
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-white/5 text-white hover:bg-white/10'
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF5A00]/20 rounded-2xl p-6">
        {/* Header do Calendário */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => setConfigMonth(new Date(configMonth.getFullYear(), configMonth.getMonth() - 1))}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h3 className="text-white font-bold text-lg capitalize">
            {configMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            type="button"
            onClick={() => setConfigMonth(new Date(configMonth.getFullYear(), configMonth.getMonth() + 1))}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-white/40 text-xs font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Dias */}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>

        {/* Legenda */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-white/60 text-xs">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white/5 border border-white/20" />
            <span className="text-white/60 text-xs">Indisponível</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FF5A00] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Agenda
            </h1>
            
            {/* Seletor de Time */}
            {userTeams.length > 0 && (
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF5A00]"
              >
                {userTeams.map(team => (
                  <option key={team.id} value={team.id} className="bg-[#1A1A1A]">
                    {team.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <p className="text-white/60 text-base sm:text-lg">Acompanhe todos os seus jogos agendados</p>
        </div>

        {/* Verificar se tem times */}
        {userTeams.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-20 h-20 text-white/20 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Nenhum time encontrado</h3>
            <p className="text-white/60 mb-6">Crie um time primeiro para gerenciar sua agenda.</p>
            <a href="/times" className="inline-block bg-[#FF5A00] hover:bg-[#FF5A00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all">
              Criar Time
            </a>
          </div>
        ) : (
          <>
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'matches'
                ? 'bg-[#FF5A00] text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Partidas
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-[#FF5A00] text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <Settings className="w-5 h-5" />
            Definir Datas
          </button>
        </div>

        {/* Tab: Partidas */}
        {activeTab === 'matches' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-green-500/20 rounded-xl p-5">
                <div className="text-3xl font-bold text-green-500 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {confirmedMatches.length}
                </div>
                <div className="text-white/60 text-sm">Confirmados</div>
              </div>
              
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-white/10 rounded-xl p-5">
                <div className="text-3xl font-bold text-white/60 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {completedMatches.length}
                </div>
                <div className="text-white/60 text-sm">Finalizados</div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              {/* Filtro por Status */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0">
                <div className="flex items-center gap-2 text-white/60">
                  <Filter className="w-5 h-5" />
                  <span className="text-sm font-medium">Status:</span>
                </div>
                
                <button
                  onClick={() => setFilter('confirmed')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                    filter === 'confirmed'
                      ? 'bg-green-600 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  Confirmados ({confirmedMatches.length})
                </button>
                
                <button
                  onClick={() => setFilter('in_progress')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                    filter === 'in_progress'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  Em andamento ({inProgressMatches.length})
                </button>
                
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                    filter === 'completed'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  Finalizados ({completedMatches.length})
                </button>
              </div>

              {/* Filtro por Mês */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-white/60">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium">Mês:</span>
                </div>
                
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF5A00]/40 cursor-pointer"
                >
                  <option value="" className="bg-[#1A1A1A]">Todos os meses</option>
                  {availableMonths.map(month => (
                    <option key={month} value={month} className="bg-[#1A1A1A]">
                      {new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </option>
                  ))}
                </select>
                
                {filterMonth && (
                  <button
                    onClick={() => setFilterMonth('')}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Limpar filtro"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Tab: Configurações */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Título da seção */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Configurar Disponibilidade
              </h2>
              <p className="text-white/60">
                Selecione os dias em que seu time está disponível para partidas. Essas datas serão exibidas para outros times que quiserem marcar jogos.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendário */}
              <div>
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#FF5A00]" />
                  Datas Disponíveis
                </h3>
                {renderConfigCalendar()}
                
                {/* Resumo de datas selecionadas */}
                {/* <div className="mt-4 bg-white/5 rounded-xl p-4">
                  <div className="text-white/60 text-sm mb-2">Datas selecionadas:</div>
                  <div className="text-[#FF5A00] font-bold text-2xl">
                    {availableDates.length}
                  </div>
                </div> */}
              </div>

              {/* Observações */}
              <div>
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#FF5A00]" />
                  Observações para Visitantes
                </h3>
                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF5A00]/20 rounded-2xl p-6">
                  <label className="block text-white/60 text-sm mb-3">
                    Deixe um aviso ou informação importante para quem quiser marcar partida com seu time:
                  </label>
                  <textarea
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    placeholder="Ex: Preferimos jogos aos sábados à tarde. Temos campo próprio disponível. Entre em contato pelo WhatsApp para confirmar..."
                    rows={6}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF5A00]/40 transition-all resize-none"
                  />
                  <div className="text-white/40 text-xs mt-2">
                    {observation.length}/500 caracteres
                  </div>
                </div>

                {/* Dicas */}
                <div className="mt-4 bg-[#FF5A00]/10 border border-[#FF5A00]/20 rounded-xl p-4">
                  <h4 className="text-[#FF5A00] font-bold text-sm mb-2">💡 Dicas</h4>
                  <ul className="text-white/60 text-sm space-y-1">
                    <li>• Informe seus horários preferidos</li>
                    <li>• Mencione se possui local para jogar</li>
                    <li>• Adicione formas de contato alternativas</li>
                    <li>• Indique regras ou preferências do time</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Resumo das Configurações Salvas */}
            {availableDates.length > 0 && (
              <div className="mt-8 bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-green-500/30 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Resumo da Disponibilidade
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Datas Selecionadas */}
                  <div>
                    <h4 className="text-white/60 text-sm mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Datas Disponíveis ({availableDates.length})
                    </h4>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {availableDates
                        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                        .map(date => (
                          <span 
                            key={date} 
                            className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium"
                          >
                            {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { 
                              day: '2-digit', 
                              month: 'short'
                            })}
                          </span>
                        ))
                      }
                    </div>
                  </div>

                  {/* Observação */}
                  {observation && (
                    <div>
                      <h4 className="text-white/60 text-sm mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Observação para Visitantes
                      </h4>
                      <div className="bg-white/5 rounded-xl p-4 text-white/80 text-sm">
                        {observation}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botão Salvar */}
            <div className="flex justify-end pt-6 border-t border-white/10">
              <button
                onClick={saveConfig}
                className="bg-[#FF5A00] hover:bg-[#FF5A00]/90 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2 hover:shadow-[0_0_20px_rgba(255,90,0,0.3)]"
              >
                <Save className="w-5 h-5" />
                Salvar Configurações
              </button>
            </div>

            {/* Notificação de sucesso */}
            {savedConfig && (
              <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 z-50">
                <CheckCircle className="w-5 h-5" />
                Configurações salvas com sucesso!
              </div>
            )}
          </div>
        )}

        {/* Matches List - Apenas na aba de partidas */}
        {activeTab === 'matches' && (
          <>
            <div className="space-y-4">
              {filteredMatches.map((match) => {
                const statusInfo = getStatusInfo(match.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={match.id} className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF5A00]/20 rounded-2xl p-5 sm:p-6 hover:border-[#FF5A00]/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,90,0,0.15)]">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-[#FF5A00]" />
                        <div>
                          <div className="text-white font-medium">{formatDate(match.match_date)}</div>
                          <div className="text-white/60 text-sm flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4" />
                            {match.match_time}
                          </div>
                        </div>
                      </div>
                      
                      <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${statusInfo.bg} ${statusInfo.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {statusInfo.text}
                      </div>
                    </div>

                    {/* Match Details */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex-1 text-center sm:text-left">
                        <div className="text-xl sm:text-2xl font-bold text-white mb-2">{match.home_team_name}</div>
                        <div className="text-white/40 text-sm">Casa</div>
                      </div>
                      
                      <div className="px-6 sm:px-8 text-center">
                        {match.match_type === 'interna' && (
                          <div className="text-white/40 text-xs mb-1">Partida Interna</div>
                        )}
                        {match.score_home !== null && match.score_away !== null ? (
                          <div className="flex items-center gap-4">
                            <div className="text-3xl font-bold text-white">{match.score_home}</div>
                            <div className="text-white/40">×</div>
                            <div className="text-3xl font-bold text-white">{match.score_away}</div>
                          </div>
                        ) : (
                          <div className="px-6 py-3 bg-[#FF5A00]/10 rounded-xl">
                            <div className="text-[#FF5A00] font-bold text-lg">VS</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 text-center sm:text-right">
                        <div className="text-xl sm:text-2xl font-bold text-white mb-2">{match.away_team_name}</div>
                        <div className="text-white/40 text-sm">Visitante</div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-white/60">
                        <MapPin className="w-4 h-4 text-[#FF5A00]" />
                        <span className="text-sm">{match.location}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-white/10 flex gap-3">
                      <button 
                        onClick={() => openMatchDetails(match)}
                        className="flex-1 bg-[#FF5A00] hover:bg-[#FF5A00]/90 text-white font-medium py-2 px-4 rounded-lg transition-all text-sm"
                      >
                        Ver Detalhes
                      </button>
                      {match.match_type === 'interna' && match.status !== 'completed' && (
                        <button 
                          onClick={() => openInternalMatchDetails(match)}
                          className={`flex-1 ${match.status === 'in_progress' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white font-medium py-2 px-4 rounded-lg transition-all text-sm flex items-center justify-center gap-2`}
                        >
                          <Play className="w-4 h-4" />
                          {match.status === 'in_progress' ? 'Ver partida em andamento' : 'Iniciar Jogo'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredMatches.length === 0 && (
              <div className="text-center py-20">
                <Calendar className="w-20 h-20 text-white/20 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Nenhum jogo encontrado
                </h3>
                <p className="text-white/60">
                  Não há jogos {filter === 'confirmed' ? 'confirmados' : filter === 'in_progress' ? 'em andamento' : 'finalizados'}
                  {filterMonth && ` em ${new Date(filterMonth + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`}.
                </p>
              </div>
            )}
          </>
        )}

        {/* Modal de Detalhes da Partida */}
        {selectedMatch && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF5A00]/30 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Header do Modal */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Detalhes da Partida
                </h2>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Conteúdo */}
              <div className="p-6 space-y-6">
                {/* Status */}
                {(() => {
                  const statusInfo = getStatusInfo(selectedMatch.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bg}`}>
                      <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                      <span className={`font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
                    </div>
                  );
                })()}

                {/* Times e Placar */}
                <div className="bg-white/5 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-white mb-1">{selectedMatch.home_team_name}</div>
                      <div className="text-white/40 text-sm">Casa</div>
                    </div>
                    
                    <div className="px-6">
                      {editingScore ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={scoreHome}
                            onChange={(e) => setScoreHome(e.target.value)}
                            className="w-14 h-14 bg-white/10 border border-white/20 rounded-lg text-center text-2xl font-bold text-white focus:outline-none focus:border-[#FF5A00]"
                          />
                          <div className="text-white/40 text-xl">×</div>
                          <input
                            type="number"
                            min="0"
                            value={scoreAway}
                            onChange={(e) => setScoreAway(e.target.value)}
                            className="w-14 h-14 bg-white/10 border border-white/20 rounded-lg text-center text-2xl font-bold text-white focus:outline-none focus:border-[#FF5A00]"
                          />
                        </div>
                      ) : (
                        <>
                          {selectedMatch.score_home !== null && selectedMatch.score_away !== null ? (
                            <div className="flex items-center gap-3">
                              <div className="text-3xl font-bold text-white">{selectedMatch.score_home}</div>
                              <div className="text-white/40 text-xl">×</div>
                              <div className="text-3xl font-bold text-white">{selectedMatch.score_away}</div>
                            </div>
                          ) : (
                            <div className="px-4 py-2 bg-[#FF5A00]/20 rounded-xl">
                              <div className="text-[#FF5A00] font-bold">VS</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-white mb-1">{selectedMatch.away_team_name}</div>
                      <div className="text-white/40 text-sm">Visitante</div>
                    </div>
                  </div>
                </div>

                {/* Informações */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/80">
                    <Calendar className="w-5 h-5 text-[#FF5A00]" />
                    <span className="capitalize">{formatDate(selectedMatch.match_date)}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-white/80">
                    <Clock className="w-5 h-5 text-[#FF5A00]" />
                    <span>{selectedMatch.match_time}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-white/80">
                    <MapPin className="w-5 h-5 text-[#FF5A00]" />
                    <span>{selectedMatch.location}</span>
                  </div>
                </div>

                {/* Destaque da Partida - Apenas para jogos finalizados */}
                {selectedMatch.status === 'completed' && (
                  <div className="pt-4 border-t border-white/10">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-[#FF5A00]" />
                      Destaque da Partida
                    </h3>
                    
                    {editingScore ? (
                      <div className="space-y-4">
                        {/* Upload de foto */}
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {highlightPlayer.photo ? (
                              <img 
                                src={highlightPlayer.photo} 
                                alt="Destaque" 
                                className="w-20 h-20 rounded-full object-cover border-2 border-[#FF5A00]"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border-2 border-dashed border-white/30">
                                <User className="w-8 h-8 text-white/40" />
                              </div>
                            )}
                            <label className="absolute -bottom-1 -right-1 p-1.5 bg-[#FF5A00] rounded-full cursor-pointer hover:bg-[#FF5A00]/80 transition-colors">
                              <Upload className="w-4 h-4 text-white" />
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleHighlightPhotoUpload}
                                className="hidden" 
                              />
                            </label>
                          </div>
                          <div className="flex-1">
                            <label className="block text-white/60 text-sm mb-2">Nome do Jogador</label>
                            <input
                              type="text"
                              value={highlightPlayer.name}
                              onChange={(e) => setHighlightPlayer(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Ex: João Silva"
                              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF5A00]/40"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {selectedMatch.highlight_player_name ? (
                          <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
                            {selectedMatch.highlight_player_photo ? (
                              <img 
                                src={selectedMatch.highlight_player_photo} 
                                alt={selectedMatch.highlight_player_name} 
                                className="w-16 h-16 rounded-full object-cover border-2 border-[#FF5A00]"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                                <User className="w-6 h-6 text-white/40" />
                              </div>
                            )}
                            <div>
                              <div className="text-[#FF5A00] text-xs font-medium mb-1">⭐ Destaque</div>
                              <div className="text-white font-bold">{selectedMatch.highlight_player_name}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-white/40 text-sm italic">
                            Nenhum destaque definido. Clique em &quot;Editar Resultado&quot; para adicionar.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Ações */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  {/* Ações para jogo finalizado */}
                  {selectedMatch.status === 'completed' && (
                    <>
                      {editingScore ? (
                        <button 
                          onClick={saveMatchResult}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <Save className="w-5 h-5" />
                          Salvar Resultado
                        </button>
                      ) : (
                        <button 
                          onClick={() => setEditingScore(true)}
                          className="w-full bg-[#FF5A00] hover:bg-[#FF5A00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all"
                        >
                          Editar Resultado
                        </button>
                      )}
                    </>
                  )}

                  {/* Ações para jogo pendente */}
                  {(selectedMatch.status === 'pending' || selectedMatch.status === 'scheduled') && (
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
                      Confirmar Presença
                    </button>
                  )}
                  
                  {/* Cancelar partida - apenas para jogos não finalizados */}
                  {selectedMatch.status !== 'completed' && (
                    <button className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium py-3 px-6 rounded-xl transition-all border border-red-600/30">
                      Cancelar Partida
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedMatch(null)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-all"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        </>
        )}

        {/* Modal: Partida Interna Detalhes (usando componente existente) */}
        {showInternalMatchDetails && selectedInternalMatchData && (
          <PartidaInternaDetalhes
            match={selectedInternalMatchData}
            players={internalMatchPlayers}
            isOwnerMode={true}
            onClose={() => {
              setShowInternalMatchDetails(false);
              setSelectedInternalMatchData(null);
              setInternalMatchPlayers([]);
            }}
            onUpdate={() => {
              // Fechar modal após atualização
              setShowInternalMatchDetails(false);
              setSelectedInternalMatchData(null);
              setInternalMatchPlayers([]);
            }}
          />
        )}
      </main>
    </div>
  );
}
