'use client';

import Navigation from '@/components/Navigation';
import { supabase, Team, MatchInvite, TeamAvailableDate } from '@/lib/supabase';
import { Search, User, Phone, Tag, Calendar, X, ChevronLeft, ChevronRight, Clock, MessageSquare, Send, CheckCircle, Users, Image as ImageIcon, MapPin, Filter, RotateCcw, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function BuscarPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Times
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [selectedMyTeam, setSelectedMyTeam] = useState<string>('');
  const [teamAvailableDates, setTeamAvailableDates] = useState<Record<string, string[]>>({});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<{team: string; date: string; time: string} | null>(null);
  const [showTeamPhotoModal, setShowTeamPhotoModal] = useState(false);
  const [teamPhotoData, setTeamPhotoData] = useState<{name: string; logo: string; photo: string} | null>(null);
  
  // Estados dos filtros
  const [filterDate, setFilterDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterHasVenue, setFilterHasVenue] = useState<'all' | 'yes' | 'no'>('all');
  const [filterTeamType, setFilterTeamType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const categoryOptions = ['Juvenil', 'Adulto', 'Veterano 35+', 'Master 45+'];
  const teamTypeOptions = ['Campo', 'Society', 'Futsal'];

  // Carregar times do Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Carregar todos os times disponíveis para partidas
      const { data: teamsData } = await supabase
        .from('teams')
        .select('*')
        .eq('available_for_match', true)
        .order('name');

      if (teamsData) {
        setAllTeams(teamsData);
      }

      // Carregar times do usuário
      if (user) {
        const { data: myTeams } = await supabase
          .from('teams')
          .select('*')
          .eq('owner_id', user.id)
          .order('name');

        if (myTeams && myTeams.length > 0) {
          setUserTeams(myTeams);
          setSelectedMyTeam(myTeams[0].id);
        }
      }

      // Carregar datas disponíveis de todos os times
      const { data: datesData } = await supabase
        .from('team_available_dates')
        .select('team_id, available_date');

      if (datesData) {
        const datesMap: Record<string, string[]> = {};
        datesData.forEach(d => {
          if (!datesMap[d.team_id]) {
            datesMap[d.team_id] = [];
          }
          datesMap[d.team_id].push(d.available_date);
        });
        setTeamAvailableDates(datesMap);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDate('');
    setFilterCategory('');
    setFilterHasVenue('all');
    setFilterTeamType('');
  };

  const hasActiveFilters = searchTerm || filterDate || filterCategory || filterHasVenue !== 'all' || filterTeamType;

  // Fotos de elenco - placeholder
  const getTeamPhoto = (teamId: string) => {
    return 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80';
  };

  const openTeamPhotoModal = (team: Team) => {
    setTeamPhotoData({
      name: team.name,
      logo: team.logo || '⚽',
      photo: getTeamPhoto(team.id)
    });
    setShowTeamPhotoModal(true);
  };

  // Datas disponíveis do Supabase
  const getAvailableDates = (teamId: string): Date[] => {
    const dates = teamAvailableDates[teamId] || [];
    return dates.map(d => new Date(d + 'T00:00:00'));
  };

  const openCalendarModal = (team: Team) => {
    setSelectedTeam(team);
    setShowCalendarModal(true);
    setSelectedDate(null);
    setSelectedTime('');
    setMessage('');
  };

  const closeCalendarModal = () => {
    setShowCalendarModal(false);
    setSelectedTeam(null);
    setSelectedDate(null);
    setSelectedTime('');
    setMessage('');
  };

  const handleMarcarJogo = async () => {
    if (!selectedDate || !selectedTime || !selectedTeam || !selectedMyTeam) return;

    setSending(true);
    const myTeam = userTeams.find(t => t.id === selectedMyTeam);
    
    if (!myTeam) {
      alert('Selecione um time para enviar o convite.');
      setSending(false);
      return;
    }

    // Formatar data para o banco
    const dateStr = selectedDate.toISOString().split('T')[0];

    const { error } = await supabase
      .from('match_invites')
      .insert({
        from_team_id: myTeam.id,
        from_team_name: myTeam.name,
        to_team_id: selectedTeam.id,
        to_team_name: selectedTeam.name,
        proposed_date: dateStr,
        proposed_time: selectedTime,
        proposed_location: selectedTeam.has_venue ? 'Local do adversário' : null,
        message: message || null,
        status: 'pending'
      });

    setSending(false);

    if (error) {
      console.error('Erro ao enviar convite:', error);
      alert('Erro ao enviar convite: ' + error.message);
      return;
    }

    const formattedDate = selectedDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    setInviteDetails({
      team: selectedTeam.name,
      date: formattedDate,
      time: selectedTime
    });

    closeCalendarModal();
    setShowSuccessNotification(true);

    setTimeout(() => {
      setShowSuccessNotification(false);
      setInviteDetails(null);
    }, 5000);
  };

  // Funções do calendário
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const isDateAvailable = (date: Date, teamId: string) => {
    const availableDates = getAvailableDates(teamId);
    return availableDates.some(d => 
      d.getDate() === date.getDate() && 
      d.getMonth() === date.getMonth() && 
      d.getFullYear() === date.getFullYear()
    );
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === date.getDate() && 
           selectedDate.getMonth() === date.getMonth() && 
           selectedDate.getFullYear() === date.getFullYear();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const renderCalendar = () => {
    if (!selectedTeam) return null;
    
    const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
    const days = [];
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // Dias vazios antes do primeiro dia do mês
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const available = isDateAvailable(date, selectedTeam.id);
      const selected = isDateSelected(date);
      const past = isPastDate(date);

      days.push(
        <button
          key={day}
          onClick={() => available && !past && setSelectedDate(date)}
          disabled={!available || past}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
            selected
              ? 'bg-[#FF6B35] text-white'
              : available && !past
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 cursor-pointer'
                : past
                  ? 'text-white/20 cursor-not-allowed'
                  : 'text-white/40 cursor-not-allowed'
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div>
        {/* Header do calendário */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h4 className="text-white font-bold capitalize">
            {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h4>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-white/60 text-xs font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Dias do mês */}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/40" />
            <span className="text-white/60 text-xs">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#FF6B35]" />
            <span className="text-white/60 text-xs">Selecionado</span>
          </div>
        </div>
      </div>
    );
  };
  
  // Filtrar times (excluindo os times do próprio usuário)
  const opponentTeams = allTeams.filter(team => !userTeams.some(ut => ut.id === team.id));
  
  const filteredTeams = opponentTeams.filter((team: Team) => {
    // Filtro por nome/descrição
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por categoria
    const matchesCategory = !filterCategory || team.category === filterCategory;
    
    // Filtro por local próprio
    const matchesVenue = filterHasVenue === 'all' || 
      (filterHasVenue === 'yes' && team.has_venue) || 
      (filterHasVenue === 'no' && !team.has_venue);
    
    // Filtro por tipo de time
    const matchesTeamType = !filterTeamType || team.team_type === filterTeamType;
    
    // Filtro por data disponível
    const teamDates = teamAvailableDates[team.id] || [];
    const matchesDate = !filterDate || teamDates.includes(filterDate);
    
    return matchesSearch && matchesCategory && matchesVenue && matchesTeamType && matchesDate;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin" />
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
              Marcar Jogo
            </h1>
            
            {/* Seletor do Meu Time */}
            {userTeams.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm">Meu time:</span>
                <select
                  value={selectedMyTeam}
                  onChange={(e) => setSelectedMyTeam(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6B35]"
                >
                  {userTeams.map(team => (
                    <option key={team.id} value={team.id} className="bg-[#1A1A1A]">
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <p className="text-white/60 text-base sm:text-lg">Encontre times adversários e agende sua partida</p>
          
          {userTeams.length === 0 && (
            <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-yellow-500" />
              <p className="text-yellow-500 text-sm">
                Você precisa criar um time primeiro para enviar convites.{' '}
                <a href="/times" className="underline font-bold">Criar time</a>
              </p>
            </div>
          )}
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          {/* Barra de busca + botão filtros */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Buscar times por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B35]/20 rounded-xl py-4 px-12 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6B35]/40 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 rounded-xl border transition-all flex items-center gap-2 ${
                showFilters || hasActiveFilters
                  ? 'bg-[#FF6B35] border-[#FF6B35] text-white'
                  : 'bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border-[#FF6B35]/20 text-white/60 hover:border-[#FF6B35]/40'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filtros</span>
              {hasActiveFilters && (
                <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                  {[searchTerm, filterDate, filterCategory, filterHasVenue !== 'all', filterTeamType].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Painel de Filtros */}
          {showFilters && (
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B35]/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Filter className="w-5 h-5 text-[#FF6B35]" />
                  Filtros Avançados
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-[#FF6B35] hover:text-[#FF6B35]/80 text-sm flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Limpar filtros
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filtro por Data */}
                <div>
                  <label className="block text-white/60 text-sm mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data Disponível
                  </label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FF6B35]/40 transition-all"
                  />
                </div>

                {/* Filtro por Categoria */}
                <div>
                  <label className="block text-white/60 text-sm mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Categoria
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FF6B35]/40 transition-all"
                  >
                    <option value="" className="bg-[#1A1A1A]">Todas</option>
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat} className="bg-[#1A1A1A]">{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Local Próprio */}
                <div>
                  <label className="block text-white/60 text-sm mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Possui Local
                  </label>
                  <select
                    value={filterHasVenue}
                    onChange={(e) => setFilterHasVenue(e.target.value as 'all' | 'yes' | 'no')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FF6B35]/40 transition-all"
                  >
                    <option value="all" className="bg-[#1A1A1A]">Todos</option>
                    <option value="yes" className="bg-[#1A1A1A]">Sim, possui local</option>
                    <option value="no" className="bg-[#1A1A1A]">Não possui local</option>
                  </select>
                </div>

                {/* Filtro por Tipo de Time */}
                <div>
                  <label className="block text-white/60 text-sm mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Tipo de Time
                  </label>
                  <select
                    value={filterTeamType}
                    onChange={(e) => setFilterTeamType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FF6B35]/40 transition-all"
                  >
                    <option value="" className="bg-[#1A1A1A]">Todos</option>
                    {teamTypeOptions.map(type => (
                      <option key={type} value={type} className="bg-[#1A1A1A]">Time de {type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B35]/20 rounded-xl p-5">
            <div className="text-3xl font-bold text-[#FF6B35] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {opponentTeams.length}
            </div>
            <div className="text-white/60 text-sm">Times Disponíveis</div>
          </div>
          
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B35]/20 rounded-xl p-5">
            <div className="text-3xl font-bold text-[#FF6B35] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {allTeams.length}
            </div>
            <div className="text-white/60 text-sm">Total de Times</div>
          </div>
          
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B35]/20 rounded-xl p-5 col-span-2 sm:col-span-1">
            <div className="text-3xl font-bold text-[#FF6B35] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {filteredTeams.length}
            </div>
            <div className="text-white/60 text-sm">Resultados</div>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
              <div key={team.id} className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B35]/20 rounded-2xl overflow-hidden hover:border-[#FF6B35]/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,53,0.15)] group">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    {team.logo && (team.logo.startsWith('http') || team.logo.startsWith('data:')) ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#FF6B35]/20">
                        <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="text-5xl">{team.logo || '⚽'}</div>
                    )}
                    <button
                      onClick={() => openTeamPhotoModal(team)}
                      className="p-2 bg-[#FF6B35]/10 hover:bg-[#FF6B35]/20 rounded-full transition-all group relative"
                      title="Ver foto do elenco"
                    >
                      <Users className="w-5 h-5 text-[#FF6B35]" />
                      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Ver elenco
                      </span>
                    </button>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {team.name}
                  </h3>
                  <p className="text-white/60 text-sm">{team.description}</p>
                </div>

                {/* Info */}
                <div className="p-6 space-y-4">
                  {/* Presidente */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#FF6B35]/10 rounded-lg">
                      <User className="w-5 h-5 text-[#FF6B35]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white/60 text-sm">Presidente</div>
                      <div className="text-white font-bold">{team.president || 'Não informado'}</div>
                    </div>
                  </div>

                  {/* Contato */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#FF6B35]/10 rounded-lg">
                      <Phone className="w-5 h-5 text-[#FF6B35]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white/60 text-sm">Contato</div>
                      <div className="text-white font-bold">{team.phone || 'Não informado'}</div>
                    </div>
                  </div>

                  {/* Categoria */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#FF6B35]/10 rounded-lg">
                      <Tag className="w-5 h-5 text-[#FF6B35]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white/60 text-sm">Categoria</div>
                      <div className="text-white font-bold">{team.category || 'Não informada'}</div>
                    </div>
                  </div>

                  {/* Disponibilidade */}
                  <div className="pt-4 border-t border-white/10">
                    {(() => {
                      const hasAvailableDates = (teamAvailableDates[team.id] || []).length > 0;
                      return (
                        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
                          hasAvailableDates
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          <Calendar className="w-5 h-5" />
                          <span className="font-medium">
                            {hasAvailableDates 
                              ? `${teamAvailableDates[team.id].length} data(s) disponível(is)`
                              : 'Sem datas disponíveis no momento'
                            }
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-0">
                  {(() => {
                    const hasAvailableDates = (teamAvailableDates[team.id] || []).length > 0;
                    return (
                      <button 
                        onClick={() => openCalendarModal(team)}
                        disabled={!hasAvailableDates}
                        className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                          hasAvailableDates
                            ? 'bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white hover:shadow-[0_0_20px_rgba(255,107,53,0.3)]'
                            : 'bg-white/10 text-white/40 cursor-not-allowed'
                        }`}
                      >
                        <Calendar className="w-5 h-5" />
                        Ver Calendário
                      </button>
                    );
                  })()}
                </div>
              </div>
            ))}
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

      {/* Modal de Calendário */}
      {showCalendarModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B35]/20 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {selectedTeam.logo && (selectedTeam.logo.startsWith('http') || selectedTeam.logo.startsWith('data:')) ? (
                  <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-[#FF6B35]/20">
                    <img src={selectedTeam.logo} alt={selectedTeam.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="text-4xl">{selectedTeam.logo || '⚽'}</div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {selectedTeam.name}
                  </h3>
                  <p className="text-white/60 text-sm">Selecione uma data disponível</p>
                </div>
              </div>
              <button
                onClick={closeCalendarModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white/60" />
              </button>
            </div>

            {/* Calendário */}
            <div className="p-6 border-b border-white/10">
              {renderCalendar()}
            </div>

            {/* Formulário */}
            <div className="p-6 space-y-4">
              {/* Data selecionada */}
              {selectedDate && (
                <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-xl p-4">
                  <div className="text-[#FF6B35] text-sm font-medium mb-1">Data selecionada</div>
                  <div className="text-white font-bold">
                    {selectedDate.toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      day: '2-digit', 
                      month: 'long' 
                    })}
                  </div>
                </div>
              )}

              {/* Horário */}
              <div>
                <label className="block text-white font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF6B35]" />
                  Horário pretendido
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FF6B35]/40 transition-all"
                />
              </div>

              {/* Mensagem */}
              <div>
                <label className="block text-white font-medium mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#FF6B35]" />
                  Mensagem (opcional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ex: Podemos jogar no campo do bairro..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6B35]/40 transition-all resize-none"
                />
              </div>

              {/* Aviso se não tem time */}
              {userTeams.length === 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-yellow-500 text-sm">
                  Você precisa criar um time primeiro para enviar convites.
                </div>
              )}

              {/* Botão Marcar Jogo */}
              <button
                onClick={handleMarcarJogo}
                disabled={!selectedDate || !selectedTime || !selectedMyTeam || sending}
                className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                  selectedDate && selectedTime && selectedMyTeam && !sending
                    ? 'bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white hover:shadow-[0_0_20px_rgba(255,107,53,0.3)]'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Convite
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Foto do Elenco */}
      {showTeamPhotoModal && teamPhotoData && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowTeamPhotoModal(false)}
        >
          <div 
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão Fechar */}
            <button
              onClick={() => setShowTeamPhotoModal(false)}
              className="absolute -top-12 right-0 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
              {teamPhotoData.logo && (teamPhotoData.logo.startsWith('http') || teamPhotoData.logo.startsWith('data:')) ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-[#FF6B35]/20">
                  <img src={teamPhotoData.logo} alt={teamPhotoData.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="text-4xl">{teamPhotoData.logo || '⚽'}</div>
              )}
              <div>
                <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {teamPhotoData.name}
                </h3>
                <p className="text-white/60">Foto do Elenco</p>
              </div>
            </div>

            {/* Foto */}
            <div className="rounded-2xl overflow-hidden border-4 border-[#FF6B35]/30 shadow-[0_0_40px_rgba(255,107,53,0.2)]">
              <img 
                src={teamPhotoData.photo} 
                alt={`Elenco do ${teamPhotoData.name}`}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* Notificação de Sucesso */}
      {showSuccessNotification && inviteDetails && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-gradient-to-br from-green-600 to-green-700 border border-green-500/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(34,197,94,0.3)] max-w-md">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold text-lg mb-1">Convite Enviado!</h4>
                <p className="text-white/80 text-sm mb-3">
                  Seu convite para jogar foi enviado para <span className="font-bold">{inviteDetails.team}</span>
                </p>
                <div className="bg-white/10 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span className="capitalize">{inviteDetails.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{inviteDetails.time}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
