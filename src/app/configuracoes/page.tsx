'use client';

import Navigation from '@/components/Navigation';
import { Settings, User, Moon, Sun, Bell, BellOff, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';

interface UserConfig {
  displayName: string;
  darkMode: boolean;
  notifications: boolean;
  viewMode: 'owner' | 'player';
}

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<UserConfig>({
    displayName: 'Rafael Jr – Presidente Real Cohab',
    darkMode: true,
    notifications: true,
    viewMode: 'owner'
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Carregar configurações do localStorage
    const savedConfig = localStorage.getItem('userConfig');
    const savedViewMode = localStorage.getItem('viewMode') as 'owner' | 'player' | null;
    
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      // Sincronizar viewMode do localStorage separado
      if (savedViewMode) {
        parsedConfig.viewMode = savedViewMode;
      }
      setConfig(parsedConfig);
    } else {
      // Salvar configuração padrão
      localStorage.setItem('userConfig', JSON.stringify(config));
    }
  }, []);

  const handleConfigChange = (key: keyof UserConfig, value: string | boolean) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    localStorage.setItem('userConfig', JSON.stringify(newConfig));
    
    // Se for mudança de viewMode, salvar também separadamente e disparar evento
    if (key === 'viewMode') {
      localStorage.setItem('viewMode', value as string);
      window.dispatchEvent(new CustomEvent('viewModeChange', { detail: value }));
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-[#FF6B00]/10 rounded-2xl">
              <Settings className="w-8 h-8 text-[#FF6B00]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Configurações
              </h1>
              <p className="text-white/60 text-base sm:text-lg">Personalize sua experiência no VersusFut</p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="max-w-3xl space-y-6">
          {/* Perfil */}
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-[#FF6B00]" />
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Perfil
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
            </div>
          </div>

          {/* Modo de Visualização */}
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-[#FF6B00]" />
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Modo de Visualização
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-white/60 text-sm mb-4">
                Escolha como você deseja visualizar o aplicativo. O modo "Dono de Time" oferece acesso completo às funcionalidades de gestão.
              </p>
              
              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-2">
                <button
                  onClick={() => handleConfigChange('viewMode', 'owner')}
                  className={`flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    config.viewMode === 'owner'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_20px_rgba(255,107,0,0.3)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Dono de Time</span>
                </button>
                <button
                  onClick={() => handleConfigChange('viewMode', 'player')}
                  className={`flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    config.viewMode === 'player'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_20px_rgba(255,107,0,0.3)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Jogador</span>
                </button>
              </div>

              <p className="text-white/40 text-xs mt-2">
                {config.viewMode === 'owner' 
                  ? 'Você tem acesso completo para gerenciar times, táticas e jogadores.'
                  : 'Você está visualizando como jogador, com acesso limitado.'}
              </p>
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
              {/* Tema Escuro */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  {config.darkMode ? (
                    <Moon className="w-6 h-6 text-[#FF6B00]" />
                  ) : (
                    <Sun className="w-6 h-6 text-[#FF6B00]" />
                  )}
                  <div>
                    <div className="text-white font-medium">Tema Escuro</div>
                    <div className="text-white/60 text-sm">
                      {config.darkMode ? 'Modo escuro ativado' : 'Modo claro ativado'}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleConfigChange('darkMode', !config.darkMode)}
                  className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                    config.darkMode ? 'bg-[#FF6B00]' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                      config.darkMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
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
        </div>
      </main>
    </div>
  );
}
