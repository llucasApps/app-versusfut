'use client';

import Navigation from '@/components/Navigation';
import { ArrowLeft, Edit, Users, Trophy, TrendingUp, Target, Calendar, MapPin, Clipboard, Image as ImageIcon, X, Eye, Trash2, Play, Plus, Search, Clock, Camera, Upload, Crown, Filter, UserPlus, User, FolderPlus, Loader2, Swords, History, Shuffle, Award } from 'lucide-react';
import { Player, PhotoFolder, TeamPhoto, VideoFolder, VideoTutorial } from '@/lib/supabase';
import HistoricoPartidas from '@/components/HistoricoPartidas';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useViewMode } from '@/hooks/useViewMode';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Team } from '@/lib/supabase';

type Tab = 'resumo' | 'elenco' | 'historico' | 'taticas' | 'fotos' | 'videos';

const categorias = ['Finalização', 'Tática', 'Preparação Física', 'Passe', 'Defesa', 'Drible'];

// Função para converter qualquer URL do YouTube para formato embed
function convertToEmbedUrl(url: string): string {
  if (!url) return url;
  
  // Se já é uma URL de embed, retorna como está
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  let videoId = '';
  
  // Formato: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) {
    videoId = watchMatch[1];
  }
  
  // Formato: https://youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) {
    videoId = shortMatch[1];
  }
  
  // Formato: https://www.youtube.com/shorts/VIDEO_ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&]+)/);
  if (shortsMatch) {
    videoId = shortsMatch[1];
  }
  
  // Formato: https://www.youtube.com/live/VIDEO_ID
  const liveMatch = url.match(/youtube\.com\/live\/([^?&]+)/);
  if (liveMatch) {
    videoId = liveMatch[1];
  }
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  return url;
}

// Função para extrair o ID do vídeo do YouTube de qualquer URL
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /[?&]v=([^&]+)/,           // watch?v=
    /youtu\.be\/([^?&]+)/,     // youtu.be/
    /youtube\.com\/embed\/([^?&]+)/, // embed/
    /youtube\.com\/shorts\/([^?&]+)/, // shorts/
    /youtube\.com\/live\/([^?&]+)/    // live/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

// Função para obter a thumbnail do YouTube
function getYouTubeThumbnail(url: string): string | null {
  const videoId = getYouTubeVideoId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return null;
}

