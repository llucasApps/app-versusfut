'use client';

import Navigation from '@/components/Navigation';
import { myTeams } from '@/lib/mock-data';
import { ArrowLeft, Edit, Users, Trophy, TrendingUp, Target, Calendar, MapPin, Clipboard, Image as ImageIcon, X, Eye, Trash2, Play, Plus, Search, Clock, Camera, Upload, Crown, Filter, UserPlus, User } from 'lucide-react';
import { Player } from '@/lib/mock-data';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useViewMode } from '@/hooks/useViewMode';

type Tab = 'resumo' | 'elenco' | 'taticas' | 'fotos' | 'videos';

interface FotoTime {
  id: string;
  timeId: string;
  url: string;
  titulo: string;
  data: string;
  descricao?: string;
}

interface VideoTutorial {
  id: string;
  timeId: string;
  titulo: string;
  descricao: string;
  urlEmbed: string;
  categoria: string;
  duracao: string;
}

const categorias = ['Finalização', 'Tática', 'Preparação Física', 'Passe', 'Defesa', 'Drible'];

export default function TeamDetailPage() {
  const params = useParams();
  const team = myTeams.find(t => t.id === params.id);
  const { isOwnerMode } = useViewMode();
  const [activeTab, setActiveTab] = useState<Tab>('resumo');
  const [fotos, setFotos] = useState<FotoTime[]>([]);
  const [videos, setVideos] = useState<VideoTutorial[]>([]);
  const [showAddFotoModal, setShowAddFotoModal] = useState(false);
  const [showFotoModal, setShowFotoModal] = useState(false);
  const [selectedFoto, setSelectedFoto] = useState<FotoTime | null>(null);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoTutorial | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [newFoto, setNewFoto] = useState({
    titulo: '',
    url: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0]
  });
  const [videoFormData, setVideoFormData] = useState({
    titulo: '',
    descricao: '',
    urlEmbed: '',
    categoria: 'Finalização',
    duracao: ''
  });
  const [capitaoFoto, setCapitaoFoto] = useState<string | null>(null);
  const [capitaoNome, setCapitaoNome] = useState<string>('');
  
  // Estados para Elenco
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showPlayerDetailModal, setShowPlayerDetailModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isEditingPlayer, setIsEditingPlayer] = useState(false);
  const [playerSearchTerm, setPlayerSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'available' | 'unavailable'>('all');
  const [customPlayers, setCustomPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: 'Atacante',
    number: 0,
    age: 0,
    available: true
  });
  const [editPlayerData, setEditPlayerData] = useState<Partial<Player>>({});

  const positions = ['Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meio-Campo', 'Meia', 'Atacante', 'Ponta'];
  const preferredFootOptions = ['Direito', 'Esquerdo', 'Ambos'] as const;

  // Carregar fotos do localStorage
  useEffect(() => {
    if (team) {
      const storedFotos = localStorage.getItem(`fotos_${team.id}`);
      if (storedFotos) {
        setFotos(JSON.parse(storedFotos));
      }
    }
  }, [team]);

  // Carregar vídeos do localStorage
  useEffect(() => {
    if (team) {
      const storedVideos = localStorage.getItem(`videos_${team.id}`);
      if (storedVideos) {
        setVideos(JSON.parse(storedVideos));
      }
    }
  }, [team]);

  // Carregar foto do capitão do localStorage
  useEffect(() => {
    if (team) {
      const storedCapitao = localStorage.getItem(`capitao_${team.id}`);
      if (storedCapitao) {
        const capitaoData = JSON.parse(storedCapitao);
        setCapitaoFoto(capitaoData.foto);
        setCapitaoNome(capitaoData.nome);
      }
    }
  }, [team]);

  // Carregar jogadores customizados do localStorage
  useEffect(() => {
    if (team) {
      const storedPlayers = localStorage.getItem(`players_${team.id}`);
      if (storedPlayers) {
        setCustomPlayers(JSON.parse(storedPlayers));
      }
    }
  }, [team]);

  // Salvar foto do capitão no localStorage
  const handleCapitaoFotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && team) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCapitaoFoto(base64);
        localStorage.setItem(`capitao_${team.id}`, JSON.stringify({
          foto: base64,
          nome: capitaoNome || 'Capitão'
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Salvar fotos no localStorage
  const saveFotos = (updatedFotos: FotoTime[]) => {
    if (team) {
      localStorage.setItem(`fotos_${team.id}`, JSON.stringify(updatedFotos));
      setFotos(updatedFotos);
    }
  };

  // Salvar vídeos no localStorage
  const saveVideos = (updatedVideos: VideoTutorial[]) => {
    if (team) {
      localStorage.setItem(`videos_${team.id}`, JSON.stringify(updatedVideos));
      setVideos(updatedVideos);
    }
  };

  // Salvar jogadores no localStorage
  const savePlayers = (updatedPlayers: Player[]) => {
    if (team) {
      localStorage.setItem(`players_${team.id}`, JSON.stringify(updatedPlayers));
      setCustomPlayers(updatedPlayers);
    }
  };

  // Adicionar novo jogador
  const handleAddPlayer = () => {
    if (!team || !newPlayer.name || newPlayer.number <= 0) return;

    const player: Player = {
      id: Date.now().toString(),
      name: newPlayer.name,
      position: newPlayer.position,
      number: newPlayer.number,
      age: newPlayer.age || undefined,
      available: newPlayer.available,
      stats: {
        goals: 0,
        assists: 0,
        matches: 0
      }
    };

    savePlayers([...customPlayers, player]);
    setShowAddPlayerModal(false);
    setNewPlayer({
      name: '',
      position: 'Atacante',
      number: 0,
      age: 0,
      available: true
    });
  };

  // Remover jogador
  const handleRemovePlayer = (playerId: string) => {
    savePlayers(customPlayers.filter(p => p.id !== playerId));
    setShowPlayerDetailModal(false);
    setSelectedPlayer(null);
  };

  // Abrir detalhes do jogador
  const handleOpenPlayerDetail = (player: Player) => {
    setSelectedPlayer(player);
    setEditPlayerData({ ...player });
    setIsEditingPlayer(false);
    setShowPlayerDetailModal(true);
  };

  // Salvar edição do jogador
  const handleSavePlayerEdit = () => {
    if (!selectedPlayer || !editPlayerData.name) return;
    
    const isCustomPlayer = customPlayers.some(p => p.id === selectedPlayer.id);
    
    if (isCustomPlayer) {
      const updatedPlayers = customPlayers.map(p => 
        p.id === selectedPlayer.id ? { ...p, ...editPlayerData } as Player : p
      );
      savePlayers(updatedPlayers);
    }
    
    setSelectedPlayer({ ...selectedPlayer, ...editPlayerData } as Player);
    setIsEditingPlayer(false);
  };

  // Combinar jogadores do mock com customizados
  const allPlayers = team ? [...team.players, ...customPlayers] : [];

  // Filtrar jogadores
  const filteredPlayers = allPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(playerSearchTerm.toLowerCase());
    const matchesPosition = !filterPosition || player.position === filterPosition;
    const matchesAvailability = 
      filterAvailability === 'all' || 
      (filterAvailability === 'available' && player.available) ||
      (filterAvailability === 'unavailable' && !player.available);
    
    return matchesSearch && matchesPosition && matchesAvailability;
  });

  const handleAddFoto = () => {
    if (!team || !newFoto.titulo || !newFoto.url) return;

    const foto: FotoTime = {
      id: Date.now().toString(),
      timeId: team.id,
      titulo: newFoto.titulo,
      url: newFoto.url,
      data: newFoto.data,
      descricao: newFoto.descricao
    };

    saveFotos([...fotos, foto]);
    setShowAddFotoModal(false);
    setNewFoto({
      titulo: '',
      url: '',
      descricao: '',
      data: new Date().toISOString().split('T')[0]
    });
  };

  const handleRemoveFoto = (id: string) => {
    saveFotos(fotos.filter(f => f.id !== id));
    setShowFotoModal(false);
  };

  const handleViewFoto = (foto: FotoTime) => {
    setSelectedFoto(foto);
    setShowFotoModal(true);
  };

  const handleAddVideo = () => {
    if (!team || !videoFormData.titulo || !videoFormData.urlEmbed) return;

    const newVideo: VideoTutorial = {
      id: Date.now().toString(),
      timeId: team.id,
      ...videoFormData
    };

    saveVideos([...videos, newVideo]);
    resetVideoForm();
  };

  const handleEditVideo = () => {
    if (!editingVideo || !videoFormData.titulo || !videoFormData.urlEmbed) return;

    const updatedVideos = videos.map(v => 
      v.id === editingVideo.id ? { ...editingVideo, ...videoFormData } : v
    );

    saveVideos(updatedVideos);
    resetVideoForm();
  };

  const handleRemoveVideo = (id: string) => {
    saveVideos(videos.filter(v => v.id !== id));
    setShowVideoModal(false);
  };

  const openEditVideoModal = (video: VideoTutorial) => {
    setEditingVideo(video);
    setVideoFormData({
      titulo: video.titulo,
      descricao: video.descricao,
      urlEmbed: video.urlEmbed,
      categoria: video.categoria,
      duracao: video.duracao
    });
    setShowAddVideoModal(true);
  };

  const resetVideoForm = () => {
    setVideoFormData({
      titulo: '',
      descricao: '',
      urlEmbed: '',
      categoria: 'Finalização',
      duracao: ''
    });
    setEditingVideo(null);
    setShowAddVideoModal(false);
  };

  const openVideoModal = (video: VideoTutorial) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  // Filtrar vídeos
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !filterCategoria || video.categoria === filterCategoria;
    return matchesSearch && matchesCategoria;
  });

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

  const totalMatches = team.stats.wins + team.stats.draws + team.stats.losses;
  const winRate = totalMatches > 0 ? Math.round((team.stats.wins / totalMatches) * 100) : 0;
  const goalDifference = team.stats.goalsFor - team.stats.goalsAgainst;

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back Button */}
        <Link href="/times" className="inline-flex items-center gap-2 text-white/60 hover:text-[#FF6B00] transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          Voltar para Meus Times
        </Link>

        {/* Team Header */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="text-6xl sm:text-7xl">{team.logo}</div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {team.name}
                </h1>
                <p className="text-white/60 text-lg">{team.description}</p>
              </div>
            </div>
            
            <Link href={`/times/${team.id}/editar`} className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Editar Time
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FF6B00]/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-[#FF6B00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{team.players.length}</div>
              <div className="text-white/60 text-sm">Jogadores</div>
            </div>
            <div className="bg-[#FF6B00]/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-[#FF6B00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{totalMatches}</div>
              <div className="text-white/60 text-sm">Partidas</div>
            </div>
            <div className="bg-[#FF6B00]/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-[#FF6B00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{winRate}%</div>
              <div className="text-white/60 text-sm">Aproveitamento</div>
            </div>
            <div className="bg-[#FF6B00]/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-[#FF6B00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {goalDifference > 0 ? '+' : ''}{goalDifference}
              </div>
              <div className="text-white/60 text-sm">Saldo de Gols</div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-8 border-b border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('resumo')}
            className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
              activeTab === 'resumo'
                ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Resumo
          </button>
          <button
            onClick={() => setActiveTab('elenco')}
            className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
              activeTab === 'elenco'
                ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Elenco
          </button>
          <button
            onClick={() => setActiveTab('taticas')}
            className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
              activeTab === 'taticas'
                ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Táticas
          </button>
          <button
            onClick={() => setActiveTab('fotos')}
            className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
              activeTab === 'fotos'
                ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Fotos
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
              activeTab === 'videos'
                ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Vídeos Tutoriais
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'resumo' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Stats */}
            <div className="lg:col-span-2 space-y-8">
              {/* Performance Stats */}
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Estatísticas de Desempenho
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-[#FF6B00]" />
                        <span className="text-white font-medium">Vitórias</span>
                      </div>
                      <span className="text-[#FF6B00] font-bold text-xl">{team.stats.wins}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] h-full rounded-full"
                        style={{ width: `${totalMatches > 0 ? (team.stats.wins / totalMatches) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-white/60" />
                        <span className="text-white font-medium">Empates</span>
                      </div>
                      <span className="text-white font-bold text-xl">{team.stats.draws}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-white/40 h-full rounded-full"
                        style={{ width: `${totalMatches > 0 ? (team.stats.draws / totalMatches) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-red-500" />
                        <span className="text-white font-medium">Derrotas</span>
                      </div>
                      <span className="text-white/60 font-bold text-xl">{team.stats.losses}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-red-500/40 h-full rounded-full"
                        style={{ width: `${totalMatches > 0 ? (team.stats.losses / totalMatches) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Goals Stats */}
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Estatísticas de Gols
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#FF6B00] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {team.stats.goalsFor}
                    </div>
                    <div className="text-white/60">Gols Marcados</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white/60 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {team.stats.goalsAgainst}
                    </div>
                    <div className="text-white/60">Gols Sofridos</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 ${goalDifference > 0 ? 'text-[#FF6B00]' : 'text-white/60'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {goalDifference > 0 ? '+' : ''}{goalDifference}
                    </div>
                    <div className="text-white/60">Saldo</div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Média de gols por partida</span>
                    <span className="text-white font-bold">
                      {totalMatches > 0 ? (team.stats.goalsFor / totalMatches).toFixed(1) : '0.0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Ações Rápidas
                </h3>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveTab('elenco')}
                    className="w-full flex items-center gap-3 p-4 bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 rounded-xl transition-all group"
                  >
                    <Users className="w-5 h-5 text-[#FF6B00]" />
                    <div className="flex-1 text-left">
                      <div className="text-white font-medium">Ver Elenco</div>
                      <div className="text-white/60 text-sm">{team.players.length} jogadores</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('taticas')}
                    className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
                  >
                    <Clipboard className="w-5 h-5 text-white/60 group-hover:text-[#FF6B00]" />
                    <div className="flex-1 text-left">
                      <div className="text-white font-medium">Ver Táticas</div>
                      <div className="text-white/60 text-sm">Prancheta tática</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('fotos')}
                    className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
                  >
                    <ImageIcon className="w-5 h-5 text-white/60 group-hover:text-[#FF6B00]" />
                    <div className="flex-1 text-left">
                      <div className="text-white font-medium">Ver Galeria</div>
                      <div className="text-white/60 text-sm">{fotos.length} fotos</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('videos')}
                    className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
                  >
                    <Play className="w-5 h-5 text-white/60 group-hover:text-[#FF6B00]" />
                    <div className="flex-1 text-left">
                      <div className="text-white font-medium">Ver Vídeos</div>
                      <div className="text-white/60 text-sm">{videos.length} vídeos</div>
                    </div>
                  </button>

                  <Link href="/agenda" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group">
                    <Calendar className="w-5 h-5 text-white/60 group-hover:text-[#FF6B00]" />
                    <div className="flex-1">
                      <div className="text-white font-medium">Ver Agenda</div>
                      <div className="text-white/60 text-sm">Próximos jogos</div>
                    </div>
                  </Link>

                  <Link href="/buscar" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group">
                    <MapPin className="w-5 h-5 text-white/60 group-hover:text-[#FF6B00]" />
                    <div className="flex-1">
                      <div className="text-white font-medium">Buscar Adversários</div>
                      <div className="text-white/60 text-sm">Encontre times</div>
                    </div>
                  </Link>
                </div>
              </div> */}
              
              {/* Capitão do time */}
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
                {/* Título centralizado com ícone */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Crown className="w-5 h-5 text-[#FF6B00]" />
                  <h3 className="text-xl font-bold text-white text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Capitão do Time
                  </h3>
                </div>
                
                {/* Foto do Capitão */}
                <div className="flex flex-col items-center mb-4">
                  <div className="relative group">
                    {capitaoFoto ? (
                      <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#FF6B00]/30 shadow-[0_0_20px_rgba(255,107,0,0.2)]">
                        <img 
                          src={capitaoFoto} 
                          alt="Capitão do time"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-28 h-28 rounded-full bg-white/5 border-4 border-dashed border-white/20 flex items-center justify-center">
                        <Camera className="w-10 h-10 text-white/30" />
                      </div>
                    )}
                    
                    {/* Botão de upload sobreposto */}
                    {isOwnerMode && (
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="flex flex-col items-center text-white">
                          <Upload className="w-6 h-6 mb-1" />
                          <span className="text-xs">{capitaoFoto ? 'Trocar' : 'Carregar'}</span>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleCapitaoFotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                    
                    {/* Badge de capitão */}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#FF6B00] rounded-full flex items-center justify-center border-2 border-[#0D0D0D]">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  {/* Nome do Capitão */}
                  <div className="mt-4 text-center">
                    <div className="text-white font-bold text-lg">
                      {capitaoNome || team.players[0]?.name || 'Selecione o Capitão'}
                    </div>
                    <div className="text-[#FF6B00] text-sm font-medium">
                      {team.players[0]?.position || 'Capitão'}
                    </div>
                  </div>
                </div>

                {/* Instrução quando não há foto */}
                {!capitaoFoto && isOwnerMode && (
                  <p className="text-white/40 text-xs text-center mt-2">
                    Passe o mouse sobre a imagem para carregar uma foto
                  </p>
                )}
              </div>

              {/* Top Players */}
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Artilheiros
                </h3>
                
                <div className="space-y-3">
                  {team.players
                    .sort((a, b) => b.stats.goals - a.stats.goals)
                    .slice(0, 3)
                    .map((player, index) => (
                      <div key={player.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-[#FF6B00]/20 text-[#FF6B00]' : 'bg-white/10 text-white/60'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">{player.name}</div>
                          <div className="text-white/60 text-xs">{player.position}</div>
                        </div>
                        <div className="text-[#FF6B00] font-bold">{player.stats.goals}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'elenco' && (
          <div className="space-y-6">
            {/* Header com título e botão adicionar */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Elenco Completo
                  </h2>
                  <p className="text-white/60 text-sm mt-1">{filteredPlayers.length} jogadores encontrados</p>
                </div>
                
                {isOwnerMode && (
                  <button
                    onClick={() => setShowAddPlayerModal(true)}
                    className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-5 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] flex items-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    Adicionar Jogador
                  </button>
                )}
              </div>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Busca por nome */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={playerSearchTerm}
                    onChange={(e) => setPlayerSearchTerm(e.target.value)}
                    placeholder="Buscar jogador por nome..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/40 focus:border-[#FF6B00] focus:outline-none transition-all"
                  />
                </div>

                {/* Filtro por posição */}
                <select
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none transition-all min-w-[160px]"
                >
                  <option value="">Todas posições</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>

                {/* Filtro por disponibilidade */}
                <select
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value as 'all' | 'available' | 'unavailable')}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none transition-all min-w-[160px]"
                >
                  <option value="all">Todos</option>
                  <option value="available">Disponíveis</option>
                  <option value="unavailable">Indisponíveis</option>
                </select>
              </div>

              {/* Lista de jogadores */}
              {filteredPlayers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Nenhum jogador encontrado</h3>
                  <p className="text-white/60">Tente ajustar os filtros ou adicione um novo jogador</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPlayers.map((player) => {
                    const isCustomPlayer = customPlayers.some(p => p.id === player.id);
                    
                    return (
                      <div 
                        key={player.id} 
                        onClick={() => handleOpenPlayerDetail(player)}
                        className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all group relative cursor-pointer"
                      >
                        {/* Badge de disponibilidade */}
                        <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${
                          player.available ? 'bg-green-500' : 'bg-red-500'
                        }`} title={player.available ? 'Disponível' : 'Indisponível'} />
                        
                        {/* Botão remover (apenas para jogadores customizados) */}
                        {isOwnerMode && isCustomPlayer && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemovePlayer(player.id); }}
                            className="absolute top-3 right-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-400"
                            title="Remover jogador"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        
                        <div className="flex items-center gap-3 mb-3">
                          {/* Foto ou ícone do jogador */}
                          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-[#FF6B00]/20">
                            {player.foto ? (
                              <img 
                                src={player.foto} 
                                alt={player.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-[#FF6B00]/60" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium">
                              {player.name}
                              <span className="text-white/40 font-normal"> - {player.number}</span>
                            </div>
                            <div className="text-white/60 text-sm flex items-center gap-2">
                              {player.position}
                              {player.age && <span className="text-white/40">• {player.age} anos</span>}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                          <div>
                            <div className="text-white/60">Gols</div>
                            <div className="text-[#FF6B00] font-bold">{player.stats.goals}</div>
                          </div>
                          <div>
                            <div className="text-white/60">Assist.</div>
                            <div className="text-white font-bold">{player.stats.assists}</div>
                          </div>
                          <div>
                            <div className="text-white/60">Jogos</div>
                            <div className="text-white font-bold">{player.stats.matches}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'taticas' && (
          <div>
            <Link 
              href={`/times/${team.id}/taticas`}
              className="block bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-8 hover:border-[#FF6B00]/40 transition-all"
            >
              <div className="text-center">
                <Clipboard className="w-16 h-16 text-[#FF6B00] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Táticas de {team.name}
                </h2>
                <p className="text-white/60 mb-6">
                  Gerencie as táticas e formações do seu time
                </p>
                <div className="inline-flex items-center gap-2 text-[#FF6B00] font-medium">
                  Acessar Prancheta Tática
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </div>
              </div>
            </Link>
          </div>
        )}

        {activeTab === 'fotos' && (
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Galeria de Fotos – {team.name}
              </h2>
              <button
                onClick={() => setShowAddFotoModal(true)}
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] flex items-center gap-2"
              >
                <ImageIcon className="w-5 h-5" />
                Adicionar Foto
              </button>
            </div>

            {fotos.length === 0 ? (
              <div className="text-center py-16">
                <ImageIcon className="w-20 h-20 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Nenhuma foto cadastrada</h3>
                <p className="text-white/60 mb-6">Comece adicionando a primeira foto do seu time!</p>
                <button
                  onClick={() => setShowAddFotoModal(true)}
                  className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)]"
                >
                  Adicionar Primeira Foto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {fotos.map((foto) => (
                  <div key={foto.id} className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all group">
                    <div className="aspect-video bg-white/10 relative overflow-hidden">
                      <img 
                        src={foto.url} 
                        alt={foto.titulo}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleViewFoto(foto)}
                          className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white p-3 rounded-lg transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRemoveFoto(foto.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-bold mb-1">{foto.titulo}</h3>
                      <p className="text-white/60 text-sm mb-2">
                        {new Date(foto.data).toLocaleDateString('pt-BR')}
                      </p>
                      {foto.descricao && (
                        <p className="text-white/40 text-sm line-clamp-2">{foto.descricao}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Vídeos Tutoriais – {team.name}
              </h2>
              <button
                onClick={() => setShowAddVideoModal(true)}
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Adicionar Vídeo
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por título..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
              >
                <option value="">Todas as categorias</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Videos Grid */}
            {filteredVideos.length === 0 ? (
              <div className="text-center py-16">
                <Play className="w-20 h-20 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {searchTerm || filterCategoria ? 'Nenhum vídeo encontrado' : 'Nenhum vídeo cadastrado'}
                </h3>
                <p className="text-white/60 mb-6">
                  {searchTerm || filterCategoria 
                    ? 'Tente ajustar os filtros de busca' 
                    : 'Comece adicionando vídeos tutoriais para este time'}
                </p>
                {!searchTerm && !filterCategoria && (
                  <button
                    onClick={() => setShowAddVideoModal(true)}
                    className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)]"
                  >
                    Adicionar Primeiro Vídeo
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                  <div key={video.id} className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all group">
                    <div className="aspect-video bg-white/10 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="w-16 h-16 text-white/80" />
                      </div>
                      <div className="absolute top-3 right-3 bg-black/80 px-3 py-1 rounded-lg flex items-center gap-1">
                        <Clock className="w-4 h-4 text-white/60" />
                        <span className="text-white/80 text-sm font-medium">{video.duracao}</span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-[#FF6B00]/20 text-[#FF6B00] px-3 py-1 rounded-lg text-xs font-bold">
                          {video.categoria}
                        </span>
                      </div>

                      <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">
                        {video.titulo}
                      </h3>
                      <p className="text-white/60 text-sm mb-4 line-clamp-2">
                        {video.descricao}
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openVideoModal(video)}
                          className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Assistir
                        </button>
                        <button
                          onClick={() => openEditVideoModal(video)}
                          className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg transition-all"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRemoveVideo(video.id)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-500 p-2 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Adicionar Foto */}
      {showAddFotoModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Adicionar Foto
              </h3>
              <button
                onClick={() => setShowAddFotoModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2 font-medium">Título *</label>
                <input
                  type="text"
                  value={newFoto.titulo}
                  onChange={(e) => setNewFoto({ ...newFoto, titulo: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                  placeholder="Ex: Treino de Finalizações"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 font-medium">URL da Imagem *</label>
                <input
                  type="url"
                  value={newFoto.url}
                  onChange={(e) => setNewFoto({ ...newFoto, url: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                {newFoto.url && (
                  <div className="mt-3 aspect-video bg-white/5 rounded-lg overflow-hidden">
                    <img 
                      src={newFoto.url} 
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white/80 mb-2 font-medium">Data</label>
                <input
                  type="date"
                  value={newFoto.data}
                  onChange={(e) => setNewFoto({ ...newFoto, data: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 font-medium">Descrição (opcional)</label>
                <textarea
                  value={newFoto.descricao}
                  onChange={(e) => setNewFoto({ ...newFoto, descricao: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none resize-none"
                  rows={3}
                  placeholder="Adicione uma descrição para a foto..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddFotoModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddFoto}
                disabled={!newFoto.titulo || !newFoto.url}
                className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Foto */}
      {showFotoModal && selectedFoto && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {selectedFoto.titulo}
              </h3>
              <button
                onClick={() => setShowFotoModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <img 
                src={selectedFoto.url} 
                alt={selectedFoto.titulo}
                className="w-full rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop';
                }}
              />
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-white/60">
                <Calendar className="w-5 h-5" />
                <span>{new Date(selectedFoto.data).toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}</span>
              </div>
              {selectedFoto.descricao && (
                <p className="text-white/80">{selectedFoto.descricao}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFotoModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                Fechar
              </button>
              <button
                onClick={() => handleRemoveFoto(selectedFoto.id)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar/Editar Vídeo */}
      {showAddVideoModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {editingVideo ? 'Editar Vídeo Tutorial' : 'Adicionar Vídeo Tutorial'}
              </h3>
              <button
                onClick={resetVideoForm}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2 font-medium">Título *</label>
                <input
                  type="text"
                  value={videoFormData.titulo}
                  onChange={(e) => setVideoFormData({ ...videoFormData, titulo: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                  placeholder="Ex: Técnicas de Finalização"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 font-medium">Descrição</label>
                <textarea
                  value={videoFormData.descricao}
                  onChange={(e) => setVideoFormData({ ...videoFormData, descricao: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none resize-none"
                  rows={3}
                  placeholder="Descreva o conteúdo do vídeo..."
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 font-medium">URL do Vídeo (YouTube) *</label>
                <input
                  type="url"
                  value={videoFormData.urlEmbed}
                  onChange={(e) => setVideoFormData({ ...videoFormData, urlEmbed: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                  placeholder="https://www.youtube.com/embed/..."
                />
                <p className="text-white/40 text-sm mt-2">
                  Use o formato de embed do YouTube (clique em Compartilhar → Incorporar)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 mb-2 font-medium">Categoria *</label>
                  <select
                    value={videoFormData.categoria}
                    onChange={(e) => setVideoFormData({ ...videoFormData, categoria: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                  >
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 mb-2 font-medium">Duração</label>
                  <input
                    type="text"
                    value={videoFormData.duracao}
                    onChange={(e) => setVideoFormData({ ...videoFormData, duracao: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                    placeholder="Ex: 10:30"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={resetVideoForm}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={editingVideo ? handleEditVideo : handleAddVideo}
                disabled={!videoFormData.titulo || !videoFormData.urlEmbed}
                className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingVideo ? 'Salvar Alterações' : 'Adicionar Vídeo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Assistir Vídeo */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {selectedVideo.titulo}
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="bg-[#FF6B00]/20 text-[#FF6B00] px-3 py-1 rounded-lg font-bold">
                    {selectedVideo.categoria}
                  </span>
                  <span className="text-white/60 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedVideo.duracao}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
              <iframe
                src={selectedVideo.urlEmbed}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {selectedVideo.descricao && (
              <div className="mb-6">
                <h4 className="text-white font-bold mb-2">Sobre este vídeo</h4>
                <p className="text-white/80">{selectedVideo.descricao}</p>
              </div>
            )}

            <button
              onClick={() => setShowVideoModal(false)}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal Adicionar Jogador */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Adicionar Jogador
              </h3>
              <button
                onClick={() => setShowAddPlayerModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2 font-medium">Nome Completo *</label>
                <input
                  type="text"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                  placeholder="Ex: João Silva"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 mb-2 font-medium">Número da Camisa *</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={newPlayer.number || ''}
                    onChange={(e) => setNewPlayer({ ...newPlayer, number: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                    placeholder="Ex: 10"
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2 font-medium">Idade</label>
                  <input
                    type="number"
                    min="10"
                    max="60"
                    value={newPlayer.age || ''}
                    onChange={(e) => setNewPlayer({ ...newPlayer, age: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                    placeholder="Ex: 25"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 mb-2 font-medium">Posição *</label>
                <select
                  value={newPlayer.position}
                  onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                >
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                <input
                  type="checkbox"
                  id="available"
                  checked={newPlayer.available}
                  onChange={(e) => setNewPlayer({ ...newPlayer, available: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-[#FF6B00] focus:ring-[#FF6B00]"
                />
                <label htmlFor="available" className="text-white cursor-pointer">
                  Jogador disponível para próximos jogos
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddPlayerModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddPlayer}
                disabled={!newPlayer.name || newPlayer.number <= 0}
                className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes do Jogador */}
      {showPlayerDetailModal && selectedPlayer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* Foto do jogador */}
                <div className="relative group">
                  {(isEditingPlayer ? editPlayerData.foto : selectedPlayer.foto) ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#FF6B00]/30">
                      <img 
                        src={isEditingPlayer ? editPlayerData.foto : selectedPlayer.foto} 
                        alt={selectedPlayer.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#FF6B00]/20 border-2 border-dashed border-[#FF6B00]/30 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-[#FF6B00]/50" />
                    </div>
                  )}
                  
                  {/* Overlay de upload (apenas para jogadores customizados) */}
                  {isOwnerMode && customPlayers.some(p => p.id === selectedPlayer.id) && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Upload className="w-5 h-5 text-white" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const base64 = reader.result as string;
                              setEditPlayerData({ ...editPlayerData, foto: base64 });
                              const updatedPlayers = customPlayers.map(p => 
                                p.id === selectedPlayer.id ? { ...p, foto: base64 } as Player : p
                              );
                              savePlayers(updatedPlayers);
                              setSelectedPlayer({ ...selectedPlayer, foto: base64 });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Nome e número */}
                <div>
                  <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {isEditingPlayer ? editPlayerData.name : selectedPlayer.name}
                    <span className="text-white/40 font-normal"> - {isEditingPlayer ? editPlayerData.number : selectedPlayer.number}</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[#FF6B00] font-medium">
                      {isEditingPlayer ? editPlayerData.position : selectedPlayer.position}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${
                      (isEditingPlayer ? editPlayerData.available : selectedPlayer.available) ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-white/60 text-sm">
                      {(isEditingPlayer ? editPlayerData.available : selectedPlayer.available) ? 'Disponível' : 'Indisponível'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setShowPlayerDetailModal(false); setIsEditingPlayer(false); }}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {isEditingPlayer ? (
              /* Modo Edição */
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 mb-2 font-medium">Nome *</label>
                    <input
                      type="text"
                      value={editPlayerData.name || ''}
                      onChange={(e) => setEditPlayerData({ ...editPlayerData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2 font-medium">Número *</label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={editPlayerData.number || ''}
                      onChange={(e) => setEditPlayerData({ ...editPlayerData, number: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 mb-2 font-medium">Posição Principal</label>
                    <select
                      value={editPlayerData.position || ''}
                      onChange={(e) => setEditPlayerData({ ...editPlayerData, position: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                    >
                      {positions.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2 font-medium">Posição Secundária</label>
                    <select
                      value={editPlayerData.secondaryPosition || ''}
                      onChange={(e) => setEditPlayerData({ ...editPlayerData, secondaryPosition: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                    >
                      <option value="">Nenhuma</option>
                      {positions.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white/80 mb-2 font-medium">Idade</label>
                    <input
                      type="number"
                      min="10"
                      max="60"
                      value={editPlayerData.age || ''}
                      onChange={(e) => setEditPlayerData({ ...editPlayerData, age: parseInt(e.target.value) || undefined })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2 font-medium">Pé Predominante</label>
                    <select
                      value={editPlayerData.preferredFoot || ''}
                      onChange={(e) => setEditPlayerData({ ...editPlayerData, preferredFoot: e.target.value as 'Direito' | 'Esquerdo' | 'Ambos' })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                    >
                      <option value="">Não informado</option>
                      {preferredFootOptions.map(foot => (
                        <option key={foot} value={foot}>{foot}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2 font-medium">Telefone</label>
                    <input
                      type="tel"
                      value={editPlayerData.phone || ''}
                      onChange={(e) => setEditPlayerData({ ...editPlayerData, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                {/* Checkboxes de funções */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                    <input
                      type="checkbox"
                      id="editCaptain"
                      checked={editPlayerData.isCaptain || false}
                      onChange={(e) => setEditPlayerData({ ...editPlayerData, isCaptain: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-[#FF6B00] focus:ring-[#FF6B00]"
                    />
                    <label htmlFor="editCaptain" className="text-white cursor-pointer flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      Capitão do time
                    </label>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                    <input
                      type="checkbox"
                      id="editFreeKick"
                      checked={editPlayerData.isFreeKickTaker || false}
                      onChange={(e) => setEditPlayerData({ ...editPlayerData, isFreeKickTaker: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-[#FF6B00] focus:ring-[#FF6B00]"
                    />
                    <label htmlFor="editFreeKick" className="text-white cursor-pointer flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#FF6B00]" />
                      Batedor de falta
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                    <input
                      type="checkbox"
                      id="editGuest"
                      checked={editPlayerData.isGuest || false}
                      onChange={(e) => setEditPlayerData({ ...editPlayerData, isGuest: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-[#FF6B00] focus:ring-[#FF6B00]"
                    />
                    <label htmlFor="editGuest" className="text-white cursor-pointer flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-blue-400" />
                      Jogador convidado
                    </label>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                    <input
                      type="checkbox"
                      id="editAvailable"
                      checked={editPlayerData.available || false}
                      onChange={(e) => setEditPlayerData({ ...editPlayerData, available: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-[#FF6B00] focus:ring-[#FF6B00]"
                    />
                    <label htmlFor="editAvailable" className="text-white cursor-pointer">
                      Disponível para jogos
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              /* Modo Visualização */
              <div className="space-y-6">
                {/* Estatísticas */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-[#FF6B00]">{selectedPlayer.stats.goals}</div>
                    <div className="text-white/60 text-sm">Gols</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-white">{selectedPlayer.stats.assists}</div>
                    <div className="text-white/60 text-sm">Assistências</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-white">{selectedPlayer.stats.matches}</div>
                    <div className="text-white/60 text-sm">Jogos</div>
                  </div>
                </div>

                {/* Informações Detalhadas */}
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-white font-bold mb-4">Informações do Jogador</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Idade:</span>
                      <span className="text-white">{selectedPlayer.age ? `${selectedPlayer.age} anos` : 'Não informado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Pé Predominante:</span>
                      <span className="text-white">{selectedPlayer.preferredFoot || 'Não informado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Posição Secundária:</span>
                      <span className="text-white">{selectedPlayer.secondaryPosition || 'Nenhuma'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Telefone:</span>
                      <span className="text-white">{selectedPlayer.phone || 'Não informado'}</span>
                    </div>
                  </div>
                </div>

                {/* Funções do Jogador */}
                <div className="flex flex-wrap gap-3">
                  {selectedPlayer.isCaptain && (
                    <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-500 px-4 py-2 rounded-full text-sm font-medium">
                      <Crown className="w-4 h-4" />
                      Capitão
                    </div>
                  )}
                  {selectedPlayer.isFreeKickTaker && (
                    <div className="flex items-center gap-2 bg-[#FF6B00]/20 text-[#FF6B00] px-4 py-2 rounded-full text-sm font-medium">
                      <Target className="w-4 h-4" />
                      Batedor de Falta
                    </div>
                  )}
                  {selectedPlayer.isGuest && (
                    <div className="flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium">
                      <UserPlus className="w-4 h-4" />
                      Convidado
                    </div>
                  )}
                  {!selectedPlayer.isCaptain && !selectedPlayer.isFreeKickTaker && !selectedPlayer.isGuest && (
                    <span className="text-white/40 text-sm">Nenhuma função especial atribuída</span>
                  )}
                </div>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex gap-3 mt-6">
              {isEditingPlayer ? (
                <>
                  <button
                    onClick={() => { setIsEditingPlayer(false); setEditPlayerData({ ...selectedPlayer }); }}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSavePlayerEdit}
                    className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)]"
                  >
                    Salvar Alterações
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowPlayerDetailModal(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl transition-all"
                  >
                    Fechar
                  </button>
                  {isOwnerMode && customPlayers.some(p => p.id === selectedPlayer.id) && (
                    <>
                      <button
                        onClick={() => setIsEditingPlayer(true)}
                        className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] flex items-center justify-center gap-2"
                      >
                        <Edit className="w-5 h-5" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleRemovePlayer(selectedPlayer.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
