'use client';

import Navigation from '@/components/Navigation';
import { matches } from '@/lib/mock-data';
import { Mail, CheckCircle, XCircle, Clock, Calendar, MapPin, Send, AlertCircle, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ConvitesPage() {
  const [filter, setFilter] = useState<'received' | 'accepted' | 'declined'>('received');
  const [mounted, setMounted] = useState(false);
  const [acceptedMatches, setAcceptedMatches] = useState<string[]>([]);
  const [declinedMatches, setDeclinedMatches] = useState<string[]>([]);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Carregar convites aceitos/recusados do localStorage
    const savedAccepted = localStorage.getItem('acceptedMatches');
    const savedDeclined = localStorage.getItem('declinedMatches');
    if (savedAccepted) setAcceptedMatches(JSON.parse(savedAccepted));
    if (savedDeclined) setDeclinedMatches(JSON.parse(savedDeclined));
  }, []);

  // Partidas pendentes são convites recebidos
  const receivedInvites = matches.filter(m => 
    (m.status === 'pending' || m.status === 'scheduled') && 
    !acceptedMatches.includes(m.id) && 
    !declinedMatches.includes(m.id)
  );
  
  // Convites aceitos (partidas que aceitei)
  const acceptedInvitesList = matches.filter(m => acceptedMatches.includes(m.id));
  
  // Convites recusados
  const declinedInvitesList = matches.filter(m => declinedMatches.includes(m.id));

  // Função para aceitar convite
  const handleAccept = (matchId: string) => {
    const newAccepted = [...acceptedMatches, matchId];
    setAcceptedMatches(newAccepted);
    localStorage.setItem('acceptedMatches', JSON.stringify(newAccepted));
    setShowNotification('Convite aceito! A partida foi adicionada à sua Agenda.');
    setTimeout(() => setShowNotification(null), 3000);
  };

  // Função para recusar convite
  const handleDecline = (matchId: string) => {
    const newDeclined = [...declinedMatches, matchId];
    setDeclinedMatches(newDeclined);
    localStorage.setItem('declinedMatches', JSON.stringify(newDeclined));
    setShowNotification('Convite recusado.');
    setTimeout(() => setShowNotification(null), 3000);
  };

  const formatDate = (dateString: string) => {
    if (!mounted) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Obter lista baseada no filtro
  const getFilteredList = () => {
    switch (filter) {
      case 'received':
        return receivedInvites;
      case 'accepted':
        return acceptedInvitesList;
      case 'declined':
        return declinedInvitesList;
      default:
        return receivedInvites;
    }
  };

  const filteredList = getFilteredList();

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Convites
          </h1>
          <p className="text-white/60 text-base sm:text-lg">Gerencie os convites de partidas recebidos</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-yellow-500/20 rounded-xl p-5">
            <div className="text-3xl font-bold text-yellow-500 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {receivedInvites.length}
            </div>
            <div className="text-white/60 text-sm">Pendentes</div>
          </div>
          
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-green-500/20 rounded-xl p-5">
            <div className="text-3xl font-bold text-green-500 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {acceptedInvitesList.length}
            </div>
            <div className="text-white/60 text-sm">Aceitos</div>
          </div>
          
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-red-500/20 rounded-xl p-5">
            <div className="text-3xl font-bold text-red-500 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {declinedInvitesList.length}
            </div>
            <div className="text-white/60 text-sm">Recusados</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('received')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              filter === 'received'
                ? 'bg-yellow-600 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Pendentes ({receivedInvites.length})
          </button>
          
          <button
            onClick={() => setFilter('accepted')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              filter === 'accepted'
                ? 'bg-green-600 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Aceitos ({acceptedInvitesList.length})
          </button>
          
          <button
            onClick={() => setFilter('declined')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              filter === 'declined'
                ? 'bg-red-600 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Recusados ({declinedInvitesList.length})
          </button>
        </div>

        {/* Invites List */}
        <div className="space-y-4">
          {filteredList.map((match) => {
            const isAccepted = acceptedMatches.includes(match.id);
            const isDeclined = declinedMatches.includes(match.id);
            
            return (
              <div key={match.id} className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF5A00]/20 rounded-2xl p-5 sm:p-6 hover:border-[#FF5A00]/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,90,0,0.15)]">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#FF5A00]/10 rounded-xl">
                      <Mail className="w-6 h-6 text-[#FF5A00]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Desafio de {match.homeTeam}</h3>
                      <p className="text-white/60 text-sm">Para: {match.awayTeam}</p>
                    </div>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
                    isAccepted 
                      ? 'bg-green-500/20 text-green-500' 
                      : isDeclined
                      ? 'bg-red-500/20 text-red-500'
                      : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {!isAccepted && !isDeclined && <AlertCircle className="w-4 h-4" />}
                    {isAccepted && <CheckCircle className="w-4 h-4" />}
                    {isDeclined && <XCircle className="w-4 h-4" />}
                    {isAccepted ? 'Aceito' : isDeclined ? 'Recusado' : 'Pendente'}
                  </div>
                </div>

                {/* Match Details */}
                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#FF5A00]" />
                      <div>
                        <div className="text-white/60 text-xs">Data</div>
                        <div className="text-white font-medium text-sm capitalize">{formatDate(match.date)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#FF5A00]" />
                      <div>
                        <div className="text-white/60 text-xs">Horário</div>
                        <div className="text-white font-medium text-sm">{match.time}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#FF5A00]" />
                      <div>
                        <div className="text-white/60 text-xs">Local</div>
                        <div className="text-white font-medium text-sm">{match.location}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="text-center flex-1">
                      <div className="text-white font-bold">{match.homeTeam}</div>
                      <div className="text-white/40 text-xs">Casa</div>
                    </div>
                    
                    <div className="px-4 py-2 bg-[#FF5A00]/10 rounded-lg">
                      <div className="text-[#FF5A00] font-bold text-sm">VS</div>
                    </div>
                    
                    <div className="text-center flex-1">
                      <div className="text-white font-bold">{match.awayTeam}</div>
                      <div className="text-white/40 text-xs">Visitante</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {!isAccepted && !isDeclined && (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleAccept(match.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Aceitar
                    </button>
                    <button 
                      onClick={() => handleDecline(match.id)}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Recusar
                    </button>
                  </div>
                )}

                {isAccepted && (
                  <div className="flex gap-3">
                    <div className="flex-1 bg-green-500/10 text-green-500 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Convite Aceito
                    </div>
                    <Link href="/agenda" className="bg-[#FF5A00] hover:bg-[#FF5A00]/90 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center gap-2">
                      Ver na Agenda
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                {isDeclined && (
                  <div className="bg-red-500/10 text-red-500 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Desafio Recusado
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredList.length === 0 && (
          <div className="text-center py-20">
            <Mail className="w-20 h-20 text-white/20 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Nenhum convite encontrado
            </h3>
            <p className="text-white/60 mb-8">
              {filter === 'received' && 'Você não tem convites pendentes no momento.'}
              {filter === 'accepted' && 'Você ainda não aceitou nenhum convite.'}
              {filter === 'declined' && 'Você não recusou nenhum convite.'}
            </p>
            <Link 
              href="/buscar"
              className="inline-flex items-center gap-2 bg-[#FF5A00] hover:bg-[#FF5A00]/90 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,90,0,0.3)]"
            >
              <Send className="w-5 h-5" />
              Marcar Jogo
            </Link>
          </div>
        )}

        {/* Notificação */}
        {showNotification && (
          <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 z-50">
            <CheckCircle className="w-5 h-5" />
            {showNotification}
          </div>
        )}
      </main>
    </div>
  );
}
