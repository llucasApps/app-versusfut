'use client';

import Navigation from '@/components/Navigation';
import { myTeams } from '@/lib/mock-data';
import { ArrowLeft, Save, Users, X, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

// Jogador do elenco
interface TeamPlayer {
  id: string;
  name: string;
  position: string;
  number: number;
  available: boolean;
}

// Jogador posicionado no campo
interface FieldPlayer {
  id: string;
  playerId: string | null;
  name: string;
  number: number;
  x: number;
  y: number;
}

// Formações disponíveis
const FORMACOES = [
  '4-4-2',
  '4-3-3',
  '4-2-3-1',
  '3-5-2',
  '4-5-1',
  '3-4-3',
  '5-3-2',
  '5-4-1',
  '4-1-4-1',
  '4-3-2-1',
] as const;

type Formacao = typeof FORMACOES[number];

interface Tatica {
  id: string;
  timeId: string;
  nome: string;
  descricao: string;
  formacao: Formacao;
  layoutJson: {
    players: FieldPlayer[];
  };
}

const INITIAL_FORMATION: FieldPlayer[] = [
  { id: 'pos1', playerId: null, name: '', number: 1, x: 50, y: 90 },
  { id: 'pos2', playerId: null, name: '', number: 2, x: 20, y: 75 },
  { id: 'pos3', playerId: null, name: '', number: 3, x: 40, y: 75 },
  { id: 'pos4', playerId: null, name: '', number: 4, x: 60, y: 75 },
  { id: 'pos5', playerId: null, name: '', number: 5, x: 80, y: 75 },
  { id: 'pos6', playerId: null, name: '', number: 6, x: 30, y: 55 },
  { id: 'pos7', playerId: null, name: '', number: 7, x: 50, y: 55 },
  { id: 'pos8', playerId: null, name: '', number: 8, x: 70, y: 55 },
  { id: 'pos9', playerId: null, name: '', number: 9, x: 30, y: 30 },
  { id: 'pos10', playerId: null, name: '', number: 10, x: 50, y: 25 },
  { id: 'pos11', playerId: null, name: '', number: 11, x: 70, y: 30 },
];

export default function EditarTaticaPage() {
  const params = useParams();
  const router = useRouter();
  const team = myTeams.find(t => t.id === params.id);
  const fieldRef = useRef<HTMLDivElement>(null);
  
  const [nome, setNome] = useState('');
  const [formacao, setFormacao] = useState<Formacao>('4-4-2');
  const [descricao, setDescricao] = useState('');
  const [fieldPlayers, setFieldPlayers] = useState<FieldPlayer[]>(INITIAL_FORMATION);
  const [draggingPlayer, setDraggingPlayer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<TeamPlayer[]>([]);

  // Carregar jogadores do elenco
  useEffect(() => {
    if (team) {
      const storedPlayers = localStorage.getItem(`team_${params.id}_players`);
      if (storedPlayers) {
        setTeamPlayers(JSON.parse(storedPlayers));
      } else if (team.players) {
        setTeamPlayers(team.players as TeamPlayer[]);
      }
    }
  }, [team, params.id]);

  useEffect(() => {
    // Carregar tática para edição
    const stored = localStorage.getItem(`taticas_${params.id}`);
    if (stored) {
      const taticas: Tatica[] = JSON.parse(stored);
      const tatica = taticas.find(t => t.id === params.taticaId);
      if (tatica) {
        setNome(tatica.nome);
        setFormacao(tatica.formacao || '4-4-2');
        setDescricao(tatica.descricao);
        setFieldPlayers(tatica.layoutJson.players);
      }
    }
    setLoading(false);
  }, [params.id, params.taticaId]);

  // Jogadores já escalados
  const assignedPlayerIds = fieldPlayers
    .filter(fp => fp.playerId !== null)
    .map(fp => fp.playerId);

  // Jogadores disponíveis para escalar
  const availablePlayers = teamPlayers.filter(
    tp => !assignedPlayerIds.includes(tp.id)
  );

  // Atribuir jogador a uma posição
  const assignPlayerToPosition = (positionId: string, player: TeamPlayer) => {
    setFieldPlayers(prev =>
      prev.map(fp =>
        fp.id === positionId
          ? { ...fp, playerId: player.id, name: player.name, number: player.number }
          : fp
      )
    );
    setSelectedPosition(null);
  };

  // Remover jogador de uma posição
  const removePlayerFromPosition = (positionId: string) => {
    const posIndex = INITIAL_FORMATION.findIndex(p => p.id === positionId);
    const defaultNumber = posIndex !== -1 ? INITIAL_FORMATION[posIndex].number : 0;
    
    setFieldPlayers(prev =>
      prev.map(fp =>
        fp.id === positionId
          ? { ...fp, playerId: null, name: '', number: defaultNumber }
          : fp
      )
    );
  };

  const handleMouseDown = (positionId: string) => {
    setDraggingPlayer(positionId);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingPlayer !== null && fieldRef.current) {
      const rect = fieldRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const clampedX = Math.max(5, Math.min(95, x));
      const clampedY = Math.max(5, Math.min(95, y));

      setFieldPlayers(prev => 
        prev.map(p => 
          p.id === draggingPlayer 
            ? { ...p, x: clampedX, y: clampedY }
            : p
        )
      );
    }
  };

  const handleMouseUp = () => {
    setDraggingPlayer(null);
  };

  const handleTouchStart = (positionId: string) => {
    setDraggingPlayer(positionId);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (draggingPlayer !== null && fieldRef.current) {
      const touch = e.touches[0];
      const rect = fieldRef.current.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;

      const clampedX = Math.max(5, Math.min(95, x));
      const clampedY = Math.max(5, Math.min(95, y));

      setFieldPlayers(prev => 
        prev.map(p => 
          p.id === draggingPlayer 
            ? { ...p, x: clampedX, y: clampedY }
            : p
        )
      );
    }
  };

  const handleTouchEnd = () => {
    setDraggingPlayer(null);
  };

  const handleSave = () => {
    if (!nome.trim()) {
      alert('Por favor, dê um nome para a tática');
      return;
    }

    const tatica: Tatica = {
      id: params.taticaId as string,
      timeId: params.id as string,
      nome,
      formacao,
      descricao,
      layoutJson: { players: fieldPlayers }
    };

    // Atualizar no localStorage
    const stored = localStorage.getItem(`taticas_${params.id}`);
    const taticas: Tatica[] = stored ? JSON.parse(stored) : [];
    
    const index = taticas.findIndex(t => t.id === params.taticaId);
    if (index !== -1) {
      taticas[index] = tatica;
      localStorage.setItem(`taticas_${params.id}`, JSON.stringify(taticas));
    }

    router.push(`/times/${params.id}/taticas`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚽</div>
          <h2 className="text-2xl font-bold text-white mb-2">Time não encontrado</h2>
          <Link href="/times" className="text-[#FF6B00] hover:text-[#FF6B00]/80">
            Voltar para Meus Times
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
        <Link href={`/times/${team.id}/taticas`} className="inline-flex items-center gap-2 text-white/60 hover:text-[#FF6B00] transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          Voltar para Táticas
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Editar Tática
          </h1>
          <p className="text-white/60 text-lg">Time: {team.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Informações da Tática
              </h2>

              <div className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-white/80 font-medium mb-2">
                    Nome da Tática *
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: 4-4-2 Clássico"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6B00] transition-colors"
                  />
                </div>

                {/* Formação */}
                <div>
                  <label className="block text-white/80 font-medium mb-2">
                    Formação
                  </label>
                  <select
                    value={formacao}
                    onChange={(e) => setFormacao(e.target.value as Formacao)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF6B00] transition-colors"
                  >
                    {FORMACOES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-white/80 font-medium mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descreva a estratégia desta tática..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6B00] transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[#FF6B00] mb-3">
                Como usar a prancheta
              </h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B00] mt-1">1.</span>
                  <span>Clique nas posições vazias para escalar jogadores do elenco</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B00] mt-1">2.</span>
                  <span>Arraste os jogadores escalados para ajustar suas posições</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B00] mt-1">3.</span>
                  <span>Clique no X ao lado do nome para remover um jogador</span>
                </li>
              </ul>
            </div>

            {/* Jogadores Escalados */}
            {/* <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#FF6B00]" />
                Escalação ({fieldPlayers.filter(p => p.playerId).length}/11)
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {fieldPlayers.filter(p => p.playerId).length > 0 ? (
                  fieldPlayers
                    .filter(p => p.playerId)
                    .map(player => (
                      <div key={player.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                        <div className="w-8 h-8 bg-[#FF6B00] rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {player.number}
                        </div>
                        <span className="text-white text-sm flex-1 truncate">{player.name}</span>
                        <button
                          onClick={() => removePlayerFromPosition(player.id)}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-white/40 hover:text-red-400" />
                        </button>
                      </div>
                    ))
                ) : (
                  <p className="text-white/40 text-sm text-center py-4">
                    Nenhum jogador escalado ainda
                  </p>
                )}
              </div>
            </div> */}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Salvar Alterações
              </button>
              <Link
                href={`/times/${team.id}/taticas`}
                className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center"
              >
                Cancelar
              </Link>
            </div>
          </div>

          {/* Field */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Prancheta Tática
              </h2>

              <div
                ref={fieldRef}
                className="relative w-full aspect-[2/3] bg-gradient-to-b from-green-700 to-green-800 rounded-2xl border-4 border-white/30 overflow-hidden cursor-crosshair select-none"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Field Lines */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/40" />
                  <div className="absolute top-1/2 left-1/2 w-24 h-24 border-4 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/60 rounded-full -translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute top-0 left-1/2 w-2/3 h-1/6 border-4 border-white/40 border-t-0 -translate-x-1/2" />
                  <div className="absolute bottom-0 left-1/2 w-2/3 h-1/6 border-4 border-white/40 border-b-0 -translate-x-1/2" />
                  <div className="absolute top-0 left-1/2 w-1/3 h-[8%] border-4 border-white/40 border-t-0 -translate-x-1/2" />
                  <div className="absolute bottom-0 left-1/2 w-1/3 h-[8%] border-4 border-white/40 border-b-0 -translate-x-1/2" />
                </div>

                {/* Players */}
                {fieldPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="absolute group"
                    style={{
                      left: `${player.x}%`,
                      top: `${player.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: draggingPlayer === player.id ? 50 : 10
                    }}
                  >
                    {/* Círculo do jogador */}
                    <div
                      className={`w-12 h-12 rounded-full border-4 shadow-2xl flex items-center justify-center text-lg font-bold text-white transition-all ${
                        player.playerId 
                          ? 'bg-[#FF6B00] border-white cursor-grab hover:scale-105' 
                          : 'bg-white/20 border-dashed border-white/40 cursor-pointer hover:bg-white/30'
                      } ${draggingPlayer === player.id ? 'scale-110 cursor-grabbing' : ''}`}
                      onMouseDown={() => player.playerId && handleMouseDown(player.id)}
                      onTouchStart={() => player.playerId && handleTouchStart(player.id)}
                      onClick={() => !player.playerId && setSelectedPosition(player.id)}
                    >
                      {player.number}
                    </div>
                    
                    {/* Nome do jogador */}
                    {player.playerId && player.name && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
                        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <span className="font-medium truncate max-w-[80px]">{player.name.split(' ')[0]}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removePlayerFromPosition(player.id);
                            }}
                            className="ml-1 hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Indicador de posição vazia */}
                    {!player.playerId && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-[#FF6B00] text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          <UserPlus className="w-3 h-3 inline mr-1" />
                          Clique para escalar
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-white/60 text-sm mt-4 text-center">
                Clique nas posições vazias para escalar jogadores do elenco
              </p>
            </div>
          </div>
        </div>

        {/* Modal de seleção de jogador */}
        {selectedPosition && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/30 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#FF6B00]" />
                  Escalar Jogador
                </h3>
                <button
                  onClick={() => setSelectedPosition(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {availablePlayers.length > 0 ? (
                  <div className="space-y-2">
                    {availablePlayers.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => assignPlayerToPosition(selectedPosition, player)}
                        className="w-full flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-[#FF6B00] rounded-full flex items-center justify-center text-white font-bold">
                          {player.number}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{player.name}</div>
                          <div className="text-white/60 text-sm">{player.position}</div>
                        </div>
                        {!player.available && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                            Indisponível
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/60">Todos os jogadores já foram escalados</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
