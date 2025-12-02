'use client';

import Navigation from '@/components/Navigation';
import { invites, matches } from '@/lib/mock-data';
import { Mail, CheckCircle, XCircle, Clock, Calendar, MapPin, Send } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ConvitesPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pendingInvites = invites.filter(i => i.status === 'pending');
  const acceptedInvites = invites.filter(i => i.status === 'accepted');
  const declinedInvites = invites.filter(i => i.status === 'declined');

  const filteredInvites = filter === 'all' 
    ? invites 
    : invites.filter(i => i.status === filter);

  const getMatchDetails = (matchId: string) => {
    return matches.find(m => m.id === matchId);
  };

  const formatDate = (dateString: string) => {
    if (!mounted) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Convites & Desafios
          </h1>
          <p className="text-white/60 text-base sm:text-lg">Gerencie seus convites e desafios para partidas</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-xl p-5">
            <div className="text-3xl font-bold text-[#00FF00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {pendingInvites.length}
            </div>
            <div className="text-white/60 text-sm">Pendentes</div>
          </div>
          
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-xl p-5">
            <div className="text-3xl font-bold text-[#00FF00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {acceptedInvites.length}
            </div>
            <div className="text-white/60 text-sm">Aceitos</div>
          </div>
          
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-xl p-5">
            <div className="text-3xl font-bold text-white/60 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {declinedInvites.length}
            </div>
            <div className="text-white/60 text-sm">Recusados</div>
          </div>
          
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-xl p-5">
            <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {invites.length}
            </div>
            <div className="text-white/60 text-sm">Total</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              filter === 'all'
                ? 'bg-[#00FF00] text-black'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Todos ({invites.length})
          </button>
          
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              filter === 'pending'
                ? 'bg-[#00FF00] text-black'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Pendentes ({pendingInvites.length})
          </button>
          
          <button
            onClick={() => setFilter('accepted')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              filter === 'accepted'
                ? 'bg-[#00FF00] text-black'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Aceitos ({acceptedInvites.length})
          </button>
          
          <button
            onClick={() => setFilter('declined')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              filter === 'declined'
                ? 'bg-[#00FF00] text-black'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Recusados ({declinedInvites.length})
          </button>
        </div>

        {/* Invites List */}
        <div className="space-y-4">
          {filteredInvites.map((invite) => {
            const match = getMatchDetails(invite.matchId);
            
            return (
              <div key={invite.id} className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-2xl p-5 sm:p-6 hover:border-[#00FF00]/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,0,0.15)]">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#00FF00]/10 rounded-xl">
                      <Mail className="w-6 h-6 text-[#00FF00]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Desafio de {invite.from}</h3>
                      <p className="text-white/60 text-sm">Para: {invite.to}</p>
                    </div>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
                    invite.status === 'pending' 
                      ? 'bg-yellow-500/20 text-yellow-500' 
                      : invite.status === 'accepted'
                      ? 'bg-[#00FF00]/20 text-[#00FF00]'
                      : 'bg-red-500/20 text-red-500'
                  }`}>
                    {invite.status === 'pending' && <Clock className="w-4 h-4" />}
                    {invite.status === 'accepted' && <CheckCircle className="w-4 h-4" />}
                    {invite.status === 'declined' && <XCircle className="w-4 h-4" />}
                    {invite.status === 'pending' ? 'Pendente' : invite.status === 'accepted' ? 'Aceito' : 'Recusado'}
                  </div>
                </div>

                {/* Match Details */}
                {match && (
                  <div className="bg-white/5 rounded-xl p-4 mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#00FF00]" />
                        <div>
                          <div className="text-white/60 text-xs">Data</div>
                          <div className="text-white font-medium text-sm">{formatDate(match.date)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#00FF00]" />
                        <div>
                          <div className="text-white/60 text-xs">Horário</div>
                          <div className="text-white font-medium text-sm">{match.time}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#00FF00]" />
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
                      
                      <div className="px-4 py-2 bg-[#00FF00]/10 rounded-lg">
                        <div className="text-[#00FF00] font-bold text-sm">VS</div>
                      </div>
                      
                      <div className="text-center flex-1">
                        <div className="text-white font-bold">{match.awayTeam}</div>
                        <div className="text-white/40 text-xs">Visitante</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {invite.status === 'pending' && (
                  <div className="flex gap-3">
                    <button className="flex-1 bg-[#00FF00] hover:bg-[#00FF00]/90 text-black font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Aceitar Desafio
                    </button>
                    <button className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                      <XCircle className="w-5 h-5" />
                      Recusar
                    </button>
                  </div>
                )}

                {invite.status === 'accepted' && (
                  <div className="flex gap-3">
                    <button className="flex-1 bg-[#00FF00]/10 text-[#00FF00] font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Desafio Aceito
                    </button>
                    <button className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-xl transition-all">
                      Ver Detalhes
                    </button>
                  </div>
                )}

                {invite.status === 'declined' && (
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
        {filteredInvites.length === 0 && (
          <div className="text-center py-20">
            <Mail className="w-20 h-20 text-white/20 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Nenhum convite encontrado
            </h3>
            <p className="text-white/60 mb-8">
              {filter === 'pending' && 'Você não tem convites pendentes no momento.'}
              {filter === 'accepted' && 'Você ainda não aceitou nenhum convite.'}
              {filter === 'declined' && 'Você não recusou nenhum convite.'}
              {filter === 'all' && 'Você não tem convites no momento.'}
            </p>
            <button className="inline-flex items-center gap-2 bg-[#00FF00] hover:bg-[#00FF00]/90 text-black font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,0,0.3)]">
              <Send className="w-5 h-5" />
              Buscar Times para Desafiar
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