export default function TeamDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const { isOwnerMode } = useViewMode();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('resumo');

  // Buscar time do Supabase
  useEffect(() => {
    const fetchTeam = async () => {
      if (!params.id) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Erro ao buscar time:', error);
        setTeam(null);
      } else {
        setTeam(data);
      }
      setLoading(false);
    };

    fetchTeam();
  }, [params.id]);
  const [fotos, setFotos] = useState<TeamPhoto[]>([]);
  const [pastasFotos, setPastasFotos] = useState<PhotoFolder[]>([]);
  const [pastaFotosAtual, setPastaFotosAtual] = useState<string | null>(null);
  const [showAddPastaFotosModal, setShowAddPastaFotosModal] = useState(false);
  const [editingPastaFotos, setEditingPastaFotos] = useState<PhotoFolder | null>(null);
  const [novaPastaFotos, setNovaPastaFotos] = useState('');
  
  const [videos, setVideos] = useState<VideoTutorial[]>([]);
  const [pastasVideos, setPastasVideos] = useState<VideoFolder[]>([]);
  const [pastaVideosAtual, setPastaVideosAtual] = useState<string | null>(null);
  const [showAddPastaVideosModal, setShowAddPastaVideosModal] = useState(false);
  const [editingPastaVideos, setEditingPastaVideos] = useState<VideoFolder | null>(null);
  const [novaPastaVideos, setNovaPastaVideos] = useState('');
  
  const [showAddFotoModal, setShowAddFotoModal] = useState(false);
  const [showFotoModal, setShowFotoModal] = useState(false);
  const [selectedFoto, setSelectedFoto] = useState<TeamPhoto | null>(null);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoTutorial | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [fotoFiles, setFotoFiles] = useState<File[]>([]);
  const [fotoPreviews, setFotoPreviews] = useState<string[]>([]);
  const [newFoto, setNewFoto] = useState({
    titulo: '',
    descricao: ''
  });
  const [videoFormData, setVideoFormData] = useState({
    titulo: '',
    descricao: '',
    url_embed: '',
    categoria: ''
  });
  const [savingVideo, setSavingVideo] = useState(false);
  const [capitaoFoto, setCapitaoFoto] = useState<string | null>(null);
  const [capitaoNome, setCapitaoNome] = useState<string>('');
  
  // Estados para dados editados do time
  const [teamData, setTeamData] = useState<{
    name: string; 
    logo: string; 
    description: string; 
    president: string;
    phone: string;
    category: string;
    availableForMatch: boolean;
  } | null>(null);
  
  // Estados para Elenco
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showPlayerDetailModal, setShowPlayerDetailModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isEditingPlayer, setIsEditingPlayer] = useState(false);
  const [playerSearchTerm, setPlayerSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'available' | 'unavailable'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [customPlayers, setCustomPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: 'Atacante',
    number: 0,
    age: 0,
    available: true,
    phone: '',
    preferred_foot: 'Direito' as 'Direito' | 'Esquerdo' | 'Ambos',
    secondary_position: '',
    is_guest: false,
  });
  const [newPlayerPhoto, setNewPlayerPhoto] = useState<File | null>(null);
  const [newPlayerPhotoPreview, setNewPlayerPhotoPreview] = useState<string>('');
  const [uploadingPlayerPhoto, setUploadingPlayerPhoto] = useState(false);
  const newPlayerPhotoInputRef = useRef<HTMLInputElement>(null);

  // Função para aplicar máscara de telefone
  const formatPlayerPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers.length ? `(${numbers}` : '';
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleNewPlayerPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPlayerPhone(e.target.value);
    setNewPlayer({ ...newPlayer, phone: formatted });
  };

  // Função para upload de foto do jogador (preview)
  const handleNewPlayerPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('O arquivo deve ser uma imagem');
        return;
      }
      setNewPlayerPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPlayerPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const [editPlayerData, setEditPlayerData] = useState<Partial<Player>>({});

  const positions = ['Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meio-Campo', 'Meia', 'Atacante', 'Ponta'];
  const preferredFootOptions = ['Direito', 'Esquerdo', 'Ambos'] as const;
  
  // Estado para evitar erro de hidratação
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Carregar fotos e pastas do Supabase
  useEffect(() => {
    const fetchPhotosAndFolders = async () => {
      if (!team) return;

      // Buscar pastas de fotos
      const { data: foldersData, error: foldersError } = await supabase
        .from('photo_folders')
        .select('*')
        .eq('team_id', team.id)
        .order('created_at', { ascending: true });

      if (foldersError) {
        console.error('Erro ao buscar pastas de fotos:', foldersError);
      } else {
        setPastasFotos(foldersData || []);
      }

      // Buscar fotos
      const { data: photosData, error: photosError } = await supabase
        .from('team_photos')
        .select('*')
        .eq('team_id', team.id)
        .order('created_at', { ascending: false });

      if (photosError) {
        console.error('Erro ao buscar fotos:', photosError);
      } else {
        setFotos(photosData || []);
      }
    };

    fetchPhotosAndFolders();
  }, [team]);

  // Carregar vídeos e pastas de vídeos do Supabase
  useEffect(() => {
    const fetchVideosAndFolders = async () => {
      if (!team) return;

      // Carregar pastas de vídeos
      const { data: foldersData } = await supabase
        .from('video_folders')
        .select('*')
        .eq('team_id', team.id)
        .order('created_at', { ascending: true });
      
      if (foldersData) {
        setPastasVideos(foldersData);
      }

      // Carregar vídeos
      const { data: videosData } = await supabase
        .from('video_tutorials')
        .select('*')
        .eq('team_id', team.id)
        .order('created_at', { ascending: false });
      
      if (videosData) {
        setVideos(videosData);
      }
    };

    fetchVideosAndFolders();
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

  // Carregar jogadores do Supabase
  useEffect(() => {
    const fetchPlayers = async () => {
      if (!team) return;
      
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', team.id)
        .order('number', { ascending: true });

      if (error) {
        console.error('Erro ao buscar jogadores:', error);
      } else {
        setCustomPlayers(data || []);
      }
    };

    fetchPlayers();
  }, [team]);

  // Carregar dados editados do time do localStorage
  useEffect(() => {
    if (team) {
      const storedTeamData = localStorage.getItem(`team_${team.id}`);
      if (storedTeamData) {
        setTeamData(JSON.parse(storedTeamData));
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

  // Upload de foto de jogador para o Supabase Storage
  const uploadPlayerPhoto = async (file: File, playerId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${playerId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('player-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Erro ao fazer upload:', uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('player-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erro no upload:', error);
      return null;
    }
  };

  // Função auxiliar para recarregar fotos do Supabase
  const reloadFotos = async () => {
    if (!team) return;
    const { data, error } = await supabase
      .from('team_photos')
      .select('*')
      .eq('team_id', team.id)
      .order('created_at', { ascending: false });
    if (!error && data) {
      setFotos(data);
    }
  };

  // Funções auxiliares para recarregar vídeos e pastas do Supabase
  const reloadVideos = async () => {
    if (!team) return;
    const { data } = await supabase
      .from('video_tutorials')
      .select('*')
      .eq('team_id', team.id)
      .order('created_at', { ascending: false });
    if (data) {
      setVideos(data);
    }
  };

  const reloadPastasVideos = async () => {
    if (!team) return;
    const { data } = await supabase
      .from('video_folders')
      .select('*')
      .eq('team_id', team.id)
      .order('created_at', { ascending: true });
    if (data) {
      setPastasVideos(data);
    }
  };

  // Adicionar novo jogador no Supabase
  const handleAddPlayer = async () => {
    if (!team || !newPlayer.name) return;

    // Primeiro, criar o jogador sem foto
    const { data, error } = await supabase
      .from('players')
      .insert({
        team_id: team.id,
        name: newPlayer.name,
        position: newPlayer.position,
        number: newPlayer.number || null,
        age: newPlayer.age || null,
        available: newPlayer.available,
        phone: newPlayer.phone || null,
        preferred_foot: newPlayer.preferred_foot,
        secondary_position: newPlayer.secondary_position || null,
        is_guest: newPlayer.is_guest,
        goals: 0,
        assists: 0,
        matches: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar jogador:', error);
      alert('Erro ao adicionar jogador. Tente novamente.');
      return;
    }

    // Se houver foto, fazer upload e atualizar o jogador
    if (newPlayerPhoto && data) {
      const fotoUrl = await uploadPlayerPhoto(newPlayerPhoto, data.id);
      if (fotoUrl) {
        await supabase
          .from('players')
          .update({ foto: fotoUrl })
          .eq('id', data.id);
        data.foto = fotoUrl;
      }
    }

    setCustomPlayers([...customPlayers, data]);
    setShowAddPlayerModal(false);
    setNewPlayer({
      name: '',
      position: 'Atacante',
      number: 0,
      age: 0,
      available: true,
      phone: '',
      preferred_foot: 'Direito',
      secondary_position: '',
      is_guest: false,
    });
    setNewPlayerPhoto(null);
    setNewPlayerPhotoPreview('');
  };

  // Remover jogador do Supabase
  const handleRemovePlayer = async (playerId: string) => {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId);

    if (error) {
      console.error('Erro ao remover jogador:', error);
      alert('Erro ao remover jogador. Tente novamente.');
      return;
    }

    setCustomPlayers(customPlayers.filter(p => p.id !== playerId));
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

  // Salvar edição do jogador no Supabase
  const handleSavePlayerEdit = async () => {
    if (!selectedPlayer || !editPlayerData.name) return;
    
    const { data, error } = await supabase
      .from('players')
      .update({
        name: editPlayerData.name,
        position: editPlayerData.position,
        number: editPlayerData.number || null,
        age: editPlayerData.age,
        available: editPlayerData.available,
        phone: editPlayerData.phone,
        foto: editPlayerData.foto,
        preferred_foot: editPlayerData.preferred_foot,
        secondary_position: editPlayerData.secondary_position,
        is_captain: editPlayerData.is_captain,
        is_free_kick_taker: editPlayerData.is_free_kick_taker,
        is_guest: editPlayerData.is_guest,
        goals: editPlayerData.goals,
        assists: editPlayerData.assists,
        matches: editPlayerData.matches
      })
      .eq('id', selectedPlayer.id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar jogador:', error);
      alert('Erro ao atualizar jogador. Tente novamente.');
      return;
    }

    const updatedPlayers = customPlayers.map(p => 
      p.id === selectedPlayer.id ? data : p
    );
    setCustomPlayers(updatedPlayers);
    setSelectedPlayer(data);
    setIsEditingPlayer(false);
  };

  // Jogadores do Supabase
  const allPlayers = customPlayers;

  // Ordem das posições para ordenação do elenco
  const positionOrder: Record<string, number> = {
    'Goleiro': 1,
    'Zagueiro': 2,
    'Lateral': 3,
    'Volante': 4,
    'Meio-Campo': 5,
    'Meia': 6,
    'Ponta': 7,
    'Atacante': 8,
  };

  // Filtrar e ordenar jogadores por posição
  const filteredPlayers = allPlayers
    .filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(playerSearchTerm.toLowerCase());
      const matchesPosition = !filterPosition || player.position === filterPosition;
      const matchesAvailability = 
        filterAvailability === 'all' || 
        (filterAvailability === 'available' && player.available) ||
        (filterAvailability === 'unavailable' && !player.available);
      
      return matchesSearch && matchesPosition && matchesAvailability;
    })
    .sort((a, b) => {
      const orderA = positionOrder[a.position] || 99;
      const orderB = positionOrder[b.position] || 99;
      return orderA - orderB;
    });

  // Handler para seleção de arquivos (múltiplos)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setFotoFiles(prev => [...prev, ...newFiles]);
      
      // Criar previews para cada arquivo
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFotoPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Handler para remover uma foto da seleção
  const handleRemoveFileFromSelection = (index: number) => {
    setFotoFiles(prev => prev.filter((_, i) => i !== index));
    setFotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddFoto = async () => {
    if (!team || fotoFiles.length === 0) return;

    setUploadingFoto(true);
    
    try {
      for (const file of fotoFiles) {
        // Upload para Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${team.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('team-photos')
          .upload(fileName, file, { upsert: true });

        if (uploadError) {
          console.error('Erro ao fazer upload:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('team-photos')
          .getPublicUrl(fileName);

        // Salvar metadados no banco
        const { error: insertError } = await supabase
          .from('team_photos')
          .insert({
            team_id: team.id,
            url: publicUrl,
            title: fotoFiles.length === 1 ? (newFoto.titulo || null) : null,
            description: fotoFiles.length === 1 ? (newFoto.descricao || null) : null,
            folder_id: pastaFotosAtual || null,
            photo_date: new Date().toISOString().split('T')[0]
          });

        if (insertError) {
          console.error('Erro ao salvar foto:', insertError);
        }
      }

      await reloadFotos();
      setShowAddFotoModal(false);
      setNewFoto({ titulo: '', descricao: '' });
      setFotoFiles([]);
      setFotoPreviews([]);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload das fotos. Tente novamente.');
    } finally {
      setUploadingFoto(false);
    }
  };

  // Função auxiliar para recarregar pastas de fotos do Supabase
  const reloadPastasFotos = async () => {
    if (!team) return;
    const { data, error } = await supabase
      .from('photo_folders')
      .select('*')
      .eq('team_id', team.id)
      .order('created_at', { ascending: true });
    if (!error && data) {
      setPastasFotos(data);
    }
  };

  const handleAddPastaFotos = async () => {
    if (!team || !novaPastaFotos.trim()) return;

    if (editingPastaFotos) {
      // Atualizar pasta existente
      const { error } = await supabase
        .from('photo_folders')
        .update({ name: novaPastaFotos.trim() })
        .eq('id', editingPastaFotos.id);

      if (error) {
        console.error('Erro ao atualizar pasta:', error);
        alert('Erro ao atualizar pasta. Tente novamente.');
        return;
      }
    } else {
      // Criar nova pasta
      const { error } = await supabase
        .from('photo_folders')
        .insert({
          team_id: team.id,
          name: novaPastaFotos.trim()
        });

      if (error) {
        console.error('Erro ao criar pasta:', error);
        alert('Erro ao criar pasta. Tente novamente.');
        return;
      }
    }

    await reloadPastasFotos();
    setShowAddPastaFotosModal(false);
    setEditingPastaFotos(null);
    setNovaPastaFotos('');
  };

  const handleEditPastaFotos = (pasta: PhotoFolder) => {
    setEditingPastaFotos(pasta);
    setNovaPastaFotos(pasta.name);
    setShowAddPastaFotosModal(true);
  };

  const handleRemovePastaFotos = async (pastaId: string) => {
    if (confirm('Excluir esta pasta? As fotos dentro dela serão movidas para a raiz.')) {
      // Mover fotos para a raiz (folder_id = null)
      await supabase
        .from('team_photos')
        .update({ folder_id: null })
        .eq('folder_id', pastaId);

      // Excluir pasta
      const { error } = await supabase
        .from('photo_folders')
        .delete()
        .eq('id', pastaId);

      if (error) {
        console.error('Erro ao excluir pasta:', error);
        alert('Erro ao excluir pasta. Tente novamente.');
        return;
      }

      await reloadPastasFotos();
      await reloadFotos();
      if (pastaFotosAtual === pastaId) setPastaFotosAtual(null);
    }
  };

  // Funções para gerenciar pastas de vídeos
  const handleAddPastaVideos = async () => {
    if (!team || !novaPastaVideos.trim()) return;

    if (editingPastaVideos) {
      const { error } = await supabase
        .from('video_folders')
        .update({ nome: novaPastaVideos.trim() })
        .eq('id', editingPastaVideos.id);

      if (error) {
        console.error('Erro ao editar pasta:', error);
        alert('Erro ao editar pasta. Tente novamente.');
        return;
      }
    } else {
      const { error } = await supabase
        .from('video_folders')
        .insert({
          team_id: team.id,
          nome: novaPastaVideos.trim()
        });

      if (error) {
        console.error('Erro ao criar pasta:', error);
        alert('Erro ao criar pasta. Tente novamente.');
        return;
      }
    }

    await reloadPastasVideos();
    setShowAddPastaVideosModal(false);
    setEditingPastaVideos(null);
    setNovaPastaVideos('');
  };

  const handleEditPastaVideos = (pasta: VideoFolder) => {
    setEditingPastaVideos(pasta);
    setNovaPastaVideos(pasta.nome);
    setShowAddPastaVideosModal(true);
  };

  const handleRemovePastaVideos = async (folderId: string) => {
    if (confirm('Excluir esta pasta? Os vídeos dentro dela serão movidos para a raiz.')) {
      // Mover vídeos para a raiz
      await supabase
        .from('video_tutorials')
        .update({ folder_id: null })
        .eq('folder_id', folderId);

      // Excluir pasta
      const { error } = await supabase
        .from('video_folders')
        .delete()
        .eq('id', folderId);

      if (error) {
        console.error('Erro ao excluir pasta:', error);
        alert('Erro ao excluir pasta. Tente novamente.');
        return;
      }

      await reloadPastasVideos();
      await reloadVideos();
      if (pastaVideosAtual === folderId) setPastaVideosAtual(null);
    }
  };

  // Fotos filtradas pela pasta atual
  const fotosFiltradas = fotos.filter(f => 
    pastaFotosAtual ? f.folder_id === pastaFotosAtual : !f.folder_id
  );

  const handleRemoveFoto = async (id: string) => {
    // Buscar a foto para pegar a URL e excluir do Storage
    const foto = fotos.find(f => f.id === id);
    if (foto) {
      // Extrair o path do arquivo da URL
      const urlParts = foto.url.split('/team-photos/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('team-photos').remove([filePath]);
      }
    }

    // Excluir do banco
    const { error } = await supabase
      .from('team_photos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir foto:', error);
      alert('Erro ao excluir foto. Tente novamente.');
      return;
    }

    await reloadFotos();
    setShowFotoModal(false);
  };

  const handleViewFoto = (foto: TeamPhoto) => {
    setSelectedFoto(foto);
    setShowFotoModal(true);
  };

  const handleAddVideo = async () => {
    if (!team || !videoFormData.url_embed) return;

    setSavingVideo(true);
    // Converter URL para formato embed
    const embedUrl = convertToEmbedUrl(videoFormData.url_embed);
    
    const { error } = await supabase
      .from('video_tutorials')
      .insert({
        team_id: team.id,
        titulo: videoFormData.titulo || 'Sem título',
        descricao: videoFormData.descricao || null,
        url_embed: embedUrl,
        categoria: videoFormData.categoria || 'Tática',
        folder_id: pastaVideosAtual || null
      });

    if (error) {
      console.error('Erro ao adicionar vídeo:', error);
      alert('Erro ao adicionar vídeo: ' + error.message);
    } else {
      await reloadVideos();
      resetVideoForm();
    }
    setSavingVideo(false);
  };

  const handleEditVideo = async () => {
    if (!editingVideo || !videoFormData.url_embed) return;

    setSavingVideo(true);
    // Converter URL para formato embed
    const embedUrl = convertToEmbedUrl(videoFormData.url_embed);
    
    const { error } = await supabase
      .from('video_tutorials')
      .update({
        titulo: videoFormData.titulo || 'Sem título',
        descricao: videoFormData.descricao || null,
        url_embed: embedUrl,
        categoria: videoFormData.categoria || 'Tática'
      })
      .eq('id', editingVideo.id);

    if (error) {
      console.error('Erro ao editar vídeo:', error);
      alert('Erro ao editar vídeo: ' + error.message);
    } else {
      await reloadVideos();
      resetVideoForm();
    }
    setSavingVideo(false);
  };

  const handleRemoveVideo = async (id: string) => {
    const { error } = await supabase
      .from('video_tutorials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao remover vídeo:', error);
      alert('Erro ao remover vídeo. Tente novamente.');
      return;
    }

    await reloadVideos();
    setShowVideoModal(false);
  };

  const openEditVideoModal = (video: VideoTutorial) => {
    setEditingVideo(video);
    setVideoFormData({
      titulo: video.titulo || '',
      descricao: video.descricao || '',
      url_embed: video.url_embed,
      categoria: video.categoria || ''
    });
    setShowAddVideoModal(true);
  };

  const resetVideoForm = () => {
    setVideoFormData({
      titulo: '',
      descricao: '',
      url_embed: '',
      categoria: ''
    });
    setEditingVideo(null);
    setShowAddVideoModal(false);
  };

  // Vídeos filtrados pela pasta atual
  const videosFiltrados = videos.filter(v => 
    pastaVideosAtual ? v.folder_id === pastaVideosAtual : !v.folder_id
  );

  const openVideoModal = (video: VideoTutorial) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  // Filtrar vídeos por busca e categoria
  const filteredVideos = videosFiltrados.filter(video => {
    const titulo = video.titulo || '';
    const descricao = video.descricao || '';
    const matchesSearch = titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !filterCategoria || video.categoria === filterCategoria;
    return matchesSearch && matchesCategoria;
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D]">
        <Navigation />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
        </div>
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

  // Usar campos do Supabase (snake_case)
  const wins = team.wins || 0;
  const draws = team.draws || 0;
  const losses = team.losses || 0;
  const goalsFor = team.goals_for || 0;
  const goalsAgainst = team.goals_against || 0;
  const totalMatches = wins + draws + losses;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const goalDifference = goalsFor - goalsAgainst;

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
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6 sm:p-8 mb-8 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4 sm:gap-6 flex-1">
              {/* Logo do Time */}
              {(() => {
                const logo = teamData?.logo || team.logo;
                const isImageUrl = logo && (logo.startsWith('data:') || logo.startsWith('http'));
                
                if (isImageUrl) {
                  return (
                    <div className="w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0 rounded-2xl overflow-hidden border-4 border-[#FF6B00]/30 shadow-[0_0_20px_rgba(255,107,0,0.2)]">
                      <img 
                        src={logo} 
                        alt="Logo do time" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                }
                return <div className="text-5xl sm:text-7xl flex-shrink-0">{logo || '⚽'}</div>;
              })()}
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {teamData?.name || team.name}
                </h1>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {(teamData?.category || team.category) && (
                    <span className="bg-[#FF6B00]/20 text-[#FF6B00] text-xs px-2 sm:px-3 py-1 rounded-full font-medium">
                      {teamData?.category || team.category}
                    </span>
                  )}
                  <span className={`text-xs px-2 sm:px-3 py-1 rounded-full font-medium ${
                    (teamData?.availableForMatch !== undefined ? teamData.availableForMatch : team.available_for_match !== false)
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {(teamData?.availableForMatch !== undefined ? teamData.availableForMatch : team.available_for_match !== false) ? 'Disponível' : 'Indisponível'}
                  </span>
                </div>
                <p className="text-white/60 text-sm sm:text-lg line-clamp-2">{teamData?.description || team.description}</p>
                <div className="flex flex-wrap gap-2 sm:gap-4 mt-2">
                  {(teamData?.president || team.president) && (
                    <p className="text-[#FF6B00] text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                      Presidente - {teamData?.president || team.president}
                    </p>
                  )}
                  {(teamData?.phone || team.phone) && (
                    <p className="text-white/60 text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                      📞 {teamData?.phone || team.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {isOwnerMode && (
              <Link href={`/times/${team.id}/editar`} className="absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold w-10 h-10 sm:w-auto sm:h-auto sm:py-3 sm:px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] flex items-center justify-center sm:gap-2">
                <Edit className="w-5 h-5" />
                <span className="hidden sm:inline">Editar Time</span>
              </Link>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FF6B00]/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-[#FF6B00] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{customPlayers.length}</div>
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
        <div className="flex gap-1 sm:gap-2 mb-8 border-b border-white/10 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveTab('resumo')}
            className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
              activeTab === 'resumo'
                ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Resumo
          </button>
          <button
            onClick={() => setActiveTab('elenco')}
            className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
              activeTab === 'elenco'
                ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Elenco
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
              activeTab === 'historico'
                ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Histórico
          </button>
          <button
            onClick={() => setActiveTab('taticas')}
            className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
              activeTab === 'taticas'
                ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Táticas
          </button>
          <button
            onClick={() => setActiveTab('fotos')}
            className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
              activeTab === 'fotos'
                ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Fotos
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
              activeTab === 'videos'
                ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Vídeos
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
                      <span className="text-[#FF6B00] font-bold text-xl">{wins}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] h-full rounded-full"
                        style={{ width: `${totalMatches > 0 ? (wins / totalMatches) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-white/60" />
                        <span className="text-white font-medium">Empates</span>
                      </div>
                      <span className="text-white font-bold text-xl">{draws}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-white/40 h-full rounded-full"
                        style={{ width: `${totalMatches > 0 ? (draws / totalMatches) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-red-500" />
                        <span className="text-white font-medium">Derrotas</span>
                      </div>
                      <span className="text-white/60 font-bold text-xl">{losses}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-red-500/40 h-full rounded-full"
                        style={{ width: `${totalMatches > 0 ? (losses / totalMatches) * 100 : 0}%` }}
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
                      {goalsFor}
                    </div>
                    <div className="text-white/60">Gols Marcados</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white/60 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {goalsAgainst}
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
                      {totalMatches > 0 ? (goalsFor / totalMatches).toFixed(1) : '0.0'}
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
                    {(() => {
                      const captain = customPlayers.find(p => p.is_captain);
                      const captainPhoto = captain?.foto;
                      return captainPhoto ? (
                        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#FF6B00]/30 shadow-[0_0_20px_rgba(255,107,0,0.2)]">
                          <img 
                            src={captainPhoto} 
                            alt="Capitão do time"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-white/5 border-4 border-dashed border-white/20 flex items-center justify-center">
                          <Camera className="w-10 h-10 text-white/30" />
                        </div>
                      );
                    })()}
                    
                    {/* Badge de capitão */}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#FF6B00] rounded-full flex items-center justify-center border-2 border-[#0D0D0D]">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  {/* Nome do Capitão */}
                  <div className="mt-4 text-center">
                    <div className="text-white font-bold text-lg">
                      {mounted ? (customPlayers.find(p => p.is_captain)?.name || 'Selecione o Capitão') : 'Capitão'}
                    </div>
                    <div className="text-[#FF6B00] text-sm font-medium">
                      {mounted ? (customPlayers.find(p => p.is_captain)?.position || 'Capitão') : 'Capitão'}
                    </div>
                  </div>
                </div>

                {/* Instrução quando não há capitão */}
                {!customPlayers.find(p => p.is_captain) && isOwnerMode && (
                  <p className="text-white/40 text-xs text-center mt-2">
                    Defina um jogador como capitão no elenco
                  </p>
                )}
              </div>

              {/* Top Players */}
              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-center text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Artilheiros
                </h3>
                
                <div className="space-y-3">
                  {customPlayers.length > 0 ? (
                    [...customPlayers]
                      .sort((a: Player, b: Player) => (b.goals || 0) - (a.goals || 0))
                      .slice(0, 3)
                      .map((player: Player, index: number) => (
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
                          <div className="text-[#FF6B00] font-bold">{player.goals || 0}</div>
                        </div>
                      ))
                  ) : (
                    <p className="text-white/40 text-sm text-center py-4">Nenhum jogador cadastrado</p>
                  )}
                </div>
                <i><p className="text-white/40 text-xs text-left mt-3">* Em partidas oficiais</p></i>
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

              {/* Botão Filtrar no Mobile */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden flex items-center justify-center gap-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-4 transition-all hover:border-[#FF6B00]"
              >
                <Filter className="w-5 h-5" />
                Filtrar
                {(playerSearchTerm || filterPosition || filterAvailability !== 'all') && (
                  <span className="bg-[#FF6B00] text-white text-xs px-2 py-0.5 rounded-full">
                    {[playerSearchTerm, filterPosition, filterAvailability !== 'all'].filter(Boolean).length}
                  </span>
                )}
              </button>

              {/* Filtros - visíveis sempre no desktop, toggle no mobile */}
              <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row gap-4 mb-6`}>
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
                            <div className="text-[#FF6B00] font-bold">{player.goals}</div>
                          </div>
                          <div>
                            <div className="text-white/60">Assist.</div>
                            <div className="text-white font-bold">{player.assists}</div>
                          </div>
                          <div>
                            <div className="text-white/60">Jogos</div>
                            <div className="text-white font-bold">{player.matches}</div>
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

        {/* Histórico de Partidas */}
        {activeTab === 'historico' && (
          <HistoricoPartidas 
            teamId={team.id} 
            players={customPlayers} 
          />
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Galeria de Fotos – {team.name}
                </h2>
                {pastaFotosAtual && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => setPastaFotosAtual(null)}
                      className="text-[#FF6B00] hover:text-[#FF6B00]/80 text-sm flex items-center gap-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar
                    </button>
                    <span className="text-white/60">|</span>
                    <span className="text-white/80 font-medium">
                      📁 {pastasFotos.find((p) => p.id === pastaFotosAtual)?.name}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddPastaFotosModal(true)}
                  className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-xl transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nova Pasta
                </button>
                <button
                  onClick={() => setShowAddFotoModal(true)}
                  className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Adicionar Foto
                </button>
              </div>
            </div>

            {/* Pastas (só mostra na raiz) */}
            {!pastaFotosAtual && pastasFotos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white/60 text-sm font-medium mb-3">Pastas</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {pastasFotos.map((pasta) => {
                    const fotosNaPasta = fotos.filter(f => f.folder_id === pasta.id).length;
                    return (
                      <div
                        key={pasta.id}
                        className="bg-white/5 hover:bg-white/10 rounded-xl p-4 cursor-pointer transition-all group relative"
                        onClick={() => setPastaFotosAtual(pasta.id)}
                      >
                        <div className="text-4xl mb-2">📁</div>
                        <h4 className="text-white font-medium truncate">{pasta.name}</h4>
                        <p className="text-white/40 text-sm">{fotosNaPasta} foto{fotosNaPasta !== 1 ? 's' : ''}</p>
                        
                        {/* Botões de ação */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 transition-all">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPastaFotos(pasta);
                            }}
                            className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-lg transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePastaFotos(pasta.id);
                            }}
                            className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-1.5 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fotos */}
            {fotosFiltradas.length === 0 && (!pastaFotosAtual ? pastasFotos.length === 0 : true) ? (
              <div className="text-center py-16">
                <ImageIcon className="w-20 h-20 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {pastaFotosAtual ? 'Pasta vazia' : 'Nenhuma foto cadastrada'}
                </h3>
                <p className="text-white/60 mb-6">
                  {pastaFotosAtual ? 'Adicione fotos a esta pasta!' : 'Comece adicionando a primeira foto do seu time!'}
                </p>
                <button
                  onClick={() => setShowAddFotoModal(true)}
                  className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)]"
                >
                  Adicionar Foto
                </button>
              </div>
            ) : fotosFiltradas.length > 0 && (
              <>
                {!pastaFotosAtual && pastasFotos.length > 0 && (
                  <h3 className="text-white/60 text-sm font-medium mb-3">Fotos sem pasta</h3>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fotosFiltradas.map((foto) => (
                    <div key={foto.id} className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all group">
                      <div className="aspect-video bg-white/10 relative overflow-hidden">
                        <img 
                          src={foto.url} 
                          alt={foto.title || 'Foto'}
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
                        {foto.title && <h3 className="text-white font-bold mb-1">{foto.title}</h3>}
                        <p className="text-white/60 text-sm mb-2">
                          {foto.photo_date ? new Date(foto.photo_date).toLocaleDateString('pt-BR') : new Date(foto.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        {foto.description && (
                          <p className="text-white/40 text-sm line-clamp-2">{foto.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Vídeos Tutoriais – {team.name}
                </h2>
                {pastaVideosAtual && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => setPastaVideosAtual(null)}
                      className="text-[#FF6B00] hover:text-[#FF6B00]/80 text-sm flex items-center gap-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar
                    </button>
                    <span className="text-white/60">|</span>
                    <span className="text-white/80 font-medium">
                      📁 {pastasVideos.find((p: VideoFolder) => p.id === pastaVideosAtual)?.nome}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddPastaVideosModal(true)}
                  className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-xl transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nova Pasta
                </button>
                <button
                  onClick={() => setShowAddVideoModal(true)}
                  className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar Vídeo
                </button>
              </div>
            </div>

            {/* Busca e Filtros */}
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

            {/* Pastas (só mostra na raiz) */}
            {!pastaVideosAtual && pastasVideos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white/60 text-sm font-medium mb-3">Pastas</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {pastasVideos.map((pasta: VideoFolder) => {
                    const videosNaPasta = videos.filter(v => v.folder_id === pasta.id).length;
                    return (
                      <div
                        key={pasta.id}
                        className="bg-white/5 hover:bg-white/10 rounded-xl p-4 cursor-pointer transition-all group relative"
                        onClick={() => setPastaVideosAtual(pasta.id)}
                      >
                        <div className="text-4xl mb-2">📁</div>
                        <h4 className="text-white font-medium truncate">{pasta.nome}</h4>
                        <p className="text-white/40 text-sm">{videosNaPasta} vídeo{videosNaPasta !== 1 ? 's' : ''}</p>
                        
                        {/* Botões de ação */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 transition-all">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPastaVideos(pasta);
                            }}
                            className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-lg transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePastaVideos(pasta.id);
                            }}
                            className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-1.5 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Videos Grid */}
            {filteredVideos.length === 0 && (!pastaVideosAtual ? pastasVideos.length === 0 : true) ? (
              <div className="text-center py-16">
                <Play className="w-20 h-20 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {pastaVideosAtual ? 'Pasta vazia' : (searchTerm ? 'Nenhum vídeo encontrado' : 'Nenhum vídeo cadastrado')}
                </h3>
                <p className="text-white/60 mb-6">
                  {pastaVideosAtual 
                    ? 'Adicione vídeos a esta pasta!'
                    : (searchTerm 
                        ? 'Tente ajustar os filtros de busca' 
                        : 'Comece adicionando vídeos tutoriais para este time')}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowAddVideoModal(true)}
                    className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)]"
                  >
                    Adicionar Vídeo
                  </button>
                )}
              </div>
            ) : filteredVideos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => {
                  const thumbnail = getYouTubeThumbnail(video.url_embed);
                  return (
                  <div key={video.id} className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all group">
                    <div className="aspect-video bg-white/10 relative overflow-hidden cursor-pointer" onClick={() => openVideoModal(video)}>
                      {thumbnail ? (
                        <img 
                          src={thumbnail} 
                          alt={video.titulo || 'Thumbnail do vídeo'}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all">
                        <div className="w-16 h-16 bg-[#FF6B00] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-white ml-1" fill="white" />
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      {video.categoria && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-[#FF6B00]/20 text-[#FF6B00] px-3 py-1 rounded-lg text-xs font-bold">
                            {video.categoria}
                          </span>
                        </div>
                      )}
                      <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">
                        {video.titulo || 'Vídeo sem título'}
                      </h3>
                      {video.descricao && (
                        <p className="text-white/60 text-sm mb-4 line-clamp-2">
                          {video.descricao}
                        </p>
                      )}

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
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Criar/Editar Pasta de Fotos */}
      {showAddPastaFotosModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {editingPastaFotos ? 'Editar Pasta' : 'Nova Pasta'}
              </h3>
              <button
                onClick={() => {
                  setShowAddPastaFotosModal(false);
                  setEditingPastaFotos(null);
                  setNovaPastaFotos('');
                }}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2 font-medium">Nome da Pasta *</label>
                <input
                  type="text"
                  value={novaPastaFotos}
                  onChange={(e) => setNovaPastaFotos(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                  placeholder="Ex: Bola de domingo"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddPastaFotosModal(false);
                  setEditingPastaFotos(null);
                  setNovaPastaFotos('');
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddPastaFotos}
                disabled={!novaPastaFotos.trim()}
                className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingPastaFotos ? 'Salvar' : 'Criar Pasta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar/Editar Pasta de Vídeos */}
      {showAddPastaVideosModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {editingPastaVideos ? 'Editar Pasta' : 'Nova Pasta'}
              </h3>
              <button
                onClick={() => {
                  setShowAddPastaVideosModal(false);
                  setEditingPastaVideos(null);
                  setNovaPastaVideos('');
                }}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2 font-medium">Nome da Pasta *</label>
                <input
                  type="text"
                  value={novaPastaVideos}
                  onChange={(e) => setNovaPastaVideos(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                  placeholder="Ex: Treinos táticos"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddPastaVideosModal(false);
                  setEditingPastaVideos(null);
                  setNovaPastaVideos('');
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddPastaVideos}
                disabled={!novaPastaVideos.trim()}
                className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingPastaVideos ? 'Salvar' : 'Criar Pasta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar Foto */}
      {showAddFotoModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Adicionar Foto
                {pastaFotosAtual && (
                  <span className="text-base font-normal text-white/60 ml-2">
                    em 📁 {pastasFotos.find((p) => p.id === pastaFotosAtual)?.name}
                  </span>
                )}
              </h3>
              <button
                onClick={() => setShowAddFotoModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Info: Data automática */}
              <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/20 rounded-lg p-3 text-sm text-white/80">
                📅 A data será registrada automaticamente como a data de hoje
              </div>

              {/* Upload de Imagens (múltiplas) */}
              <div>
                <label className="block text-white/80 mb-2 font-medium">
                  Imagens * <span className="text-white/40 font-normal">(você pode selecionar várias)</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="foto-upload"
                  />
                  <label
                    htmlFor="foto-upload"
                    className="flex flex-col items-center justify-center w-full h-32 bg-white/5 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/10 hover:border-[#FF6B00]/50 transition-all"
                  >
                    <Upload className="w-8 h-8 text-white/40 mb-2" />
                    <span className="text-white/60 text-sm">Clique ou arraste imagens aqui</span>
                    <span className="text-white/40 text-xs mt-1">JPG, PNG, GIF até 10MB cada</span>
                  </label>
                </div>

                {/* Preview das imagens selecionadas */}
                {fotoPreviews.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-sm">{fotoFiles.length} foto{fotoFiles.length !== 1 ? 's' : ''} selecionada{fotoFiles.length !== 1 ? 's' : ''}</span>
                      <button
                        onClick={() => {
                          setFotoFiles([]);
                          setFotoPreviews([]);
                        }}
                        className="text-red-400 text-xs hover:text-red-300 transition-colors"
                      >
                        Limpar todas
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {fotoPreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square group">
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleRemoveFileFromSelection(index)}
                            className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                            {(fotoFiles[index]?.size / 1024 / 1024).toFixed(1)}MB
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Título e descrição só aparecem se for uma única foto */}
              {fotoFiles.length <= 1 && (
                <>
                  <div>
                    <label className="block text-white/80 mb-2 font-medium">Título (opcional)</label>
                    <input
                      type="text"
                      value={newFoto.titulo}
                      onChange={(e) => setNewFoto({ ...newFoto, titulo: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                      placeholder="Ex: Treino de Finalizações"
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
                </>
              )}

              {fotoFiles.length > 1 && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white/60">
                  💡 Ao adicionar múltiplas fotos, título e descrição não são aplicados. Você pode editar cada foto depois.
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddFotoModal(false);
                  setFotoFiles([]);
                  setFotoPreviews([]);
                  setNewFoto({ titulo: '', descricao: '' });
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddFoto}
                disabled={fotoFiles.length === 0 || uploadingFoto}
                className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploadingFoto ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Salvar'
                )}
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
                {selectedFoto.title || 'Foto'}
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
                alt={selectedFoto.title || 'Foto'}
                className="w-full rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop';
                }}
              />
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-white/60">
                <Calendar className="w-5 h-5" />
                <span>{new Date(selectedFoto.photo_date || selectedFoto.created_at).toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}</span>
              </div>
              {selectedFoto.description && (
                <p className="text-white/80">{selectedFoto.description}</p>
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
                {editingVideo ? 'Editar Vídeo' : 'Adicionar Vídeo'}
                {pastaVideosAtual && !editingVideo && (
                  <span className="text-base font-normal text-white/60 ml-2">
                    em 📁 {pastasVideos.find((p: VideoFolder) => p.id === pastaVideosAtual)?.nome}
                  </span>
                )}
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
                <label className="block text-white/80 mb-2 font-medium">URL do Vídeo (YouTube) *</label>
                <input
                  type="url"
                  value={videoFormData.url_embed}
                  onChange={(e) => setVideoFormData({ ...videoFormData, url_embed: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                  placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                />
                <p className="text-white/40 text-sm mt-2">
                  Cole qualquer link do YouTube (da barra de endereço, compartilhamento ou embed)
                </p>
                
                {/* Pré-visualização do vídeo */}
                {videoFormData.url_embed && getYouTubeVideoId(videoFormData.url_embed) && (
                  <div className="mt-4">
                    <p className="text-white/60 text-sm mb-2">Pré-visualização:</p>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={convertToEmbedUrl(videoFormData.url_embed)}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white/80 mb-2 font-medium">Título (opcional)</label>
                <input
                  type="text"
                  value={videoFormData.titulo}
                  onChange={(e) => setVideoFormData({ ...videoFormData, titulo: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                  placeholder="Ex: Técnicas de Finalização"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 font-medium">Categoria (opcional)</label>
                <select
                  value={videoFormData.categoria}
                  onChange={(e) => setVideoFormData({ ...videoFormData, categoria: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/80 mb-2 font-medium">Descrição (opcional)</label>
                <textarea
                  value={videoFormData.descricao}
                  onChange={(e) => setVideoFormData({ ...videoFormData, descricao: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none resize-none"
                  rows={3}
                  placeholder="Descreva o conteúdo do vídeo..."
                />
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
                disabled={!videoFormData.url_embed}
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
                  {selectedVideo.titulo || 'Vídeo'}
                </h3>
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
                src={selectedVideo.url_embed}
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
              {/* Foto do Jogador */}
              <div>
                <label className="block text-white/80 mb-2 font-medium">Foto do Jogador</label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {newPlayerPhotoPreview ? (
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#FF6B00]/30">
                        <img 
                          src={newPlayerPhotoPreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      ref={newPlayerPhotoInputRef}
                      onChange={handleNewPlayerPhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => newPlayerPhotoInputRef.current?.click()}
                      className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all text-sm"
                    >
                      {newPlayerPhotoPreview ? 'Alterar Foto' : 'Adicionar Foto'}
                    </button>
                    {newPlayerPhotoPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewPlayerPhoto(null);
                          setNewPlayerPhotoPreview('');
                        }}
                        className="ml-2 text-red-400 hover:text-red-300 text-sm"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>

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
                  <label className="block text-white/80 mb-2 font-medium">Número da Camisa</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 mb-2 font-medium">Posição Principal *</label>
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

                <div>
                  <label className="block text-white/80 mb-2 font-medium">Posição Secundária</label>
                  <select
                    value={newPlayer.secondary_position}
                    onChange={(e) => setNewPlayer({ ...newPlayer, secondary_position: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                  >
                    <option value="">Nenhuma</option>
                    {positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 mb-2 font-medium">Pé Predominante</label>
                  <select
                    value={newPlayer.preferred_foot}
                    onChange={(e) => setNewPlayer({ ...newPlayer, preferred_foot: e.target.value as 'Direito' | 'Esquerdo' | 'Ambos' })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                  >
                    {preferredFootOptions.map(foot => (
                      <option key={foot} value={foot}>{foot}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 mb-2 font-medium">Telefone</label>
                  <input
                    type="tel"
                    value={newPlayer.phone}
                    onChange={handleNewPlayerPhoneChange}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>
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

              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                <input
                  type="checkbox"
                  id="is_guest"
                  checked={newPlayer.is_guest}
                  onChange={(e) => setNewPlayer({ ...newPlayer, is_guest: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-[#FF6B00] focus:ring-[#FF6B00]"
                />
                <label htmlFor="is_guest" className="text-white cursor-pointer">
                  Jogador convidado (não faz parte do elenco fixo)
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
                disabled={!newPlayer.name}
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
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Upload para o Supabase Storage
                            const photoUrl = await uploadPlayerPhoto(file, selectedPlayer.id);
                            
                            if (photoUrl) {
                              setEditPlayerData({ ...editPlayerData, foto: photoUrl });
                              
                              // Atualizar no Supabase
                              await supabase
                                .from('players')
                                .update({ foto: photoUrl })
                                .eq('id', selectedPlayer.id);
                              
                              const updatedPlayers = customPlayers.map(p => 
                                p.id === selectedPlayer.id ? { ...p, foto: photoUrl } as Player : p
                              );
                              setCustomPlayers(updatedPlayers);
                              setSelectedPlayer({ ...selectedPlayer, foto: photoUrl });
                            } else {
                              alert('Erro ao fazer upload da foto. Tente novamente.');
                            }
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
                      value={editPlayerData.secondary_position || ''}
                      onChange={(e) => setEditPlayerData({ ...editPlayerData, secondary_position: e.target.value })}
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
                      value={editPlayerData.preferred_foot || ''}
                      onChange={(e) => setEditPlayerData({ ...editPlayerData, preferred_foot: e.target.value as 'Direito' | 'Esquerdo' | 'Ambos' })}
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
                      checked={editPlayerData.is_captain || false}
                      onChange={(e) => setEditPlayerData({ ...editPlayerData, is_captain: e.target.checked })}
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
                      checked={editPlayerData.is_free_kick_taker || false}
                      onChange={(e) => setEditPlayerData({ ...editPlayerData, is_free_kick_taker: e.target.checked })}
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
                      checked={editPlayerData.is_guest || false}
                      onChange={(e) => setEditPlayerData({ ...editPlayerData, is_guest: e.target.checked })}
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
                    <div className="text-3xl font-bold text-[#FF6B00]">{selectedPlayer.goals}</div>
                    <div className="text-white/60 text-sm">Gols</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-white">{selectedPlayer.assists}</div>
                    <div className="text-white/60 text-sm">Assistências</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-white">{selectedPlayer.matches}</div>
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
                      <span className="text-white">{selectedPlayer.preferred_foot || 'Não informado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Posição Secundária:</span>
                      <span className="text-white">{selectedPlayer.secondary_position || 'Nenhuma'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Telefone:</span>
                      <span className="text-white">{selectedPlayer.phone || 'Não informado'}</span>
                    </div>
                  </div>
                </div>

                {/* Funções do Jogador */}
                <div className="flex flex-wrap gap-3">
                  {selectedPlayer.is_captain && (
                    <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-500 px-4 py-2 rounded-full text-sm font-medium">
                      <Crown className="w-4 h-4" />
                      Capitão
                    </div>
                  )}
                  {selectedPlayer.is_free_kick_taker && (
                    <div className="flex items-center gap-2 bg-[#FF6B00]/20 text-[#FF6B00] px-4 py-2 rounded-full text-sm font-medium">
                      <Target className="w-4 h-4" />
                      Batedor de Falta
                    </div>
                  )}
                  {selectedPlayer.is_guest && (
                    <div className="flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium">
                      <UserPlus className="w-4 h-4" />
                      Convidado
                    </div>
                  )}
                  {!selectedPlayer.is_captain && !selectedPlayer.is_free_kick_taker && !selectedPlayer.is_guest && (
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
