'use client';

import Navigation from '@/components/Navigation';
import { myTeams } from '@/lib/mock-data';
import { ArrowLeft, Plus, Edit, Trash2, Clipboard } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface FieldPlayer {
  id: string;
  playerId: string | null;
  name: string;
  number: number;
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
    players: FieldPlayer[];
  };
}

export default function TaticasPage() {
  const params = useParams();
  const router = useRouter();
  const team = myTeams.find(t => t.id === params.id);
  const [taticas, setTaticas] = useState<Tatica[]>([]);

  useEffect(() => {
    // Carregar táticas do localStorage
    const stored = localStorage.getItem(`taticas_${params.id}`);
    if (stored) {
      setTaticas(JSON.parse(stored));
    }
  }, [params.id]);

  const handleDelete = (taticaId: string) => {
    if (confirm('Tem certeza que deseja excluir esta tática?')) {
      const updated = taticas.filter(t => t.id !== taticaId);
      setTaticas(updated);
      localStorage.setItem(`taticas_${params.id}`, JSON.stringify(updated));
    }
  };

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
        <Link href={`/times/${team.id}`} className="inline-flex items-center gap-2 text-white/60 hover:text-[#FF6B00] transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          Voltar para {team.name}
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="text-5xl">{team.logo}</div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Táticas de {team.name}
              </h1>
            </div>
            <p className="text-white/60 text-lg">Gerencie as formações e estratégias do seu time</p>
          </div>
          
          <Link 
            href={`/times/${team.id}/taticas/criar`}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Criar Nova Tática
          </Link>
        </div>

        {/* Táticas List */}
        {taticas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {taticas.map((tatica) => (
              <div key={tatica.id} className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl overflow-hidden hover:border-[#FF6B00]/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.15)]">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <Clipboard className="w-8 h-8 text-[#FF6B00]" />
                    <div className="px-3 py-1 bg-[#FF6B00]/10 rounded-full">
                      <div className="text-[#FF6B00] text-xs font-bold">{tatica.tipo}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {tatica.nome}
                  </h3>
                  <p className="text-white/60 text-sm line-clamp-2">{tatica.descricao}</p>
                </div>

                {/* Mini Field Preview */}
                <div className="p-6 bg-gradient-to-b from-green-900/20 to-green-950/20">
                  <div className="relative w-full aspect-[2/3] bg-gradient-to-b from-green-700/30 to-green-800/30 rounded-lg border-2 border-white/20 overflow-hidden">
                    {/* Field Lines */}
                    <div className="absolute inset-0">
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-white/30" />
                      <div className="absolute top-1/2 left-1/2 w-12 h-12 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    
                    {/* Players */}
                    {tatica.layoutJson.players.map((player) => (
                      <div
                        key={player.id}
                        className={`absolute w-5 h-5 rounded-full border-2 shadow-lg flex items-center justify-center text-[8px] font-bold text-white ${
                          player.playerId 
                            ? 'bg-[#FF6B00] border-white' 
                            : 'bg-white/30 border-white/50 border-dashed'
                        }`}
                        style={{
                          left: `${player.x}%`,
                          top: `${player.y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        {player.number}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 flex gap-2">
                  <Link 
                    href={`/times/${team.id}/taticas/${tatica.id}/editar`}
                    className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 text-center flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </Link>
                  <button 
                    onClick={() => handleDelete(tatica.id)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium py-2 px-4 rounded-xl transition-all duration-300 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-12 text-center">
            <Clipboard className="w-20 h-20 text-[#FF6B00]/40 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Nenhuma tática cadastrada
            </h3>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              Crie sua primeira tática para definir formações e estratégias para o {team.name}
            </p>
            <Link 
              href={`/times/${team.id}/taticas/criar`}
              className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)]"
            >
              <Plus className="w-5 h-5" />
              Criar Primeira Tática
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
