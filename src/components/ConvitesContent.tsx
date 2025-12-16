'use client';

import { supabase, Team, MatchInvite, InviteMessage } from '@/lib/supabase';
import { Mail, CheckCircle, XCircle, Clock, Calendar, MapPin, Send, AlertCircle, ArrowRight, X, MessageCircle, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ConvitesContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'received' | 'sent' | 'accepted' | 'declined'>('received');
  const [mounted, setMounted] = useState(false);
  
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [allInvites, setAllInvites] = useState<MatchInvite[]>([]);
  const [lastMessages, setLastMessages] = useState<Record<string, InviteMessage>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [chatMessages, setChatMessages] = useState<InviteMessage[]>([]);
  
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [selectedInvite, setSelectedInvite] = useState<MatchInvite | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data: myTeams } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', user.id);

      if (myTeams) {
        setUserTeams(myTeams);
        
        const teamIds = myTeams.map(t => t.id);
        
        const { data: invites } = await supabase
          .from('match_invites')
          .select('*')
          .or(`from_team_id.in.(${teamIds.join(',')}),to_team_id.in.(${teamIds.join(',')})`)
          .order('created_at', { ascending: false });

        if (invites) {
          setAllInvites(invites);
          
          const inviteIds = invites.map(inv => inv.id);
          if (inviteIds.length > 0) {
            const { data: messages } = await supabase
              .from('invite_messages')
              .select('*')
              .in('invite_id', inviteIds)
              .order('created_at', { ascending: false });

            if (messages) {
              const lastMsgs: Record<string, InviteMessage> = {};
              const unreadByInvite: Record<string, number> = {};
              
              messages.forEach(msg => {
                if (!lastMsgs[msg.invite_id]) {
                  lastMsgs[msg.invite_id] = msg;
                }
                
                const isFromMyTeam = teamIds.includes(msg.sender_team_id);
                if (!msg.read_at && !isFromMyTeam) {
                  unreadByInvite[msg.invite_id] = (unreadByInvite[msg.invite_id] || 0) + 1;
                }
              });
              
              setLastMessages(lastMsgs);
              setUnreadCounts(unreadByInvite);
            }
          }
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const userTeamIds = userTeams.map(t => t.id);

  const receivedInvites = allInvites.filter(inv => 
    userTeamIds.includes(inv.to_team_id) && inv.status === 'pending'
  );
  
  const sentInvites = allInvites.filter(inv => 
    userTeamIds.includes(inv.from_team_id) && inv.status === 'pending'
  );
  
  const acceptedInvites = allInvites.filter(inv => 
    (userTeamIds.includes(inv.from_team_id) || userTeamIds.includes(inv.to_team_id)) && 
    inv.status === 'accepted'
  );
  
  const declinedInvites = allInvites.filter(inv => 
    (userTeamIds.includes(inv.from_team_id) || userTeamIds.includes(inv.to_team_id)) && 
    inv.status === 'declined'
  );

  const handleAccept = async (inviteId: string) => {
    const invite = allInvites.find(inv => inv.id === inviteId);
    if (!invite) return;

    const { error: updateError } = await supabase
      .from('match_invites')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', inviteId);

    if (updateError) {
      setShowNotification('Erro ao aceitar convite.');
      setTimeout(() => setShowNotification(null), 3000);
      return;
    }

    const myTeamId = userTeams.find(t => t.id === invite.to_team_id)?.id || invite.to_team_id;
    
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .insert({
        team_id: myTeamId,
        home_team_id: invite.from_team_id,
        home_team_name: invite.from_team_name,
        away_team_id: invite.to_team_id,
        away_team_name: invite.to_team_name,
        match_date: invite.proposed_date,
        match_time: invite.proposed_time,
        location: invite.proposed_location || 'A definir',
        status: 'confirmed'
      })
      .select()
      .single();

    if (matchError || !matchData) {
      await supabase
        .from('match_invites')
        .update({ status: 'pending' })
        .eq('id', inviteId);
      setShowNotification('Erro ao criar partida na agenda.');
    } else {
      await supabase
        .from('match_invites')
        .update({ match_id: matchData.id })
        .eq('id', inviteId);

      setAllInvites(prev => prev.map(inv => 
        inv.id === inviteId ? { ...inv, status: 'accepted' as const, match_id: matchData.id } : inv
      ));
      setShowNotification('Convite aceito! A partida foi adicionada à sua Agenda.');
      setSelectedInvite(null);
    }
    setTimeout(() => setShowNotification(null), 3000);
  };

  const handleDecline = async (inviteId: string) => {
    const { error } = await supabase
      .from('match_invites')
      .update({ status: 'declined', updated_at: new Date().toISOString() })
      .eq('id', inviteId);

    if (error) {
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

  const handleCancel = async (inviteId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este convite?')) return;

    const { error } = await supabase
      .from('match_invites')
      .delete()
      .eq('id', inviteId);

    if (error) {
      setShowNotification('Erro ao cancelar convite.');
    } else {
      setAllInvites(prev => prev.filter(inv => inv.id !== inviteId));
      setShowNotification('Convite cancelado com sucesso.');
      setSelectedInvite(null);
    }
    setTimeout(() => setShowNotification(null), 3000);
  };

  const formatDate = (dateString: string) => {
    if (!mounted) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short'
    });
  };

  const loadChatMessages = async (inviteId: string) => {
    const { data } = await supabase
      .from('invite_messages')
      .select('*')
      .eq('invite_id', inviteId)
      .order('created_at', { ascending: true });

    setChatMessages(data || []);
  };

  const openChat = async (invite: MatchInvite) => {
    setSelectedInvite(invite);
    await loadChatMessages(invite.id);
    setShowChatModal(true);
    
    if (unreadCounts[invite.id] > 0) {
      await supabase
        .from('invite_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('invite_id', invite.id)
        .not('sender_team_id', 'in', `(${userTeamIds.join(',')})`)
        .is('read_at', null);
      
      setUnreadCounts(prev => {
        const updated = { ...prev };
        delete updated[invite.id];
        return updated;
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedInvite) return;

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

    if (!error && data) {
      setChatMessages(prev => [...prev, data]);
      setLastMessages(prev => ({
        ...prev,
        [selectedInvite.id]: data
      }));
    }
    setNewMessage('');

    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const getFilteredList = (): MatchInvite[] => {
    switch (filter) {
      case 'received': return receivedInvites;
      case 'sent': return sentInvites;
      case 'accepted': return acceptedInvites;
      case 'declined': return declinedInvites;
      default: return receivedInvites;
    }
  };

  const filteredList = getFilteredList();
  const isReceivedInvite = (invite: MatchInvite) => userTeamIds.includes(invite.to_team_id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Notificação */}
      {showNotification && (
        <div className="fixed top-24 right-4 z-50 bg-[#FF6B00] text-white p-4 rounded-xl shadow-2xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5" />
          <span>{showNotification}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1A1A1A] border border-yellow-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-yellow-500">{receivedInvites.length}</div>
          <div className="text-white/60 text-sm">Recebidos</div>
        </div>
        <div className="bg-[#1A1A1A] border border-blue-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-500">{sentInvites.length}</div>
          <div className="text-white/60 text-sm">Enviados</div>
        </div>
        <div className="bg-[#1A1A1A] border border-green-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-500">{acceptedInvites.length}</div>
          <div className="text-white/60 text-sm">Aceitos</div>
        </div>
        <div className="bg-[#1A1A1A] border border-red-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-red-500">{declinedInvites.length}</div>
          <div className="text-white/60 text-sm">Recusados</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('received')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
            filter === 'received' ? 'bg-yellow-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          Recebidos ({receivedInvites.length})
        </button>
        <button
          onClick={() => setFilter('sent')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
            filter === 'sent' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          Enviados ({sentInvites.length})
        </button>
        <button
          onClick={() => setFilter('accepted')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
            filter === 'accepted' ? 'bg-green-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          Aceitos ({acceptedInvites.length})
        </button>
        <button
          onClick={() => setFilter('declined')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
            filter === 'declined' ? 'bg-red-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
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
              className="bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-2xl p-5 hover:border-[#FF6B00]/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FF6B00]/10 rounded-xl">
                    <Mail className="w-5 h-5 text-[#FF6B00]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {isReceived ? `Convite de ${invite.from_team_name}` : `Convite para ${invite.to_team_name}`}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {isReceived ? `Para: ${invite.to_team_name}` : `De: ${invite.from_team_name}`}
                    </p>
                  </div>
                </div>
                
                <div className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${
                  invite.status === 'accepted' ? 'bg-green-500/20 text-green-500' 
                  : invite.status === 'declined' ? 'bg-red-500/20 text-red-500'
                  : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {invite.status === 'pending' && <AlertCircle className="w-4 h-4" />}
                  {invite.status === 'accepted' && <CheckCircle className="w-4 h-4" />}
                  {invite.status === 'declined' && <XCircle className="w-4 h-4" />}
                  {invite.status === 'accepted' ? 'Aceito' : invite.status === 'declined' ? 'Recusado' : 'Pendente'}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#FF6B00]" />
                    <div>
                      <div className="text-white/60 text-xs">Data</div>
                      <div className="text-white font-medium text-sm">{formatDate(invite.proposed_date)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#FF6B00]" />
                    <div>
                      <div className="text-white/60 text-xs">Horário</div>
                      <div className="text-white font-medium text-sm">{invite.proposed_time}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#FF6B00]" />
                    <div>
                      <div className="text-white/60 text-xs">Local</div>
                      <div className="text-white font-medium text-sm truncate">{invite.proposed_location || 'A definir'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Última mensagem */}
              {(lastMessages[invite.id] || invite.message) && (
                <div 
                  className={`bg-white/5 hover:bg-white/10 rounded-xl p-3 mb-4 cursor-pointer transition-colors ${unreadCounts[invite.id] ? 'border border-red-500/50' : ''}`}
                  onClick={() => openChat(invite)}
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className={`w-4 h-4 ${unreadCounts[invite.id] ? 'text-red-500' : 'text-[#FF6B00]'}`} />
                    <span className="text-white text-sm flex-1 truncate">
                      {lastMessages[invite.id] 
                        ? `${lastMessages[invite.id].sender_name}: ${lastMessages[invite.id].message}`
                        : `${invite.from_team_name}: ${invite.message}`}
                    </span>
                    {unreadCounts[invite.id] > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                        {unreadCounts[invite.id]}
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-white/40" />
                  </div>
                </div>
              )}

              {/* Actions */}
              {invite.status === 'pending' && (
                <div className="flex gap-2">
                  {isReceived ? (
                    <>
                      <button
                        onClick={() => handleAccept(invite.id)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aceitar
                      </button>
                      <button
                        onClick={() => handleDecline(invite.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Recusar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleCancel(invite.id)}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancelar Convite
                    </button>
                  )}
                  <button
                    onClick={() => openChat(invite)}
                    className="bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white font-medium py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredList.length === 0 && (
        <div className="text-center py-16">
          <Mail className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum convite</h3>
          <p className="text-white/60">
            {filter === 'received' && 'Você não tem convites pendentes.'}
            {filter === 'sent' && 'Você não enviou nenhum convite.'}
            {filter === 'accepted' && 'Nenhum convite aceito ainda.'}
            {filter === 'declined' && 'Nenhum convite recusado.'}
          </p>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && selectedInvite && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Chat</h3>
                <p className="text-white/60 text-sm">
                  {selectedInvite.from_team_name} vs {selectedInvite.to_team_name}
                </p>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => {
                const isMyMessage = userTeamIds.includes(msg.sender_team_id);
                return (
                  <div key={msg.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-xl px-4 py-2 ${
                      isMyMessage ? 'bg-[#FF6B00] text-white' : 'bg-white/10 text-white'
                    }`}>
                      <p className="text-xs opacity-70 mb-1">{msg.sender_name}</p>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6B00]/40"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-[#FF6B00] hover:bg-[#FF6B00]/80 disabled:opacity-50 text-white p-2 rounded-xl transition-all"
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
