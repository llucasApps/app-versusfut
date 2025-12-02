'use client';

import Navigation from '@/components/Navigation';
import { matches } from '@/lib/mock-data';
import { Calendar, Clock, MapPin, Filter, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AgendaPage() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
        return { icon: CheckCircle, text: 'Confirmado', color: 'text-[#00FF00]', bg: 'bg-[#00FF00]/20' };
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

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-xl p-5">
            <div className="text-3xl font-bold text-[#00FF00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {upcomingMatches.length}
            </div>
            <div className="text-white/60 text-sm">Próximos Jogos</div>
          </div>
          
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-xl p-5">
            <div className="text-3xl font-bold text-[#00FF00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {matches.filter(m => m.status === 'confirmed').length}
            </div>
            <div className="text-white/60 text-sm">Confirmados</div>
          </div>
          
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-xl p-5">
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
                ? 'bg-[#00FF00] text-black'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Todos ({matches.length})
          </button>
          
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              filter === 'upcoming'
                ? 'bg-[#00FF00] text-black'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Próximos ({upcomingMatches.length})
          </button>
          
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              filter === 'completed'
                ? 'bg-[#00FF00] text-black'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Finalizados ({completedMatches.length})
          </button>
        </div>

        {/* Matches List */}
        <div className="space-y-4">
          {filteredMatches.map((match) => {
            const statusInfo = getStatusInfo(match.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={match.id} className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-2xl p-5 sm:p-6 hover:border-[#00FF00]/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,0,0.15)]">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#00FF00]" />
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
                      <div className="px-6 py-3 bg-[#00FF00]/10 rounded-xl">
                        <div className="text-[#00FF00] font-bold text-lg">VS</div>
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
                    <MapPin className="w-4 h-4 text-[#00FF00]" />
                    <span className="text-sm">{match.location}</span>
                  </div>
                </div>

                {/* Actions for upcoming matches */}
                {match.status !== 'completed' && (
                  <div className="mt-4 pt-4 border-t border-white/10 flex gap-3">
                    <button className="flex-1 bg-[#00FF00] hover:bg-[#00FF00]/90 text-black font-medium py-2 px-4 rounded-lg transition-all text-sm">
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
      </main>
    </div>
  );
}
