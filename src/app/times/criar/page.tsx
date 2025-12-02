'use client';

import Navigation from '@/components/Navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function CriarTimePage() {
  const [formData, setFormData] = useState({
    name: '',
    logo: '⚽',
    description: '',
  });

  const logoOptions = ['⚽', '🏆', '⭐', '🔥', '⚡', '🎯', '💪', '👑', '🦁', '🐉', '⚔️', '🛡️'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você implementaria a lógica de criação do time
    console.log('Criar time:', formData);
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

        {/* Form */}
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo Selection */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-2xl p-6">
              <label className="block text-white font-bold mb-4">Logo do Time</label>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-3">
                {logoOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, logo: emoji })}
                    className={`text-4xl p-3 rounded-xl transition-all duration-300 ${
                      formData.logo === emoji
                        ? 'bg-[#00FF00]/20 border-2 border-[#00FF00] scale-110'
                        : 'bg-white/5 hover:bg-white/10 border-2 border-transparent'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Name */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-2xl p-6">
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
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#00FF00]/40 transition-all"
              />
            </div>

            {/* Description */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-2xl p-6">
              <label htmlFor="description" className="block text-white font-bold mb-3">
                Descrição
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Conte um pouco sobre o time..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#00FF00]/40 transition-all resize-none"
              />
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#00FF00]/20 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">Preview</h3>
              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl">{formData.logo}</div>
                  <div>
                    <h4 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {formData.name || 'Nome do Time'}
                    </h4>
                    <p className="text-white/60 text-sm">
                      {formData.description || 'Descrição do time'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#00FF00] mb-1">0</div>
                    <div className="text-white/60 text-xs">Jogadores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#00FF00] mb-1">0</div>
                    <div className="text-white/60 text-xs">Vitórias</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#00FF00] mb-1">0</div>
                    <div className="text-white/60 text-xs">Partidas</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-[#00FF00] hover:bg-[#00FF00]/90 text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,0,0.3)] flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Criar Time
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
