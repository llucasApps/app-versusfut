'use client';

import Navigation from '@/components/Navigation';
import { Play, Plus, Search, Edit, Trash2, X, Clock, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';

interface VideoTutorial {
  id: string;
  titulo: string;
  descricao: string;
  urlEmbed: string;
  categoria: string;
  duracao: string;
}

const categorias = ['Finalização', 'Tática', 'Preparação Física', 'Passe', 'Defesa', 'Drible'];

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoTutorial[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoTutorial | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    urlEmbed: '',
    categoria: 'Finalização',
    duracao: ''
  });

  // Carregar vídeos do localStorage
  useEffect(() => {
    const storedVideos = localStorage.getItem('videos_tutoriais');
    if (storedVideos) {
      setVideos(JSON.parse(storedVideos));
    } else {
      // Vídeos iniciais de exemplo
      const initialVideos: VideoTutorial[] = [
        {
          id: '1',
          titulo: 'Técnicas de Finalização',
          descricao: 'Aprenda as melhores técnicas para finalizar com precisão e potência.',
          urlEmbed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          categoria: 'Finalização',
          duracao: '12:30'
        },
        {
          id: '2',
          titulo: 'Tática 4-3-3 Ofensiva',
          descricao: 'Entenda como posicionar seu time em uma formação 4-3-3 ofensiva.',
          urlEmbed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          categoria: 'Tática',
          duracao: '15:45'
        },
        {
          id: '3',
          titulo: 'Preparação Física para Futebol',
          descricao: 'Exercícios essenciais para melhorar resistência e velocidade.',
          urlEmbed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          categoria: 'Preparação Física',
          duracao: '20:15'
        }
      ];
      localStorage.setItem('videos_tutoriais', JSON.stringify(initialVideos));
      setVideos(initialVideos);
    }
  }, []);

  // Salvar vídeos no localStorage
  const saveVideos = (updatedVideos: VideoTutorial[]) => {
    localStorage.setItem('videos_tutoriais', JSON.stringify(updatedVideos));
    setVideos(updatedVideos);
  };

  const handleAddVideo = () => {
    if (!formData.titulo || !formData.urlEmbed) return;

    const newVideo: VideoTutorial = {
      id: Date.now().toString(),
      ...formData
    };

    saveVideos([...videos, newVideo]);
    resetForm();
  };

  const handleEditVideo = () => {
    if (!editingVideo || !formData.titulo || !formData.urlEmbed) return;

    const updatedVideos = videos.map(v => 
      v.id === editingVideo.id ? { ...editingVideo, ...formData } : v
    );

    saveVideos(updatedVideos);
    resetForm();
  };

  const handleRemoveVideo = (id: string) => {
    saveVideos(videos.filter(v => v.id !== id));
    setShowVideoModal(false);
  };

  const openEditModal = (video: VideoTutorial) => {
    setEditingVideo(video);
    setFormData({
      titulo: video.titulo,
      descricao: video.descricao,
      urlEmbed: video.urlEmbed,
      categoria: video.categoria,
      duracao: video.duracao
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      urlEmbed: '',
      categoria: 'Finalização',
      duracao: ''
    });
    setEditingVideo(null);
    setShowAddModal(false);
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

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Vídeos Tutoriais
          </h1>
          <p className="text-white/60 text-lg">
            Conteúdo de treinamento para melhorar o desempenho do seu time
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
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

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Adicionar Vídeo
            </button>
          </div>
        </div>

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-16 text-center">
            <Play className="w-20 h-20 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {searchTerm || filterCategoria ? 'Nenhum vídeo encontrado' : 'Nenhum vídeo cadastrado'}
            </h3>
            <p className="text-white/60 mb-6">
              {searchTerm || filterCategoria 
                ? 'Tente ajustar os filtros de busca' 
                : 'Comece adicionando vídeos tutoriais para seu time'}
            </p>
            {!searchTerm && !filterCategoria && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)]"
              >
                Adicionar Primeiro Vídeo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div key={video.id} className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl overflow-hidden hover:border-[#FF6B00]/40 transition-all group">
                <div className="aspect-video bg-white/5 relative overflow-hidden">
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
                      onClick={() => openEditModal(video)}
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
      </main>

      {/* Modal Adicionar/Editar Vídeo */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-[#FF6B00]/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {editingVideo ? 'Editar Vídeo Tutorial' : 'Adicionar Vídeo Tutorial'}
              </h3>
              <button
                onClick={resetForm}
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
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                  placeholder="Ex: Técnicas de Finalização"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 font-medium">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none resize-none"
                  rows={3}
                  placeholder="Descreva o conteúdo do vídeo..."
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 font-medium">URL do Vídeo (YouTube) *</label>
                <input
                  type="url"
                  value={formData.urlEmbed}
                  onChange={(e) => setFormData({ ...formData, urlEmbed: e.target.value })}
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
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
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
                    value={formData.duracao}
                    onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                    placeholder="Ex: 10:30"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={resetForm}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={editingVideo ? handleEditVideo : handleAddVideo}
                disabled={!formData.titulo || !formData.urlEmbed}
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
    </div>
  );
}
