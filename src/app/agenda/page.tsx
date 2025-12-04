'use client';

import Navigation from '@/components/Navigation';
import { matches } from '@/lib/mock-data';
import { Calendar, Clock, MapPin, Filter, CheckCircle, XCircle, AlertCircle, Settings, ChevronLeft, ChevronRight, Save, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AgendaPage() {
  const [activeTab, setActiveTab] = useState<'matches' | 'settings'>('matches');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [mounted, setMounted] = useState(false);
  
  // Estados para configurações de agenda
  const [configMonth, setConfigMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [observation, setObservation] = useState('');
  const [savedConfig, setSavedConfig] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Carregar configurações salvas do localStorage
    const savedDates = localStorage.getItem('teamAvailableDates');
    const savedObs = localStorage.getItem('teamAgendaObservation');
    if (savedDates) setAvailableDates(JSON.parse(savedDates));
    if (savedObs) setObservation(savedObs);
  }, []);

  const upcomingMatches = matches.filter(m => m.status === 'scheduled' || m.status === 'confirmed' || m.status === 'pending');
  const completedMatches = matches.filter(m => m.status === 'completed');

  const filteredMatches = filter === 'all' 
    ? matches 
    : filter === 'upcoming' 
    ? upcomingMatches 
    : completedMatches;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { icon: CheckCircle, text: 'Confirmado', color: 'text-[#FF5A00]', bg: 'bg-[#FF5A00]/20' };
      case 'scheduled':
        return { icon: Clock, text: 'Agendado', color: 'text-white/60', bg: 'bg-white/10' };
      case 'pending':
        return { icon: AlertCircle, text: 'Pendente', color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
      case 'completed':
        return { icon: CheckCircle, text: 'Finalizado', color: 'text-white/40', bg: 'bg-white/10' };
      default:
        return { icon: Clock, text: 'Agendado', color: 'text-white/60', bg: 'bg-white/10' };
    }
  };

  const formatDate = (dateString: string) => {
    if (!mounted) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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

  const saveConfig = () => {
    localStorage.setItem('teamAvailableDates', JSON.stringify(availableDates));
    localStorage.setItem('teamAgendaObservation', observation);
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

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Agenda
          </h1>
          <p className="text-white/60 text-base sm:text-lg">Acompanhe todos os seus jogos agendados</p>
        </div>

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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF5A00]/20 rounded-xl p-5">
                <div className="text-3xl font-bold text-[#FF5A00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {upcomingMatches.length}
                </div>
                <div className="text-white/60 text-sm">Próximos Jogos</div>
              </div>
              
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF5A00]/20 rounded-xl p-5">
                <div className="text-3xl font-bold text-[#FF5A00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {matches.filter(m => m.status === 'confirmed').length}
                </div>
                <div className="text-white/60 text-sm">Confirmados</div>
              </div>
              
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF5A00]/20 rounded-xl p-5">
                <div className="text-3xl font-bold text-white/60 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {completedMatches.length}
                </div>
                <div className="text-white/60 text-sm">Finalizados</div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
              <div className="flex items-center gap-2 text-white/60">
                <Filter className="w-5 h-5" />
                <span className="text-sm font-medium">Filtrar:</span>
              </div>
              
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                  filter === 'all'
                    ? 'bg-[#FF5A00] text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                Todos ({matches.length})
              </button>
              
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                  filter === 'upcoming'
                    ? 'bg-[#FF5A00] text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                Próximos ({upcomingMatches.length})
              </button>
              
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                  filter === 'completed'
                    ? 'bg-[#FF5A00] text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                Finalizados ({completedMatches.length})
              </button>
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
                          <div className="text-white font-medium">{formatDate(match.date)}</div>
                          <div className="text-white/60 text-sm flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4" />
                            {match.time}
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
                        <div className="text-xl sm:text-2xl font-bold text-white mb-2">{match.homeTeam}</div>
                        <div className="text-white/40 text-sm">Casa</div>
                      </div>
                      
                      <div className="px-6 sm:px-8">
                        {match.score ? (
                          <div className="flex items-center gap-4">
                            <div className="text-3xl font-bold text-white">{match.score.home}</div>
                            <div className="text-white/40">×</div>
                            <div className="text-3xl font-bold text-white">{match.score.away}</div>
                          </div>
                        ) : (
                          <div className="px-6 py-3 bg-[#FF5A00]/10 rounded-xl">
                            <div className="text-[#FF5A00] font-bold text-lg">VS</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 text-center sm:text-right">
                        <div className="text-xl sm:text-2xl font-bold text-white mb-2">{match.awayTeam}</div>
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

                    {/* Actions for upcoming matches */}
                    {match.status !== 'completed' && (
                      <div className="mt-4 pt-4 border-t border-white/10 flex gap-3">
                        <button className="flex-1 bg-[#FF5A00] hover:bg-[#FF5A00]/90 text-white font-medium py-2 px-4 rounded-lg transition-all text-sm">
                          Ver Detalhes
                        </button>
                        {match.status === 'pending' && (
                          <button className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all text-sm">
                            Confirmar Presença
                          </button>
                        )}
                      </div>
                    )}
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
                <p className="text-white/60">Não há jogos {filter === 'upcoming' ? 'próximos' : filter === 'completed' ? 'finalizados' : ''} no momento.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
