'use client';

import Navigation from '@/components/Navigation';
import { supabase, Team, Match, MatchInvite } from '@/lib/supabase';
import { TrendingUp, Users, Calendar, Trophy, ArrowRight, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalTeams: number;
  totalWins: number;
  totalMatches: number;
  totalGoals: number;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalTeams: 0,
    totalWins: 0,
    totalMatches: 0,
    totalGoals: 0
  });
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [pendingInvites, setPendingInvites] = useState<MatchInvite[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Buscar dados do Supabase
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Buscar times do usuário
        const { data: teams, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .eq('owner_id', user.id);

        if (teamsError) {
          console.error('Erro ao buscar times:', teamsError);
        }

        const myTeams = teams || [];
        const teamIds = myTeams.map(t => t.id);

        // Calcular estatísticas
        const totalWins = myTeams.reduce((acc, team) => acc + (team.wins || 0), 0);
        const totalMatches = myTeams.reduce((acc, team) => 
          acc + (team.wins || 0) + (team.draws || 0) + (team.losses || 0), 0);
        const totalGoals = myTeams.reduce((acc, team) => acc + (team.goals_for || 0), 0);

        setStats({
          totalTeams: myTeams.length,
          totalWins,
          totalMatches,
          totalGoals
        });

        // Buscar próximos jogos (partidas agendadas ou confirmadas)
        if (teamIds.length > 0) {
          const { data: matchesData, error: matchesError } = await supabase
            .from('matches')
            .select('*')
            .or(`team_id.in.(${teamIds.join(',')}),home_team_id.in.(${teamIds.join(',')}),away_team_id.in.(${teamIds.join(',')})`)
            .in('status', ['scheduled', 'confirmed'])
            .gte('match_date', new Date().toISOString().split('T')[0])
            .order('match_date', { ascending: true })
            .limit(3);

          if (matchesError) {
            console.error('Erro ao buscar partidas:', matchesError);
          } else {
            setUpcomingMatches(matchesData || []);
          }

          // Buscar convites pendentes recebidos
          const { data: invitesData, error: invitesError } = await supabase
            .from('match_invites')
            .select('*')
            .in('to_team_id', teamIds)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

          if (invitesError) {
            console.error('Erro ao buscar convites:', invitesError);
          } else {
            setPendingInvites(invitesData || []);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoadingData(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Mostrar loading enquanto verifica autenticação
  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
      </div>
    );
  }

  // Não renderizar nada enquanto redireciona
  if (!user) {
    return null;
  }

  // Função para formatar data de forma consistente
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  // Função para responder convites
  const handleInviteResponse = async (inviteId: string, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('match_invites')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', inviteId);

      if (error) {
        console.error('Erro ao atualizar convite:', error);
        return;
      }

      // Remover convite da lista local
      setPendingInvites(prev => prev.filter(invite => invite.id !== inviteId));
    } catch (error) {
      console.error('Erro ao responder convite:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Dashboard
          </h1>
          <p className="text-white/60 text-base sm:text-lg">Visão geral dos seus times e próximos jogos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B35]/20 rounded-2xl p-5 sm:p-6 hover:border-[#FF6B35]/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,53,0.15)] group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#FF6B35]/10 rounded-xl group-hover:bg-[#FF6B35]/20 transition-all">
                <Users className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <TrendingUp className="w-5 h-5 text-[#FF6B35]/60" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{stats.totalTeams}</div>
            <div className="text-white/60 text-sm">Times Ativos</div>
          </div>

          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B35]/20 rounded-2xl p-5 sm:p-6 hover:border-[#FF6B35]/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,53,0.15)] group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#FF6B35]/10 rounded-xl group-hover:bg-[#FF6B35]/20 transition-all">
                <Trophy className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <TrendingUp className="w-5 h-5 text-[#FF6B35]/60" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{stats.totalWins}</div>
            <div className="text-white/60 text-sm">Vitórias Totais</div>
          </div>

          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B35]/20 rounded-2xl p-5 sm:p-6 hover:border-[#FF6B35]/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,53,0.15)] group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#FF6B35]/10 rounded-xl group-hover:bg-[#FF6B35]/20 transition-all">
                <Calendar className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <TrendingUp className="w-5 h-5 text-[#FF6B35]/60" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{stats.totalMatches}</div>
            <div className="text-white/60 text-sm">Partidas Jogadas</div>
          </div>

          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B35]/20 rounded-2xl p-5 sm:p-6 hover:border-[#FF6B35]/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,53,0.15)] group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#FF6B35]/10 rounded-xl group-hover:bg-[#FF6B35]/20 transition-all">
                <TrendingUp className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <TrendingUp className="w-5 h-5 text-[#FF6B35]/60" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{stats.totalGoals}</div>
            <div className="text-white/60 text-sm">Gols Marcados</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Próximos Jogos */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Próximos Jogos</h2>
              <Link href="/agenda" className="text-[#FF6B35] hover:text-[#FF6B35]/80 transition-colors flex items-center gap-2 text-sm sm:text-base">
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {upcomingMatches.length === 0 ? (
                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B35]/20 rounded-2xl p-8 text-center">
                  <Calendar className="w-12 h-12 text-[#FF6B35]/40 mx-auto mb-4" />
                  <p className="text-white/60">Nenhum jogo agendado</p>
                  <Link href="/agenda" className="text-[#FF6B35] text-sm hover:underline mt-2 inline-block">
                    Agendar partida
                  </Link>
                </div>
              ) : (
                upcomingMatches.map((match) => (
                  <div key={match.id} className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B35]/20 rounded-2xl p-5 sm:p-6 hover:border-[#FF6B35]/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,53,0.15)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-[#FF6B35]" />
                        <div>
                          <div className="text-white/60 text-sm">{formatDate(match.match_date)}</div>
                          <div className="text-white font-medium">{match.match_time}</div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        match.status === 'confirmed' 
                          ? 'bg-[#FF6B35]/20 text-[#FF6B35]' 
                          : 'bg-white/10 text-white/60'
                      }`}>
                        {match.status === 'confirmed' ? 'Confirmado' : 'Agendado'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-center sm:text-left">
                        <div className="text-lg sm:text-xl font-bold text-white mb-1">{match.home_team_name}</div>
                        <div className="text-white/40 text-xs sm:text-sm">Casa</div>
                      </div>
                      
                      <div className="px-4 sm:px-6 py-2 bg-[#FF6B35]/10 rounded-xl">
                        <div className="text-[#FF6B35] font-bold text-sm sm:text-base">VS</div>
                      </div>
                      
                      <div className="flex-1 text-center sm:text-right">
                        <div className="text-lg sm:text-xl font-bold text-white mb-1">{match.away_team_name}</div>
                        <div className="text-white/40 text-xs sm:text-sm">Visitante</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="text-white/60 text-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#FF6B35] rounded-full"></div>
                        {match.location || 'Local a definir'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Convites Pendentes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Convites</h3>
                <Link href="/convites" className="text-[#FF6B35] hover:text-[#FF6B35]/80 transition-colors flex items-center gap-2 text-sm">
                  Ver todos <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {pendingInvites.length === 0 ? (
                  <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B35]/20 rounded-xl p-6 text-center">
                    <p className="text-white/60 text-sm">Nenhum convite pendente</p>
                  </div>
                ) : (
                  pendingInvites.map((invite) => (
                    <div key={invite.id} className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B35]/20 rounded-xl p-4 hover:border-[#FF6B35]/40 transition-all duration-300">
                      <div className="text-white font-medium mb-2">{invite.from_team_name}</div>
                      <div className="text-white/60 text-sm mb-3">Desafio para {formatDate(invite.proposed_date)}</div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleInviteResponse(invite.id, 'accepted')}
                          className="flex-1 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-medium py-2 px-3 rounded-lg transition-all text-sm"
                        >
                          Aceitar
                        </button>
                        <button 
                          onClick={() => handleInviteResponse(invite.id, 'declined')}
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-3 rounded-lg transition-all text-sm"
                        >
                          Recusar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Meus Times */}
            {/* <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Meus Times</h3>
                <Link href="/times" className="text-[#FF6B35] hover:text-[#FF6B35]/80 transition-colors flex items-center gap-2 text-sm">
                  Ver todos <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {myTeams.slice(0, 3).map((team) => (
                  <Link key={team.id} href={`/times/${team.id}`} className="block bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B35]/20 rounded-xl p-4 hover:border-[#FF6B35]/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,107,53,0.1)]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl">{team.logo}</div>
                      <div className="flex-1">
                        <div className="text-white font-bold">{team.name}</div>
                        <div className="text-white/60 text-sm">{team.players.length} jogadores</div>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <div className="text-[#FF6B35] font-bold">{team.stats.wins}</div>
                        <div className="text-white/40 text-xs">Vitórias</div>
                      </div>
                      <div>
                        <div className="text-white font-bold">{team.stats.draws}</div>
                        <div className="text-white/40 text-xs">Empates</div>
                      </div>
                      <div>
                        <div className="text-white/60 font-bold">{team.stats.losses}</div>
                        <div className="text-white/40 text-xs">Derrotas</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div> */}
          </div>
        </div>
      </main>
    </div>
  );
}
