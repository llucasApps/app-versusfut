'use client';

import Navigation from '@/components/Navigation';
import { myTeams } from '@/lib/mock-data';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

interface Player {
  id: number;
  x: number;
  y: number;
}

interface Tatica {
  id: string;
  timeId: string;
  nome: string;
  descricao: string;
  tipo: 'Ofensiva' | 'Defensiva' | 'Bola parada';
  layoutJson: {
    players: Player[];
  };
}

const INITIAL_FORMATION = [
  { id: 1, x: 50, y: 90 },
  { id: 2, x: 20, y: 75 },
  { id: 3, x: 40, y: 75 },
  { id: 4, x: 60, y: 75 },
  { id: 5, x: 80, y: 75 },
  { id: 6, x: 30, y: 55 },
  { id: 7, x: 50, y: 55 },
  { id: 8, x: 70, y: 55 },
  { id: 9, x: 30, y: 30 },
  { id: 10, x: 50, y: 25 },
  { id: 11, x: 70, y: 30 },
];

export default function EditarTaticaPage() {
  const params = useParams();
  const router = useRouter();
  const team = myTeams.find(t => t.id === params.id);
  const fieldRef = useRef<HTMLDivElement>(null);
  
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'Ofensiva' | 'Defensiva' | 'Bola parada'>('Ofensiva');
  const [descricao, setDescricao] = useState('');
  const [players, setPlayers] = useState<Player[]>(INITIAL_FORMATION);
  const [draggingPlayer, setDraggingPlayer] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar tática para edição
    const stored = localStorage.getItem(`taticas_${params.id}`);
    if (stored) {
      const taticas: Tatica[] = JSON.parse(stored);
      const tatica = taticas.find(t => t.id === params.taticaId);
      if (tatica) {
        setNome(tatica.nome);
        setTipo(tatica.tipo);
        setDescricao(tatica.descricao);
        setPlayers(tatica.layoutJson.players);
      }
    }
    setLoading(false);
  }, [params.id, params.taticaId]);

  const handleMouseDown = (playerId: number) => {
    setDraggingPlayer(playerId);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingPlayer !== null && fieldRef.current) {
      const rect = fieldRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const clampedX = Math.max(5, Math.min(95, x));
      const clampedY = Math.max(5, Math.min(95, y));

      setPlayers(prev => 
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

  const handleTouchStart = (playerId: number) => {
    setDraggingPlayer(playerId);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (draggingPlayer !== null && fieldRef.current) {
      const touch = e.touches[0];
      const rect = fieldRef.current.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;

      const clampedX = Math.max(5, Math.min(95, x));
      const clampedY = Math.max(5, Math.min(95, y));

      setPlayers(prev => 
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
      tipo,
      descricao,
      layoutJson: { players }
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

                {/* Tipo */}
                <div>
                  <label className="block text-white/80 font-medium mb-2">
                    Tipo
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF6B00] transition-colors"
                  >
                    <option value="Ofensiva">Ofensiva</option>
                    <option value="Defensiva">Defensiva</option>
                    <option value="Bola parada">Bola parada</option>
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
                  <span className="text-[#FF6B00] mt-1">•</span>
                  <span>Clique e arraste os jogadores para posicioná-los no campo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B00] mt-1">•</span>
                  <span>Em dispositivos móveis, toque e arraste</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B00] mt-1">•</span>
                  <span>Os números representam as posições dos jogadores</span>
                </li>
              </ul>
            </div>

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
                {players.map((player) => (
                  <div
                    key={player.id}
                    className={`absolute w-12 h-12 bg-[#FF6B00] rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-lg font-bold text-white transition-transform ${
                      draggingPlayer === player.id ? 'scale-110 cursor-grabbing' : 'cursor-grab hover:scale-105'
                    }`}
                    style={{
                      left: `${player.x}%`,
                      top: `${player.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: draggingPlayer === player.id ? 50 : 10
                    }}
                    onMouseDown={() => handleMouseDown(player.id)}
                    onTouchStart={() => handleTouchStart(player.id)}
                  >
                    {player.id}
                  </div>
                ))}
              </div>

              <p className="text-white/60 text-sm mt-4 text-center">
                Arraste os jogadores para posicioná-los no campo
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
