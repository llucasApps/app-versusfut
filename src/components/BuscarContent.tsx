'use client';

import { supabase, Team } from '@/lib/supabase';
import { Search, User, Phone, Tag, Calendar, X, ChevronLeft, ChevronRight, Clock, MessageSquare, CheckCircle, Users, MapPin, Filter, RotateCcw, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function BuscarContent() {
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

    const { data: inviteData, error } = await supabase
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
      })
      .select()
      .single();

    setSending(false);

    if (error || !inviteData) {
      console.error('Erro ao enviar convite:', error);
      alert('Erro ao enviar convite: ' + error?.message);
      return;
    }

    // Se houver mensagem, inserir também na tabela invite_messages
    if (message && message.trim()) {
      await supabase
        .from('invite_messages')
        .insert({
          invite_id: inviteData.id,
          sender_team_id: myTeam.id,
          sender_name: myTeam.name,
          message: message.trim()
        });
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

    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

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
              ? 'bg-[#FF6B00] text-white'
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

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-white/60 text-xs font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/40" />
            <span className="text-white/60 text-xs">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#FF6B00]" />
            <span className="text-white/60 text-xs">Selecionado</span>
          </div>
        </div>
      </div>
    );
  };
  
  // Filtrar times (excluindo os times do próprio usuário)
  const opponentTeams = allTeams.filter(team => !userTeams.some(ut => ut.id === team.id));
  
  const filteredTeams = opponentTeams.filter((team: Team) => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || team.category === filterCategory;
    const matchesVenue = filterHasVenue === 'all' || 
      (filterHasVenue === 'yes' && team.has_venue) || 
      (filterHasVenue === 'no' && !team.has_venue);
    const matchesTeamType = !filterTeamType || team.team_type === filterTeamType;
    const teamDates = teamAvailableDates[team.id] || [];
    const matchesDate = !filterDate || teamDates.includes(filterDate);
    
    return matchesSearch && matchesCategory && matchesVenue && matchesTeamType && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Notificação de Sucesso */}
      {showSuccessNotification && inviteDetails && (
        <div className="fixed top-24 right-4 z-50 bg-green-500 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in">
          <CheckCircle className="w-6 h-6" />
          <div>
            <p className="font-bold">Convite enviado!</p>
            <p className="text-sm opacity-90">
              {inviteDetails.team} - {inviteDetails.date} às {inviteDetails.time}
            </p>
          </div>
        </div>
      )}

      {/* Seletor do Meu Time */}
      {userTeams.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-white/60 text-sm">Meu time:</span>
          <select
            value={selectedMyTeam}
            onChange={(e) => setSelectedMyTeam(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6B00]"
          >
            {userTeams.map(team => (
              <option key={team.id} value={team.id} className="bg-[#1A1A1A]">
                {team.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {userTeams.length === 0 && (
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-yellow-500" />
          <p className="text-yellow-500 text-sm">
            Você precisa criar um time primeiro para enviar convites.{' '}
            <Link href="/times" className="underline font-bold">Criar time</Link>
          </p>
        </div>
      )}

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Buscar times por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-xl py-3 px-12 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6B00]/40 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 rounded-xl border transition-all flex items-center gap-2 ${
              showFilters || hasActiveFilters
                ? 'bg-[#FF6B00] border-[#FF6B00] text-white'
                : 'bg-[#1A1A1A] border-[#FF6B00]/20 text-white/60 hover:border-[#FF6B00]/40'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filtros</span>
          </button>
        </div>

        {/* Painel de Filtros */}
        {showFilters && (
          <div className="bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#FF6B00]" />
                Filtros Avançados
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[#FF6B00] hover:text-[#FF6B00]/80 text-sm flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Limpar filtros
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-white/60 text-sm mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data Disponível
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FF6B00]/40 transition-all"
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Categoria
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FF6B00]/40 transition-all"
                >
                  <option value="" className="bg-[#1A1A1A]">Todas</option>
                  {categoryOptions.map(cat => (
                    <option key={cat} value={cat} className="bg-[#1A1A1A]">{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Possui Local
                </label>
                <select
                  value={filterHasVenue}
                  onChange={(e) => setFilterHasVenue(e.target.value as 'all' | 'yes' | 'no')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FF6B00]/40 transition-all"
                >
                  <option value="all" className="bg-[#1A1A1A]">Todos</option>
                  <option value="yes" className="bg-[#1A1A1A]">Sim, possui local</option>
                  <option value="no" className="bg-[#1A1A1A]">Não possui local</option>
                </select>
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Tipo de Time
                </label>
                <select
                  value={filterTeamType}
                  onChange={(e) => setFilterTeamType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FF6B00]/40 transition-all"
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
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-[#FF6B00]">{opponentTeams.length}</div>
          <div className="text-white/60 text-sm">Times Disponíveis</div>
        </div>
        <div className="bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-[#FF6B00]">{allTeams.length}</div>
          <div className="text-white/60 text-sm">Total de Times</div>
        </div>
        <div className="bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-[#FF6B00]">{filteredTeams.length}</div>
          <div className="text-white/60 text-sm">Resultados</div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <div key={team.id} className="bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-2xl overflow-hidden hover:border-[#FF6B00]/40 transition-all">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-start justify-between mb-4">
                {team.logo && (team.logo.startsWith('http') || team.logo.startsWith('data:')) ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#FF6B00]/20">
                    <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="text-5xl">{team.logo || '⚽'}</div>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{team.name}</h3>
              <p className="text-white/60 text-sm">{team.description}</p>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FF6B00]/10 rounded-lg">
                  <User className="w-4 h-4 text-[#FF6B00]" />
                </div>
                <div className="flex-1">
                  <div className="text-white/60 text-xs">Presidente</div>
                  <div className="text-white text-sm font-medium">{team.president || 'Não informado'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FF6B00]/10 rounded-lg">
                  <Phone className="w-4 h-4 text-[#FF6B00]" />
                </div>
                <div className="flex-1">
                  <div className="text-white/60 text-xs">Contato</div>
                  <div className="text-white text-sm font-medium">{team.phone || 'Não informado'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FF6B00]/10 rounded-lg">
                  <Tag className="w-4 h-4 text-[#FF6B00]" />
                </div>
                <div className="flex-1">
                  <div className="text-white/60 text-xs">Categoria</div>
                  <div className="text-white text-sm font-medium">{team.category || 'Não informada'}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10">
                {(() => {
                  const hasAvailableDates = (teamAvailableDates[team.id] || []).length > 0;
                  return (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
                      hasAvailableDates
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      <Calendar className="w-4 h-4" />
                      <span>
                        {hasAvailableDates 
                          ? `${teamAvailableDates[team.id].length} data(s) disponível(is)`
                          : 'Sem datas disponíveis'
                        }
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="p-6 pt-0">
              {(() => {
                const hasAvailableDates = (teamAvailableDates[team.id] || []).length > 0;
                return (
                  <button 
                    onClick={() => openCalendarModal(team)}
                    disabled={!hasAvailableDates}
                    className={`w-full font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
                      hasAvailableDates
                        ? 'bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white'
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
          <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum time encontrado</h3>
          <p className="text-white/60">Tente buscar com outros termos ou limpe o filtro.</p>
        </div>
      )}

      {/* Modal de Calendário */}
      {showCalendarModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {selectedTeam.logo && (selectedTeam.logo.startsWith('http') || selectedTeam.logo.startsWith('data:')) ? (
                  <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#FF6B00]/20">
                    <img src={selectedTeam.logo} alt={selectedTeam.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="text-3xl">{selectedTeam.logo || '⚽'}</div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedTeam.name}</h3>
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

            <div className="p-6 border-b border-white/10">
              {renderCalendar()}
            </div>

            <div className="p-6 space-y-4">
              {selectedDate && (
                <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/20 rounded-xl p-4">
                  <div className="text-[#FF6B00] text-sm font-medium mb-1">Data selecionada</div>
                  <div className="text-white font-bold">
                    {selectedDate.toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      day: '2-digit', 
                      month: 'long' 
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-white font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF6B00]" />
                  Horário pretendido
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FF6B00]/40 transition-all"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#FF6B00]" />
                  Mensagem (opcional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ex: Podemos jogar no campo do bairro..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6B00]/40 transition-all resize-none"
                />
              </div>

              {userTeams.length === 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-yellow-500 text-sm">
                  Você precisa criar um time primeiro para enviar convites.
                </div>
              )}

              <button
                onClick={handleMarcarJogo}
                disabled={!selectedDate || !selectedTime || !selectedMyTeam || sending}
                className={`w-full font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  selectedDate && selectedTime && selectedMyTeam && !sending
                    ? 'bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white'
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
                    <Calendar className="w-5 h-5" />
                    Enviar Convite
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
