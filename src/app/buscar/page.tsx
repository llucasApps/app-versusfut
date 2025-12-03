'use client';

import Navigation from '@/components/Navigation';
import { opponentTeams, allTeams, Team } from '@/lib/mock-data';
import { Search, User, Phone, Tag, Calendar, X, ChevronLeft, ChevronRight, Clock, MessageSquare, Send, CheckCircle, Users, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

export default function BuscarPage() {
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

  // Fotos de elenco simuladas (em produção viriam do backend)
  const getTeamPhoto = (teamId: string) => {
    // Simulando fotos de elenco para cada time
    const photos: Record<string, string> = {
      '4': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
      '5': 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
      '6': 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80',
    };
    return photos[teamId] || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80';
  };

  const openTeamPhotoModal = (team: Team) => {
    setTeamPhotoData({
      name: team.name,
      logo: team.logo,
      photo: getTeamPhoto(team.id)
    });
    setShowTeamPhotoModal(true);
  };

  // Datas disponíveis simuladas (em produção viriam do backend)
  const getAvailableDates = (teamId: string) => {
    // Simulando datas disponíveis para cada time
    const today = new Date();
    const dates: Date[] = [];
    for (let i = 3; i < 30; i += 3) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
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

  const handleMarcarJogo = () => {
    if (!selectedDate || !selectedTime || !selectedTeam) return;

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
  
  const filteredTeams = opponentTeams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Buscar Times
          </h1>
          <p className="text-white/60 text-base sm:text-lg">Encontre adversários e desafie para uma partida</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Buscar times por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B35]/20 rounded-xl py-4 px-12 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6B35]/40 transition-all"
            />
          </div>
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
                    <div className="text-5xl">{team.logo}</div>
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
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
                      team.availableForMatch !== false
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      <Calendar className="w-5 h-5" />
                      <span className="font-medium">
                        {team.availableForMatch !== false 
                          ? 'Datas disponíveis para agendar partida'
                          : 'Sem datas disponíveis no momento'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-0">
                  <button 
                    onClick={() => openCalendarModal(team)}
                    disabled={team.availableForMatch === false}
                    className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                      team.availableForMatch !== false
                        ? 'bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white hover:shadow-[0_0_20px_rgba(255,107,53,0.3)]'
                        : 'bg-white/10 text-white/40 cursor-not-allowed'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                    Ver Calendário
                  </button>
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
                <div className="text-4xl">{selectedTeam.logo}</div>
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

              {/* Botão Marcar Jogo */}
              <button
                onClick={handleMarcarJogo}
                disabled={!selectedDate || !selectedTime}
                className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                  selectedDate && selectedTime
                    ? 'bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white hover:shadow-[0_0_20px_rgba(255,107,53,0.3)]'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
                Marcar Jogo
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
              <div className="text-4xl">{teamPhotoData.logo}</div>
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
