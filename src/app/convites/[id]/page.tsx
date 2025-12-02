'use client';

import Navigation from '@/components/Navigation';
import { matches } from '@/lib/mock-data';
import { ArrowLeft, Calendar, Clock, MapPin, Users, MessageCircle, Send } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
}

export default function MatchDetailPage() {
  const params = useParams();
  const match = matches.find(m => m.id === params.id);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [senderTeam, setSenderTeam] = useState<'home' | 'away'>('home');

  useEffect(() => {
    if (match) {
      // Carregar mensagens do localStorage ou usar as mensagens fake do match
      const storedMessages = localStorage.getItem(`match_messages_${match.id}`);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else if (match.messages) {
        setMessages(match.messages);
        localStorage.setItem(`match_messages_${match.id}`, JSON.stringify(match.messages));
      }
    }
  }, [match]);

  const saveMessages = (updatedMessages: ChatMessage[]) => {
    if (match) {
      localStorage.setItem(`match_messages_${match.id}`, JSON.stringify(updatedMessages));
      setMessages(updatedMessages);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !match) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: senderTeam === 'home' ? match.homeTeam : match.awayTeam,
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    saveMessages([...messages, message]);
    setNewMessage('');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!match) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚽</div>
          <h2 className="text-2xl font-bold text-white mb-2">Jogo não encontrado</h2>
          <Link href="/convites" className="text-[#FF6B00] hover:text-[#FF6B00]/80">
            Voltar para Convites
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back Button */}
        <Link href="/convites" className="inline-flex items-center gap-2 text-white/60 hover:text-[#FF6B00] transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          Voltar para Convites
        </Link>

        {/* Match Header */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6 sm:p-8 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-[#FF6B00]/10 px-4 py-2 rounded-full mb-4">
              <div className={`w-3 h-3 rounded-full ${
                match.status === 'scheduled' ? 'bg-yellow-500' :
                match.status === 'confirmed' ? 'bg-green-500' :
                match.status === 'pending' ? 'bg-orange-500' :
                'bg-gray-500'
              }`} />
              <span className="text-white font-medium capitalize">
                {match.status === 'scheduled' ? 'Agendado' :
                 match.status === 'confirmed' ? 'Confirmado' :
                 match.status === 'pending' ? 'Pendente' :
                 'Finalizado'}
              </span>
            </div>

            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center flex-1 max-w-xs">
                <div className="text-5xl mb-3">⚽</div>
                <div className="text-2xl font-bold text-white mb-1">{match.homeTeam}</div>
                <div className="text-white/40 text-sm">Casa</div>
              </div>

              <div className="px-6 py-3 bg-[#FF6B00]/10 rounded-xl">
                {match.score ? (
                  <div className="text-3xl font-bold text-[#FF6B00]">
                    {match.score.home} - {match.score.away}
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-[#FF6B00]">VS</div>
                )}
              </div>

              <div className="text-center flex-1 max-w-xs">
                <div className="text-5xl mb-3">🔥</div>
                <div className="text-2xl font-bold text-white mb-1">{match.awayTeam}</div>
                <div className="text-white/40 text-sm">Visitante</div>
              </div>
            </div>
          </div>

          {/* Match Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
              <Calendar className="w-5 h-5 text-[#FF6B00]" />
              <div>
                <div className="text-white/60 text-xs">Data</div>
                <div className="text-white font-medium">
                  {new Date(match.date).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
              <Clock className="w-5 h-5 text-[#FF6B00]" />
              <div>
                <div className="text-white/60 text-xs">Horário</div>
                <div className="text-white font-medium">{match.time}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
              <MapPin className="w-5 h-5 text-[#FF6B00]" />
              <div>
                <div className="text-white/60 text-xs">Local</div>
                <div className="text-white font-medium">{match.location}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Communication Section */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="w-6 h-6 text-[#FF6B00]" />
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Comunicação entre Times
            </h2>
          </div>

          {/* Messages List */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">Nenhuma mensagem ainda</p>
                <p className="text-white/40 text-sm">Inicie a conversa com o time adversário</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-xl ${
                    msg.sender === match.homeTeam
                      ? 'bg-[#FF6B00]/10 ml-0 mr-8'
                      : 'bg-white/5 ml-8 mr-0'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#FF6B00]" />
                      <span className="font-bold text-white text-sm">{msg.sender}</span>
                    </div>
                    <span className="text-white/40 text-xs">{formatTimestamp(msg.timestamp)}</span>
                  </div>
                  <p className="text-white/80">{msg.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setSenderTeam('home')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  senderTeam === 'home'
                    ? 'bg-[#FF6B00] text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {match.homeTeam}
              </button>
              <button
                onClick={() => setSenderTeam('away')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  senderTeam === 'away'
                    ? 'bg-[#FF6B00] text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {match.awayTeam}
              </button>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Enviar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
