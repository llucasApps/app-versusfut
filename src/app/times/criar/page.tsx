'use client';

import Navigation from '@/components/Navigation';
import { ArrowLeft, Save, User, Phone, Upload, Image as ImageIcon, CheckCircle, XCircle, MapPin, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function CriarTimePage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    logo: '⚽',
    description: '',
    president: '',
    phone: '',
    city: '',
    state: '',
    neighborhood: '',
    category: '' as '' | 'Juvenil' | 'Adulto' | 'Veterano 35+' | 'Master 45+',
    availableForMatch: true,
    teamType: '' as '' | 'Campo' | 'Society' | 'Futsal',
    hasVenue: false,
    venueName: '',
    venueAddress: '',
  });

  // Lista de estados brasileiros
  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // Função para aplicar máscara de telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers.length ? `(${numbers}` : '';
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const categoryOptions = ['Juvenil', 'Adulto', 'Veterano 35+', 'Master 45+'] as const;
  const teamTypeOptions = ['Campo', 'Society', 'Futsal'] as const;

  // Função para upload de logo (preview local)
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB');
        return;
      }
      
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setError('O arquivo deve ser uma imagem');
        return;
      }

      setLogoFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Função para fazer upload da imagem no Supabase Storage
  const uploadLogo = async (teamId: string): Promise<string | null> => {
    if (!logoFile || !user) return null;

    const fileExt = logoFile.name.split('.').pop();
    const fileName = `${user.id}/${teamId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('team-logos')
      .upload(fileName, logoFile, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError);
      return null;
    }

    // Retornar URL pública
    const { data } = supabase.storage
      .from('team-logos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!user) {
      setError('Você precisa estar logado para criar um time');
      return;
    }

    if (!formData.name.trim()) {
      setError('O nome do time é obrigatório');
      return;
    }

    setSaving(true);

    try {
      // Primeiro, criar o time com logo padrão
      const { data: teamData, error: insertError } = await supabase
        .from('teams')
        .insert({
          name: formData.name.trim(),
          owner_id: user.id,
          logo: '⚽', // Será atualizado se houver imagem
          description: formData.description || null,
          president: formData.president || null,
          phone: formData.phone || null,
          city: formData.city || null,
          state: formData.state || null,
          neighborhood: formData.neighborhood || null,
          venue_name: formData.venueName || null,
          venue_address: formData.venueAddress || null,
          category: formData.category || 'Adulto',
          team_type: formData.teamType || 'Society',
          has_venue: formData.hasVenue,
          available_for_match: formData.availableForMatch,
          wins: 0,
          draws: 0,
          losses: 0,
          goals_for: 0,
          goals_against: 0,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao criar time:', insertError);
        if (insertError.code === '42501') {
          setError('Sem permissão para criar time. Verifique as políticas RLS no Supabase.');
        } else if (insertError.code === '23503') {
          setError('Erro: seu perfil não existe na tabela profiles. Crie o perfil primeiro.');
        } else {
          setError(`Erro ao criar time: ${insertError.message}`);
        }
        setSaving(false);
        return;
      }

      // Se houver imagem selecionada, fazer upload e atualizar o time
      if (logoFile && teamData) {
        const logoUrl = await uploadLogo(teamData.id);
        
        if (logoUrl) {
          // Atualizar o time com a URL da imagem
          await supabase
            .from('teams')
            .update({ logo: logoUrl })
            .eq('id', teamData.id);
        }
      }

      setSaved(true);
      
      // Redirecionar após salvar
      setTimeout(() => {
        router.push('/times');
      }, 1000);
    } catch (err) {
      console.error('Erro:', err);
      setError('Erro inesperado. Tente novamente.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back Button */}
        <Link href="/times" className="inline-flex items-center gap-2 text-white/60 hover:text-[#00FF00] transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          Voltar para Meus Times
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Criar Novo Time
          </h1>
          <p className="text-white/60">Preencha as informações do seu time</p>
        </div>

        {/* Mensagem de sucesso */}
        {saved && (
          <div className="bg-green-500/20 border border-green-500/40 text-green-400 px-6 py-4 rounded-xl mb-6 flex items-center gap-3">
            <Save className="w-5 h-5" />
            Time criado com sucesso! Redirecionando...
          </div>
        )}

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-400 px-6 py-4 rounded-xl mb-6 flex items-center gap-3">
            <XCircle className="w-5 h-5" />
            {error}
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
                  {logoPreview ? (
                    <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-[#FF6B00]/30 shadow-[0_0_20px_rgba(255,107,0,0.2)]">
                      <img 
                        src={logoPreview} 
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
                    {logoPreview ? 'Alterar Logo' : 'Adicionar Logo'}
                  </button>
                  <p className="text-white/40 text-sm mt-2 text-center">
                    Formatos: JPG, PNG, GIF (máx. 5MB)
                  </p>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview('');
                      }}
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
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                maxLength={15}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6B00]/40 transition-all"
              />
            </div>

            {/* Localização */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
              <label className="block text-white font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#FF6B00]" />
                Localização do Time
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="city" className="block text-white/60 text-sm mb-2">Cidade</label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Ex: São Paulo"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6B00]/40 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-white/60 text-sm mb-2">Estado</label>
                  <select
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FF6B00]/40 transition-all"
                  >
                    <option value="" className="bg-[#1A1A1A]">Selecione</option>
                    {brazilianStates.map(state => (
                      <option key={state} value={state} className="bg-[#1A1A1A]">{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="neighborhood" className="block text-white/60 text-sm mb-2">Bairro</label>
                  <input
                    type="text"
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    placeholder="Ex: Centro"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6B00]/40 transition-all"
                  />
                </div>
              </div>
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

            {/* Team Type */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
              <label htmlFor="teamType" className="block text-white font-bold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#FF6B00]" />
                Tipo de Time
              </label>
              <select
                id="teamType"
                value={formData.teamType}
                onChange={(e) => setFormData({ ...formData, teamType: e.target.value as typeof formData.teamType })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FF6B00]/40 transition-all"
              >
                <option value="" className="bg-[#1A1A1A]">Selecione o tipo</option>
                {teamTypeOptions.map(type => (
                  <option key={type} value={type} className="bg-[#1A1A1A]">Time de {type}</option>
                ))}
              </select>
            </div>

            {/* Has Venue */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
              <label className="block text-white font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#FF6B00]" />
                Possui local para jogo?
              </label>
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hasVenue: true })}
                  className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl transition-all ${
                    formData.hasVenue
                      ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                      : 'bg-white/5 border-2 border-transparent text-white/60 hover:bg-white/10'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hasVenue: false, venueName: '', venueAddress: '' })}
                  className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl transition-all ${
                    !formData.hasVenue
                      ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                      : 'bg-white/5 border-2 border-transparent text-white/60 hover:bg-white/10'
                  }`}
                >
                  <XCircle className="w-5 h-5" />
                  Não
                </button>
              </div>
              
              {/* Campos condicionais para local de jogo */}
              {formData.hasVenue && (
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div>
                    <label htmlFor="venueName" className="block text-white/60 text-sm mb-2">Nome do Local</label>
                    <input
                      type="text"
                      id="venueName"
                      value={formData.venueName}
                      onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                      placeholder="Ex: Quadra do Bairro, Campo Municipal..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6B00]/40 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="venueAddress" className="block text-white/60 text-sm mb-2">Endereço (opcional)</label>
                    <input
                      type="text"
                      id="venueAddress"
                      value={formData.venueAddress}
                      onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                      placeholder="Ex: Rua das Flores, 123"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF6B00]/40 transition-all"
                    />
                  </div>
                </div>
              )}
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
                  {logoPreview ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden">
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
                      <span className="text-2xl">⚽</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
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
                
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#FF6B00] mb-1">0</div>
                    <div className="text-white/60 text-xs">Jogadores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#FF6B00] mb-1">0</div>
                    <div className="text-white/60 text-xs">Vitórias</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#FF6B00] mb-1">0</div>
                    <div className="text-white/60 text-xs">Partidas</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving || saved}
                className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 disabled:bg-[#FF6B00]/50 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] disabled:shadow-none flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Criar Time
                  </>
                )}
              </button>
              
              <Link
                href="/times"
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
