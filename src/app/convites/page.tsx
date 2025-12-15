'use client';

import Navigation from '@/components/Navigation';
import { supabase, Team, MatchInvite, InviteMessage } from '@/lib/supabase';
import { Mail, CheckCircle, XCircle, Clock, Calendar, MapPin, Send, AlertCircle, ArrowRight, X, Users, Trophy, Target, Shield, Phone, User, MessageCircle, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function ConvitesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'received' | 'sent' | 'accepted' | 'declined'>('received');
  const [mounted, setMounted] = useState(false);
  
  // Dados do Supabase
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [allInvites, setAllInvites] = useState<MatchInvite[]>([]);
  const [chatMessages, setChatMessages] = useState<InviteMessage[]>([]);
  
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [selectedInvite, setSelectedInvite] = useState<MatchInvite | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Carregar dados do Supabase
  useEffect(() => {
    setMounted(true);
    
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // Carregar times do usuário
      const { data: myTeams } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', user.id);

      if (myTeams) {
        setUserTeams(myTeams);
        
        // Carregar convites onde o usuário é remetente ou destinatário
        const teamIds = myTeams.map(t => t.id);
        
        const { data: invites } = await supabase
          .from('match_invites')
          .select('*')
          .or(`from_team_id.in.(${teamIds.join(',')}),to_team_id.in.(${teamIds.join(',')})`)
          .order('created_at', { ascending: false });

        if (invites) {
          setAllInvites(invites);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  // IDs dos times do usuário
  const userTeamIds = userTeams.map(t => t.id);

  // Convites recebidos (pendentes)
  const receivedInvites = allInvites.filter(inv => 
    userTeamIds.includes(inv.to_team_id) && inv.status === 'pending'
  );
  
  // Convites enviados (pendentes)
  const sentInvites = allInvites.filter(inv => 
    userTeamIds.includes(inv.from_team_id) && inv.status === 'pending'
  );
  
  // Convites aceitos
  const acceptedInvites = allInvites.filter(inv => 
    (userTeamIds.includes(inv.from_team_id) || userTeamIds.includes(inv.to_team_id)) && 
    inv.status === 'accepted'
  );
  
  // Convites recusados
  const declinedInvites = allInvites.filter(inv => 
    (userTeamIds.includes(inv.from_team_id) || userTeamIds.includes(inv.to_team_id)) && 
    inv.status === 'declined'
  );

  // Função para aceitar convite
  const handleAccept = async (inviteId: string) => {
    const { error } = await supabase
      .from('match_invites')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', inviteId);

    if (error) {
      console.error('Erro ao aceitar convite:', error);
      setShowNotification('Erro ao aceitar convite.');
    } else {
      setAllInvites(prev => prev.map(inv => 
        inv.id === inviteId ? { ...inv, status: 'accepted' as const } : inv
      ));
      setShowNotification('Convite aceito! A partida foi adicionada à sua Agenda.');
      setSelectedInvite(null);
    }
    setTimeout(() => setShowNotification(null), 3000);
  };

  // Função para recusar convite
  const handleDecline = async (inviteId: string) => {
    const { error } = await supabase
      .from('match_invites')
      .update({ status: 'declined', updated_at: new Date().toISOString() })
      .eq('id', inviteId);

    if (error) {
      console.error('Erro ao recusar convite:', error);
      setShowNotification('Erro ao recusar convite.');
    } else {
      setAllInvites(prev => prev.map(inv => 
        inv.id === inviteId ? { ...inv, status: 'declined' as const } : inv
      ));
      setShowNotification('Convite recusado.');
      setSelectedInvite(null);
    }
    setTimeout(() => setShowNotification(null), 3000);
  };

  // Função para cancelar convite enviado
  const handleCancel = async (inviteId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este convite?')) return;

    const { error, count } = await supabase
      .from('match_invites')
      .delete()
      .eq('id', inviteId)
      .select();

    console.log('Delete result:', { error, count, inviteId });

    if (error) {
      console.error('Erro ao cancelar convite:', error);
      setShowNotification('Erro ao cancelar convite: ' + error.message);
    } else {
      setAllInvites(prev => prev.filter(inv => inv.id !== inviteId));
      setShowNotification('Convite cancelado com sucesso.');
      setSelectedInvite(null);
    }
    setTimeout(() => setShowNotification(null), 3000);
  };

  const formatDate = (dateString: string) => {
    if (!mounted) return '';
    // Adiciona T00:00:00 para evitar problemas de timezone
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Função para abrir detalhes do convite
  const openInviteDetails = (invite: MatchInvite) => {
    setSelectedInvite(invite);
  };

  // Foto do elenco - placeholder
  const getTeamElencoPhoto = (): string => {
    return 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80';
  };

  // Funções do Chat
  const loadChatMessages = async (inviteId: string) => {
    const { data } = await supabase
      .from('invite_messages')
      .select('*')
      .eq('invite_id', inviteId)
      .order('created_at', { ascending: true });

    if (data) {
      setChatMessages(data);
    } else {
      setChatMessages([]);
    }
  };

  const openChat = async (invite?: MatchInvite) => {
    const targetInvite = invite || selectedInvite;
    if (targetInvite) {
      setSelectedInvite(targetInvite);
      await loadChatMessages(targetInvite.id);
      setShowChatModal(true);
    }
  };

  // Contar mensagens não lidas de um convite (simplificado)
  const getUnreadCount = (): number => {
    // TODO: Implementar contagem de não lidas com read_at
    return 0;
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedInvite) return;

    // Determinar qual time do usuário está enviando
    const senderTeam = userTeams.find(t => 
      t.id === selectedInvite.from_team_id || t.id === selectedInvite.to_team_id
    );

    if (!senderTeam) return;

    const { data, error } = await supabase
      .from('invite_messages')
      .insert({
        invite_id: selectedInvite.id,
        sender_team_id: senderTeam.id,
        sender_name: senderTeam.name,
        message: newMessage.trim()
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao enviar mensagem:', error);
      return;
    }

    if (data) {
      setChatMessages(prev => [...prev, data]);
    }
    setNewMessage('');

    // Scroll para o final
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatChatTime = (timestamp: string) => {
    if (!mounted) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatChatDate = (timestamp: string) => {
    if (!mounted) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // Obter lista baseada no filtro
  const getFilteredList = (): MatchInvite[] => {
    switch (filter) {
      case 'received':
        return receivedInvites;
      case 'sent':
        return sentInvites;
      case 'accepted':
        return acceptedInvites;
      case 'declined':
        return declinedInvites;
      default:
        return receivedInvites;
    }
  };

  const filteredList = getFilteredList();

  // Verificar se o convite é recebido (para mostrar botões de aceitar/recusar)
  const isReceivedInvite = (invite: MatchInvite) => {
    return userTeamIds.includes(invite.to_team_id);
  };

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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Convites
          </h1>
          <p className="text-white/60 text-base sm:text-lg">Gerencie os convites de partidas recebidos</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-yellow-500/20 rounded-xl p-5">
            <div className="text-3xl font-bold text-yellow-500 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {receivedInvites.length}
            </div>
            <div className="text-white/60 text-sm">Recebidos</div>
          </div>
          
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-blue-500/20 rounded-xl p-5">
            <div className="text-3xl font-bold text-blue-500 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {sentInvites.length}
            </div>
            <div className="text-white/60 text-sm">Enviados</div>
          </div>
          
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-green-500/20 rounded-xl p-5">
            <div className="text-3xl font-bold text-green-500 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {acceptedInvites.length}
            </div>
            <div className="text-white/60 text-sm">Aceitos</div>
          </div>
          
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-red-500/20 rounded-xl p-5">
            <div className="text-3xl font-bold text-red-500 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {declinedInvites.length}
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
            Recebidos ({receivedInvites.length})
          </button>
          
          <button
            onClick={() => setFilter('sent')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              filter === 'sent'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Enviados ({sentInvites.length})
          </button>
          
          <button
            onClick={() => setFilter('accepted')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              filter === 'accepted'
                ? 'bg-green-600 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Aceitos ({acceptedInvites.length})
          </button>
          
          <button
            onClick={() => setFilter('declined')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              filter === 'declined'
                ? 'bg-red-600 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Recusados ({declinedInvites.length})
          </button>
        </div>

        {/* Invites List */}
        <div className="space-y-4">
          {filteredList.map((invite) => {
            const isReceived = isReceivedInvite(invite);
            
            return (
              <div 
                key={invite.id} 
                className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF5A00]/20 rounded-2xl p-5 sm:p-6 hover:border-[#FF5A00]/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,90,0,0.15)] cursor-pointer"
                onClick={() => openInviteDetails(invite)}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#FF5A00]/10 rounded-xl">
                      <Mail className="w-6 h-6 text-[#FF5A00]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white">
                          {isReceived ? `Convite de ${invite.from_team_name}` : `Convite para ${invite.to_team_name}`}
                        </h3>
                      </div>
                      <p className="text-white/60 text-sm">
                        {isReceived ? `Para: ${invite.to_team_name}` : `De: ${invite.from_team_name}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
                    invite.status === 'accepted' 
                      ? 'bg-green-500/20 text-green-500' 
                      : invite.status === 'declined'
                      ? 'bg-red-500/20 text-red-500'
                      : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {invite.status === 'pending' && <AlertCircle className="w-4 h-4" />}
                    {invite.status === 'accepted' && <CheckCircle className="w-4 h-4" />}
                    {invite.status === 'declined' && <XCircle className="w-4 h-4" />}
                    {invite.status === 'accepted' ? 'Aceito' : invite.status === 'declined' ? 'Recusado' : 'Pendente'}
                  </div>
                </div>

                {/* Match Details */}
                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#FF5A00]" />
                      <div>
                        <div className="text-white/60 text-xs">Data</div>
                        <div className="text-white font-medium text-sm capitalize">{formatDate(invite.proposed_date)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#FF5A00]" />
                      <div>
                        <div className="text-white/60 text-xs">Horário</div>
                        <div className="text-white font-medium text-sm">{invite.proposed_time}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#FF5A00]" />
                      <div>
                        <div className="text-white/60 text-xs">Local</div>
                        <div className="text-white font-medium text-sm">{invite.proposed_location || 'A definir'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="text-center flex-1">
                      <div className="text-white font-bold">{invite.from_team_name}</div>
                      {/* <div className="text-white/40 text-xs">Desafiante</div> */}
                    </div>
                    
                    <div className="px-4 py-2 bg-[#FF5A00]/10 rounded-lg">
                      <div className="text-[#FF5A00] font-bold text-sm">VS</div>
                    </div>
                    
                    <div className="text-center flex-1">
                      <div className="text-white font-bold">{invite.to_team_name}</div>
                      {/* <div className="text-white/40 text-xs">Desafiado</div> */}
                    </div>
                  </div>
                </div>

                {/* Mensagem do convite - clicável para abrir chat */}
                {invite.message && (
                  <div 
                    className="bg-white/5 hover:bg-white/10 rounded-xl p-4 mb-4 cursor-pointer transition-colors"
                    onClick={(e) => { e.stopPropagation(); openChat(invite); }}
                  >
                    <div className="flex items-start gap-2">
                      <MessageCircle className="w-4 h-4 text-[#FF5A00] mt-0.5" />
                      <div className="flex-1">
                        <div className="text-white/60 text-xs mb-1">Mensagem</div>
                        <div className="text-white text-sm">{invite.message}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/40" />
                    </div>
                  </div>
                )}

                {/* Actions - apenas para convites recebidos pendentes */}
                {isReceived && invite.status === 'pending' && (
                  <div className="flex gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAccept(invite.id); }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Aceitar
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDecline(invite.id); }}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Recusar
                    </button>
                  </div>
                )}

                {/* Status para convites enviados pendentes */}
                {!isReceived && invite.status === 'pending' && (
                  <div className="bg-yellow-500/10 text-yellow-500 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5" />
                    Aguardando resposta
                  </div>
                )}

                {invite.status === 'accepted' && (
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

                {invite.status === 'declined' && (
                  <div className="bg-red-500/10 text-red-500 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Convite Recusado
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
      {selectedInvite && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="sticky top-0 bg-[#1A1A1A] border-b border-white/10 p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Detalhes do Convite
                </h2>
                <p className="text-white/60 text-sm mt-1">
                  {isReceivedInvite(selectedInvite) 
                    ? `Convite de ${selectedInvite.from_team_name}`
                    : `Convite para ${selectedInvite.to_team_name}`
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openChat()}
                  className="flex items-center gap-2 bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 text-[#FF6B00] px-4 py-2 rounded-xl transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="hidden sm:inline">Chat</span>
                </button>
                <button
                  onClick={() => setSelectedInvite(null)}
                  className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status do Convite */}
              <div className={`p-4 rounded-xl flex items-center gap-3 ${
                selectedInvite.status === 'accepted'
                  ? 'bg-green-500/10 border border-green-500/20'
                  : selectedInvite.status === 'declined'
                  ? 'bg-red-500/10 border border-red-500/20'
                  : 'bg-yellow-500/10 border border-yellow-500/20'
              }`}>
                {selectedInvite.status === 'accepted' && (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <div>
                      <div className="text-green-500 font-bold">Convite Aceito</div>
                      <div className="text-green-500/60 text-sm">Esta partida está confirmada</div>
                    </div>
                  </>
                )}
                {selectedInvite.status === 'declined' && (
                  <>
                    <XCircle className="w-6 h-6 text-red-500" />
                    <div>
                      <div className="text-red-500 font-bold">Convite Recusado</div>
                      <div className="text-red-500/60 text-sm">Este convite foi recusado</div>
                    </div>
                  </>
                )}
                {selectedInvite.status === 'pending' && (
                  <>
                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                    <div>
                      <div className="text-yellow-500 font-bold">Aguardando Resposta</div>
                      <div className="text-yellow-500/60 text-sm">
                        {isReceivedInvite(selectedInvite) 
                          ? 'Responda este convite para confirmar ou recusar'
                          : 'Aguardando resposta do time adversário'
                        }
                      </div>
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
                      <div className="text-white font-medium capitalize">{formatDate(selectedInvite.proposed_date)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#FF6B00]/10 rounded-lg">
                      <Clock className="w-5 h-5 text-[#FF6B00]" />
                    </div>
                    <div>
                      <div className="text-white/60 text-xs">Horário</div>
                      <div className="text-white font-medium">{selectedInvite.proposed_time}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <div className="p-2 bg-[#FF6B00]/10 rounded-lg">
                      <MapPin className="w-5 h-5 text-[#FF6B00]" />
                    </div>
                    <div>
                      <div className="text-white/60 text-xs">Local</div>
                      <div className="text-white font-medium">{selectedInvite.proposed_location || 'A definir'}</div>
                    </div>
                  </div>
                </div>

                {/* VS */}
                <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="text-3xl mb-2">⚽</div>
                    <div className="text-white font-bold">{selectedInvite.from_team_name}</div>
                    {/* <div className="text-white/40 text-xs">Desafiante</div> */}
                  </div>
                  <div className="px-6 py-3 bg-[#FF6B00]/10 rounded-xl">
                    <div className="text-[#FF6B00] font-bold text-xl">VS</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-3xl mb-2">⚽</div>
                    <div className="text-white font-bold">{selectedInvite.to_team_name}</div>
                    {/* <div className="text-white/40 text-xs">Desafiado</div> */}
                  </div>
                </div>
              </div>

              {/* Mensagem do Convite */}
              {selectedInvite.message && (
                <div className="bg-white/5 rounded-xl p-5">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[#FF6B00]" />
                    Mensagem
                  </h3>
                  <p className="text-white/80">{selectedInvite.message}</p>
                </div>
              )}

              {/* Ações - para convites recebidos pendentes */}
              {isReceivedInvite(selectedInvite) && selectedInvite.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button 
                    onClick={() => handleAccept(selectedInvite.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Aceitar Convite
                  </button>
                  <button 
                    onClick={() => handleDecline(selectedInvite.id)}
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Recusar
                  </button>
                </div>
              )}

              {/* Ações - para convites enviados pendentes */}
              {!isReceivedInvite(selectedInvite) && selectedInvite.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button 
                    onClick={() => handleCancel(selectedInvite.id)}
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Cancelar Convite
                  </button>
                </div>
              )}

              {selectedInvite.status === 'accepted' && (
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

      {/* Modal de Chat */}
      {showChatModal && selectedInvite && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-2xl w-full max-w-lg h-[80vh] flex flex-col">
            {/* Header do Chat */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF6B00]/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[#FF6B00]" />
                </div>
                <div>
                  <h3 className="text-white font-bold">
                    Chat - {selectedInvite.from_team_name} vs {selectedInvite.to_team_name}
                  </h3>
                  <p className="text-white/60 text-xs">Conversa sobre o convite</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Área de Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="w-16 h-16 text-white/20 mb-4" />
                  <p className="text-white/60 mb-2">Nenhuma mensagem ainda</p>
                  <p className="text-white/40 text-sm">Inicie uma conversa sobre este convite</p>
                </div>
              ) : (
                <>
                  {chatMessages.map((msg, index) => {
                    const isMyMessage = userTeamIds.includes(msg.sender_team_id);
                    const msgDate = msg.created_at ? formatChatDate(msg.created_at) : '';
                    const prevMsgDate = index > 0 && chatMessages[index - 1].created_at 
                      ? formatChatDate(chatMessages[index - 1].created_at!) 
                      : '';
                    const showDate = index === 0 || msgDate !== prevMsgDate;
                    
                    return (
                      <div key={msg.id}>
                        {showDate && msgDate && (
                          <div className="flex justify-center my-4">
                            <span className="bg-white/10 text-white/60 text-xs px-3 py-1 rounded-full">
                              {msgDate}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            isMyMessage
                              ? 'bg-[#FF6B00] text-white rounded-br-md'
                              : 'bg-white/10 text-white rounded-bl-md'
                          }`}>
                            <p className="text-xs font-medium mb-1 opacity-70">{msg.sender_name}</p>
                            <p className="text-sm">{msg.message}</p>
                            {msg.created_at && (
                              <p className={`text-xs mt-1 ${isMyMessage ? 'text-white/70' : 'text-white/50'}`}>
                                {formatChatTime(msg.created_at)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </>
              )}
            </div>

            {/* Input de Mensagem */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#FF6B00] focus:outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 disabled:bg-white/10 disabled:text-white/40 text-white p-3 rounded-xl transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
