'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Team, Player } from '@/lib/supabase';
import { Users, ChevronDown, ChevronRight } from 'lucide-react';
import PartidasInternas from '@/components/PartidasInternas';
import Navigation from '@/components/Navigation';

interface TeamWithPlayers extends Team {
  players: Player[];
}

export default function PartidaInternaPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<TeamWithPlayers[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithPlayers | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTeamSelector, setShowTeamSelector] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!user) return;

      // Buscar times do usuário (como dono)
      const { data: ownedTeams } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', user.id);

      // Buscar times onde é jogador
      const { data: memberTeams } = await supabase
        .from('team_players')
        .select('team_id, teams(*)')
        .eq('player_id', user.id);

      const allTeams: Team[] = [];
      
      if (ownedTeams) {
        allTeams.push(...ownedTeams);
      }
      
      if (memberTeams) {
        memberTeams.forEach((mt) => {
          const team = mt.teams as unknown as Team;
          if (team && !allTeams.find(t => t.id === team.id)) {
            allTeams.push(team);
          }
        });
      }

      // Buscar jogadores de cada time (da tabela players, igual em times/[id])
      const teamsWithPlayers: TeamWithPlayers[] = [];
      
      for (const team of allTeams) {
        const { data: playersData } = await supabase
          .from('players')
          .select('*')
          .eq('team_id', team.id)
          .order('number', { ascending: true });

        teamsWithPlayers.push({
          ...team,
          players: playersData || []
        });
      }

      setTeams(teamsWithPlayers);
      
      // Selecionar primeiro time por padrão
      if (teamsWithPlayers.length > 0) {
        setSelectedTeam(teamsWithPlayers[0]);
      }
      
      setLoading(false);
    };

    fetchTeams();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D]">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="min-h-screen bg-[#0D0D0D]">
        <Navigation />
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-8 text-center">
            <Users className="w-16 h-16 text-[#FF6B00]/40 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Nenhum time encontrado</h2>
            <p className="text-white/60">Você precisa criar ou participar de um time para acessar as partidas internas.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navigation />
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Seletor de Time (só aparece se tiver mais de 1 time) */}
        {teams.length > 1 && (
          <div className="mb-6 relative">
            <button
              onClick={() => setShowTeamSelector(!showTeamSelector)}
              className="flex items-center gap-3 bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-xl px-4 py-3 hover:border-[#FF6B00]/40 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/20 flex items-center justify-center text-2xl">
                {selectedTeam?.logo || '⚽'}
              </div>
              <div className="text-left">
                <p className="text-white font-medium">{selectedTeam?.name}</p>
                <p className="text-white/40 text-sm">{selectedTeam?.players.length} jogadores</p>
              </div>
              <ChevronDown className={`w-5 h-5 text-white/40 ml-2 transition-transform ${showTeamSelector ? 'rotate-180' : ''}`} />
            </button>
            
            {showTeamSelector && (
              <div className="absolute top-full left-0 mt-2 w-full max-w-sm bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-xl shadow-2xl overflow-hidden z-10">
                {teams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => {
                      setSelectedTeam(team);
                      setShowTeamSelector(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FF6B00]/10 transition-all ${
                      selectedTeam?.id === team.id ? 'bg-[#FF6B00]/10' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/20 flex items-center justify-center text-2xl">
                      {team.logo || '⚽'}
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-white font-medium">{team.name}</p>
                      <p className="text-white/40 text-sm">{team.players.length} jogadores</p>
                    </div>
                    {selectedTeam?.id === team.id && (
                      <ChevronRight className="w-5 h-5 text-[#FF6B00]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Componente de Partidas Internas (já tem seu próprio título) */}
        {selectedTeam && (
          <PartidasInternas
            teamId={selectedTeam.id}
            players={selectedTeam.players}
            isOwnerMode={selectedTeam.owner_id === user?.id}
          />
        )}
      </div>
    </div>
  );
}
