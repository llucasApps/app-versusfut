'use client';

import Navigation from '@/components/Navigation';
import { matches, allTeams, Match, Team } from '@/lib/mock-data';
import { Mail, CheckCircle, XCircle, Clock, Calendar, MapPin, Send, AlertCircle, ArrowRight, X, Users, Trophy, Target, Shield, Phone, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ConvitesPage() {
  const [filter, setFilter] = useState<'received' | 'accepted' | 'declined'>('received');
  const [mounted, setMounted] = useState(false);
  const [acceptedMatches, setAcceptedMatches] = useState<string[]>([]);
  const [declinedMatches, setDeclinedMatches] = useState<string[]>([]);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

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

  // Função para abrir detalhes do convite
  const openInviteDetails = (match: Match) => {
    setSelectedMatch(match);
  };

  // Buscar time pelo nome
  const getTeamByName = (name: string): Team | undefined => {
    return allTeams.find(t => t.name === name);
  };

  // Foto do elenco baseada no ID do time
  const getTeamElencoPhoto = (teamId: string): string => {
    const photos: Record<string, string> = {
      '1': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
      '2': 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80',
      '3': 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&q=80',
      '4': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
      '5': 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
      '6': 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80',
    };
    return photos[teamId] || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80';
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
              <div 
                key={match.id} 
                className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF5A00]/20 rounded-2xl p-5 sm:p-6 hover:border-[#FF5A00]/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,90,0,0.15)] cursor-pointer"
                onClick={() => openInviteDetails(match)}
              >
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
                      onClick={(e) => { e.stopPropagation(); handleAccept(match.id); }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Aceitar
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDecline(match.id); }}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Recusar
                    </button>
                  </div>
                )}

                {isAccepted && (
                  <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
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

      {/* Modal Detalhes do Convite */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="sticky top-0 bg-[#1A1A1A] border-b border-white/10 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Detalhes do Convite
                </h2>
                <p className="text-white/60 text-sm mt-1">
                  Desafio de {selectedMatch.homeTeam}
                </p>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status do Convite */}
              <div className={`p-4 rounded-xl flex items-center gap-3 ${
                acceptedMatches.includes(selectedMatch.id)
                  ? 'bg-green-500/10 border border-green-500/20'
                  : declinedMatches.includes(selectedMatch.id)
                  ? 'bg-red-500/10 border border-red-500/20'
                  : 'bg-yellow-500/10 border border-yellow-500/20'
              }`}>
                {acceptedMatches.includes(selectedMatch.id) && (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <div>
                      <div className="text-green-500 font-bold">Convite Aceito</div>
                      <div className="text-green-500/60 text-sm">Esta partida está confirmada na sua agenda</div>
                    </div>
                  </>
                )}
                {declinedMatches.includes(selectedMatch.id) && (
                  <>
                    <XCircle className="w-6 h-6 text-red-500" />
                    <div>
                      <div className="text-red-500 font-bold">Convite Recusado</div>
                      <div className="text-red-500/60 text-sm">Você recusou este desafio</div>
                    </div>
                  </>
                )}
                {!acceptedMatches.includes(selectedMatch.id) && !declinedMatches.includes(selectedMatch.id) && (
                  <>
                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                    <div>
                      <div className="text-yellow-500 font-bold">Aguardando Resposta</div>
                      <div className="text-yellow-500/60 text-sm">Responda este convite para confirmar ou recusar</div>
                    </div>
                  </>
                )}
              </div>

              {/* Informações da Partida */}
              <div className="bg-white/5 rounded-xl p-5">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#FF6B00]" />
                  Informações da Partida
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#FF6B00]/10 rounded-lg">
                      <Calendar className="w-5 h-5 text-[#FF6B00]" />
                    </div>
                    <div>
                      <div className="text-white/60 text-xs">Data</div>
                      <div className="text-white font-medium capitalize">{formatDate(selectedMatch.date)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#FF6B00]/10 rounded-lg">
                      <Clock className="w-5 h-5 text-[#FF6B00]" />
                    </div>
                    <div>
                      <div className="text-white/60 text-xs">Horário</div>
                      <div className="text-white font-medium">{selectedMatch.time}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <div className="p-2 bg-[#FF6B00]/10 rounded-lg">
                      <MapPin className="w-5 h-5 text-[#FF6B00]" />
                    </div>
                    <div>
                      <div className="text-white/60 text-xs">Local</div>
                      <div className="text-white font-medium">{selectedMatch.location}</div>
                    </div>
                  </div>
                </div>

                {/* VS */}
                <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="text-3xl mb-2">{getTeamByName(selectedMatch.homeTeam)?.logo || '⚽'}</div>
                    <div className="text-white font-bold">{selectedMatch.homeTeam}</div>
                    <div className="text-white/40 text-xs">Casa</div>
                  </div>
                  <div className="px-6 py-3 bg-[#FF6B00]/10 rounded-xl">
                    <div className="text-[#FF6B00] font-bold text-xl">VS</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-3xl mb-2">{getTeamByName(selectedMatch.awayTeam)?.logo || '⚽'}</div>
                    <div className="text-white font-bold">{selectedMatch.awayTeam}</div>
                    <div className="text-white/40 text-xs">Visitante</div>
                  </div>
                </div>
              </div>

              {/* Informações do Time que Enviou */}
              {(() => {
                const senderTeam = getTeamByName(selectedMatch.homeTeam);
                if (!senderTeam) return null;
                
                return (
                  <div className="bg-white/5 rounded-xl p-5">
                    {/* Header com Logo e Nome */}
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B00]/20 to-[#FF6B00]/5 rounded-xl flex items-center justify-center text-3xl border border-[#FF6B00]/20">
                        {senderTeam.logo || '⚽'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {senderTeam.name}
                        </h3>
                        {senderTeam.description && (
                          <p className="text-white/60 text-sm mt-1">{senderTeam.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Informações do Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {senderTeam.president && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#FF6B00]/10 rounded-lg">
                            <User className="w-4 h-4 text-[#FF6B00]" />
                          </div>
                          <div>
                            <div className="text-white/60 text-xs">Presidente</div>
                            <div className="text-white font-medium">{senderTeam.president}</div>
                          </div>
                        </div>
                      )}
                      {senderTeam.phone && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#FF6B00]/10 rounded-lg">
                            <Phone className="w-4 h-4 text-[#FF6B00]" />
                          </div>
                          <div>
                            <div className="text-white/60 text-xs">Contato</div>
                            <div className="text-white font-medium">{senderTeam.phone}</div>
                          </div>
                        </div>
                      )}
                      {senderTeam.category && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#FF6B00]/10 rounded-lg">
                            <Users className="w-4 h-4 text-[#FF6B00]" />
                          </div>
                          <div>
                            <div className="text-white/60 text-xs">Categoria</div>
                            <div className="text-white font-medium">{senderTeam.category}</div>
                          </div>
                        </div>
                      )}
                      {senderTeam.teamType && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#FF6B00]/10 rounded-lg">
                            <Target className="w-4 h-4 text-[#FF6B00]" />
                          </div>
                          <div>
                            <div className="text-white/60 text-xs">Tipo</div>
                            <div className="text-white font-medium">{senderTeam.teamType}</div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${senderTeam.hasVenue ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                          <MapPin className={`w-4 h-4 ${senderTeam.hasVenue ? 'text-green-500' : 'text-red-500'}`} />
                        </div>
                        <div>
                          <div className="text-white/60 text-xs">Local Próprio</div>
                          <div className={`font-medium ${senderTeam.hasVenue ? 'text-green-500' : 'text-red-500'}`}>
                            {senderTeam.hasVenue ? 'Sim, possui local' : 'Não possui'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Foto do Elenco */}
              {(() => {
                const senderTeam = getTeamByName(selectedMatch.homeTeam);
                if (!senderTeam) return null;
                
                // Foto do elenco baseada no ID do time
                const elencoPhoto = getTeamElencoPhoto(senderTeam.id);
                
                return (
                  <div className="bg-white/5 rounded-xl p-5">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#FF6B00]" />
                      Foto do Elenco
                    </h3>
                    <div className="aspect-video bg-white/10 rounded-xl overflow-hidden border border-[#FF6B00]/20">
                      <img 
                        src={elencoPhoto} 
                        alt={`Elenco do ${senderTeam.name}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80';
                        }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Ações */}
              {!acceptedMatches.includes(selectedMatch.id) && !declinedMatches.includes(selectedMatch.id) && (
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button 
                    onClick={() => { handleAccept(selectedMatch.id); setSelectedMatch(null); }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Aceitar Convite
                  </button>
                  <button 
                    onClick={() => { handleDecline(selectedMatch.id); setSelectedMatch(null); }}
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Recusar
                  </button>
                </div>
              )}

              {acceptedMatches.includes(selectedMatch.id) && (
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <Link 
                    href="/agenda" 
                    className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Ver na Agenda
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
