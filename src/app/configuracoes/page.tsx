'use client';

import Navigation from '@/components/Navigation';
import { supabase, UserSettings } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { User, Moon, Sun, Bell, BellOff, Shield, Loader2, Check, LogOut, Camera, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

interface UserConfig {
  displayName: string;
  darkMode: boolean;
  notifications: boolean;
  viewMode: 'owner' | 'player';
  avatarUrl: string;
}

export default function ConfiguracoesPage() {
  const { user, profile, signOut } = useAuth();
  const [config, setConfig] = useState<UserConfig>({
    displayName: '',
    darkMode: true,
    notifications: true,
    viewMode: 'owner',
    avatarUrl: ''
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Carregar configurações do Supabase
  useEffect(() => {
    setMounted(true);
    
    const fetchSettings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Buscar configurações do usuário
      const { data: settings, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned (usuário novo)
        console.error('Erro ao buscar configurações:', error);
      }

      if (settings) {
        setConfig({
          displayName: settings.display_name || profile?.name || '',
          darkMode: settings.dark_mode ?? true,
          notifications: settings.notifications ?? true,
          viewMode: settings.view_mode || 'owner',
          avatarUrl: settings.avatar_url || ''
        });
        // Sincronizar localStorage para componentes que dependem dele
        localStorage.setItem('viewMode', settings.view_mode || 'owner');
      } else {
        // Usuário novo - usar dados do perfil
        setConfig(prev => ({
          ...prev,
          displayName: profile?.name || '',
          avatarUrl: ''
        }));
      }

      setLoading(false);
    };

    fetchSettings();
  }, [user, profile]);

  const handleConfigChange = async (key: keyof UserConfig, value: string | boolean) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    
    // Se for mudança de viewMode, salvar também no localStorage e disparar evento
    if (key === 'viewMode') {
      localStorage.setItem('viewMode', value as string);
      window.dispatchEvent(new CustomEvent('viewModeChange', { detail: value }));
    }

    // Salvar no Supabase
    if (user) {
      setSaving(true);
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          display_name: newConfig.displayName,
          dark_mode: newConfig.darkMode,
          notifications: newConfig.notifications,
          view_mode: newConfig.viewMode,
          avatar_url: newConfig.avatarUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erro ao salvar configurações:', error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
      
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);

    try {
      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Erro ao fazer upload:', uploadError);
        return;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Atualizar configuração
      await handleConfigChange('avatarUrl', publicUrl);
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Foto de Perfil */}
              <div className="relative group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FF6B00]/10 border-2 border-[#FF6B00]/30 overflow-hidden flex items-center justify-center">
                  {config.avatarUrl ? (
                    <img 
                      src={config.avatarUrl} 
                      alt="Foto de perfil" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 sm:w-12 sm:h-12 text-[#FF6B00]/60" />
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  {uploadingAvatar ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Meu Perfil
                </h1>
                <p className="text-white/60 text-base sm:text-lg">{user?.email}</p>
              </div>
            </div>
            
            {/* Indicador de salvamento */}
            {(saving || saved) && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                saved ? 'bg-green-500/20 text-green-500' : 'bg-[#FF6B00]/20 text-[#FF6B00]'
              }`}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Salvando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Salvo!</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Settings Sections */}
        <div className="max-w-3xl space-y-6">
          {/* Informações do Perfil */}
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-[#FF6B00]" />
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Informações Pessoais
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2 font-medium">
                  Nome Exibido
                </label>
                <input
                  type="text"
                  value={config.displayName}
                  onChange={(e) => handleConfigChange('displayName', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none transition-all"
                  placeholder="Seu nome"
                />
                <p className="text-white/40 text-sm mt-2">
                  Este nome será exibido para outros usuários
                </p>
              </div>

              <div>
                <label className="block text-white/80 mb-2 font-medium">
                  E-mail
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/50 cursor-not-allowed"
                />
                <p className="text-white/40 text-sm mt-2">
                  O e-mail não pode ser alterado
                </p>
              </div>
            </div>
          </div>

          {/* Preferências */}
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-[#FF6B00]" />
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Preferências
              </h2>
            </div>

            <div className="space-y-6">
              {/* Tema Escuro - Desabilitado temporariamente */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl opacity-50">
                <div className="flex items-center gap-4">
                  <Moon className="w-6 h-6 text-[#FF6B00]" />
                  <div>
                    <div className="text-white font-medium">Tema Escuro</div>
                    <div className="text-white/60 text-sm">Modo escuro ativado</div>
                  </div>
                </div>
                
                <div className="relative w-14 h-8 rounded-full bg-[#FF6B00] cursor-not-allowed">
                  <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full translate-x-6" />
                </div>
              </div>

              {/* Notificações */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  {config.notifications ? (
                    <Bell className="w-6 h-6 text-[#FF6B00]" />
                  ) : (
                    <BellOff className="w-6 h-6 text-white/40" />
                  )}
                  <div>
                    <div className="text-white font-medium">Notificações</div>
                    <div className="text-white/60 text-sm">
                      {config.notifications ? 'Receber notificações de jogos e convites' : 'Notificações desativadas'}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleConfigChange('notifications', !config.notifications)}
                  className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                    config.notifications ? 'bg-[#FF6B00]' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                      config.notifications ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Informações */}
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Sobre o VersusFut</h3>
            <div className="space-y-2 text-white/60 text-sm">
              <p>Versão: 1.0.0</p>
              <p>Plataforma de gestão de times de futebol amador</p>
              <p className="text-white/40 text-xs mt-4">
                © 2024 VersusFut. Todos os direitos reservados.
              </p>
            </div>
          </div>

          {/* Botão Sair */}
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair da Conta</span>
          </button>
        </div>
      </main>
    </div>
  );
}
