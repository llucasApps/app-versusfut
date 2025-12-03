'use client';

import Navigation from '@/components/Navigation';
import { myTeams } from '@/lib/mock-data';
import { ArrowLeft, Save, User, Phone, Upload, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function EditarTimePage() {
  const params = useParams();
  const router = useRouter();
  const team = myTeams.find(t => t.id === params.id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    description: '',
    president: '',
    phone: '',
    category: '' as '' | 'Juvenil' | 'Adulto' | 'Veterano 35+' | 'Master 45+',
    availableForMatch: true,
  });

  const [saved, setSaved] = useState(false);

  const categoryOptions = ['Juvenil', 'Adulto', 'Veterano 35+', 'Master 45+'] as const;

  // Função para upload de logo
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData({ ...formData, logo: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  // Carregar dados do time
  useEffect(() => {
    if (team) {
      // Verificar se há dados salvos no localStorage
      const savedTeamData = localStorage.getItem(`team_${team.id}`);
      if (savedTeamData) {
        const parsed = JSON.parse(savedTeamData);
        setFormData({
          name: parsed.name || team.name,
          logo: parsed.logo || team.logo,
          description: parsed.description || team.description,
          president: parsed.president || '',
          phone: parsed.phone || '',
          category: parsed.category || '',
          availableForMatch: parsed.availableForMatch !== undefined ? parsed.availableForMatch : true,
        });
      } else {
        setFormData({
          name: team.name,
          logo: team.logo,
          description: team.description,
          president: team.president || '',
          phone: team.phone || '',
          category: team.category || '',
          availableForMatch: team.availableForMatch !== undefined ? team.availableForMatch : true,
        });
      }
    }
  }, [team]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (team) {
      // Salvar no localStorage
      localStorage.setItem(`team_${team.id}`, JSON.stringify(formData));
      setSaved(true);
      
      // Redirecionar após salvar
      setTimeout(() => {
        router.push(`/times/${team.id}`);
      }, 1000);
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
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Editar Time
          </h1>
          <p className="text-white/60">Atualize as informações do seu time</p>
        </div>

        {/* Mensagem de sucesso */}
        {saved && (
          <div className="bg-green-500/20 border border-green-500/40 text-green-400 px-6 py-4 rounded-xl mb-6 flex items-center gap-3">
            <Save className="w-5 h-5" />
            Alterações salvas com sucesso! Redirecionando...
          </div>
        )}

        {/* Form */}
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo Upload */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
              <label className="block text-white font-bold mb-4">Logo/Escudo do Time</label>
              <div className="flex items-center gap-6">
                {/* Preview do Logo */}
                <div className="relative">
                  {formData.logo && formData.logo.startsWith('data:') ? (
                    <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-[#FF6B00]/30 shadow-[0_0_20px_rgba(255,107,0,0.2)]">
                      <img 
                        src={formData.logo} 
                        alt="Logo do time" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-white/5 border-4 border-dashed border-white/20 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-white/30" />
                    </div>
                  )}
                </div>
                
                {/* Botão de Upload */}
                <div className="flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 text-[#FF6B00] font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    {formData.logo ? 'Alterar Logo' : 'Adicionar Logo'}
                  </button>
                  <p className="text-white/40 text-sm mt-2 text-center">
                    Formatos: JPG, PNG, GIF (máx. 5MB)
                  </p>
                  {formData.logo && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo: '' })}
                      className="w-full mt-2 text-red-400 hover:text-red-300 text-sm transition-all"
                    >
                      Remover logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Team Name */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
              <label htmlFor="name" className="block text-white font-bold mb-3">
                Nome do Time *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Real Bairro FC"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6B00]/40 transition-all"
              />
            </div>

            {/* Description */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
              <label htmlFor="description" className="block text-white font-bold mb-3">
                Descrição
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Conte um pouco sobre o time..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6B00]/40 transition-all resize-none"
              />
            </div>

            {/* President */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
              <label htmlFor="president" className="block text-white font-bold mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-[#FF6B00]" />
                Presidente do Time
              </label>
              <input
                type="text"
                id="president"
                value={formData.president}
                onChange={(e) => setFormData({ ...formData, president: e.target.value })}
                placeholder="Ex: Rafael Junior"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6B00]/40 transition-all"
              />
            </div>

            {/* Phone */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
              <label htmlFor="phone" className="block text-white font-bold mb-3 flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#FF6B00]" />
                Contato do Time
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6B00]/40 transition-all"
              />
            </div>

            {/* Category */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
              <label htmlFor="category" className="block text-white font-bold mb-3">
                Categoria
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as typeof formData.category })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FF6B00]/40 transition-all"
              >
                <option value="" className="bg-[#1A1A1A]">Selecione uma categoria</option>
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat} className="bg-[#1A1A1A]">{cat}</option>
                ))}
              </select>
            </div>

            {/* Availability */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
              <label className="block text-white font-bold mb-4">Disponibilidade para Jogos</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, availableForMatch: true })}
                  className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl transition-all ${
                    formData.availableForMatch
                      ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                      : 'bg-white/5 border-2 border-transparent text-white/60 hover:bg-white/10'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  Disponível
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, availableForMatch: false })}
                  className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl transition-all ${
                    !formData.availableForMatch
                      ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                      : 'bg-white/5 border-2 border-transparent text-white/60 hover:bg-white/10'
                  }`}
                >
                  <XCircle className="w-5 h-5" />
                  Indisponível
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">Preview</h3>
              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  {formData.logo && formData.logo.startsWith('data:') ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden">
                      <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-white/30" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {formData.name || 'Nome do Time'}
                      </h4>
                      {formData.category && (
                        <span className="bg-[#FF6B00]/20 text-[#FF6B00] text-xs px-2 py-1 rounded-full">
                          {formData.category}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        formData.availableForMatch 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {formData.availableForMatch ? 'Disponível' : 'Indisponível'}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm">
                      {formData.description || 'Descrição do time'}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {formData.president && (
                        <p className="text-[#FF6B00] text-sm flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Presidente - {formData.president}
                        </p>
                      )}
                      {formData.phone && (
                        <p className="text-white/60 text-sm flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {formData.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#FF6B00] mb-1">{team.players.length}</div>
                    <div className="text-white/60 text-xs">Jogadores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#FF6B00] mb-1">{team.stats.wins + team.stats.draws + team.stats.losses}</div>
                    <div className="text-white/60 text-xs">Partidas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#FF6B00] mb-1">{team.stats.wins}</div>
                    <div className="text-white/60 text-xs">Vitórias</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#FF6B00] mb-1">{team.stats.goalsFor}</div>
                    <div className="text-white/60 text-xs">Gols</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Salvar Alterações
              </button>
              
              <Link
                href={`/times/${team.id}`}
                className="bg-white/10 hover:bg-white/20 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
