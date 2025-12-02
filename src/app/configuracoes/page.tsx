'use client';

import Navigation from '@/components/Navigation';
import { Settings, User, Bell, Moon, Sun, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ConfigData {
  nomeUsuario: string;
  temaEscuro: boolean;
  notificacoes: boolean;
}

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<ConfigData>({
    nomeUsuario: '',
    temaEscuro: true,
    notificacoes: true
  });
  const [saved, setSaved] = useState(false);

  // Carregar configurações do localStorage
  useEffect(() => {
    const storedConfig = localStorage.getItem('configuracoes');
    if (storedConfig) {
      setConfig(JSON.parse(storedConfig));
    }
  }, []);

  // Salvar configurações
  const handleSave = () => {
    localStorage.setItem('configuracoes', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Configurações
          </h1>
          <p className="text-white/60 text-lg">
            Personalize sua experiência no VersusFut
          </p>
        </div>

        <div className="max-w-3xl">
          {/* Perfil */}
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#FF6B00]/20 p-3 rounded-xl">
                <User className="w-6 h-6 text-[#FF6B00]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Perfil
                </h2>
                <p className="text-white/60 text-sm">Informações básicas do usuário</p>
              </div>
            </div>

            <div>
              <label className="block text-white/80 mb-2 font-medium">Nome exibido</label>
              <input
                type="text"
                value={config.nomeUsuario}
                onChange={(e) => setConfig({ ...config, nomeUsuario: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF6B00] focus:outline-none"
                placeholder="Digite seu nome"
              />
              <p className="text-white/40 text-sm mt-2">
                Este nome será exibido em seus times e convites
              </p>
            </div>
          </div>

          {/* Preferências */}
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#FF6B00]/20 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#FF6B00]/20 p-3 rounded-xl">
                <Settings className="w-6 h-6 text-[#FF6B00]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Preferências
                </h2>
                <p className="text-white/60 text-sm">Personalize a aparência e comportamento</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Tema Escuro */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-[#FF6B00]/20 p-2 rounded-lg">
                    {config.temaEscuro ? (
                      <Moon className="w-5 h-5 text-[#FF6B00]" />
                    ) : (
                      <Sun className="w-5 h-5 text-[#FF6B00]" />
                    )}
                  </div>
                  <div>
                    <div className="text-white font-medium">Tema escuro</div>
                    <div className="text-white/60 text-sm">
                      {config.temaEscuro ? 'Ativado' : 'Desativado'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setConfig({ ...config, temaEscuro: !config.temaEscuro })}
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    config.temaEscuro ? 'bg-[#FF6B00]' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      config.temaEscuro ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Notificações */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-[#FF6B00]/20 p-2 rounded-lg">
                    <Bell className="w-5 h-5 text-[#FF6B00]" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Exibir notificações</div>
                    <div className="text-white/60 text-sm">
                      Receba alertas sobre jogos e convites
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setConfig({ ...config, notificacoes: !config.notificacoes })}
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    config.notificacoes ? 'bg-[#FF6B00]' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      config.notificacoes ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)] flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Salvar Configurações
            </button>
          </div>

          {/* Mensagem de Sucesso */}
          {saved && (
            <div className="mt-4 bg-green-500/20 border border-green-500/40 rounded-xl p-4 text-center">
              <p className="text-green-400 font-medium">
                ✓ Configurações salvas com sucesso!
              </p>
            </div>
          )}

          {/* Informações Adicionais */}
          <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-white font-bold mb-2">Sobre as Configurações</h3>
            <ul className="text-white/60 text-sm space-y-2">
              <li>• As configurações são salvas localmente no seu navegador</li>
              <li>• O tema escuro está ativo por padrão para melhor experiência</li>
              <li>• As notificações são apenas visuais (sem backend)</li>
              <li>• Seu nome será usado para identificação nos times</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
