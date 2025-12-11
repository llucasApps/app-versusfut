'use client';

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    
    // Simular login (em produção, conectar com backend)
    setTimeout(() => {
      // Login de teste
      if (email === 'admin@versusfut.com' && password === '123456') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        router.push('/');
      } else {
        setError('Email ou senha incorretos');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center relative overflow-hidden">
      {/* Bolas de futebol animadas no fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Bola 1 - Grande, movimento diagonal lento */}
        <div className="absolute animate-float-ball-1">
          <div className="w-64 h-64 opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="48" fill="none" stroke="#FF6B00" strokeWidth="1"/>
              <path d="M50 2 L50 98 M2 50 L98 50 M15 15 L85 85 M85 15 L15 85" stroke="#FF6B00" strokeWidth="0.5" opacity="0.5"/>
              <circle cx="50" cy="50" r="20" fill="none" stroke="#FF6B00" strokeWidth="0.5"/>
              {/* Padrão de bola de futebol */}
              <path d="M50 10 L65 25 L65 45 L50 55 L35 45 L35 25 Z" fill="none" stroke="#FF6B00" strokeWidth="1"/>
              <path d="M50 90 L65 75 L65 55 L50 45 L35 55 L35 75 Z" fill="none" stroke="#FF6B00" strokeWidth="1"/>
              <path d="M10 50 L25 35 L45 35 L55 50 L45 65 L25 65 Z" fill="none" stroke="#FF6B00" strokeWidth="1"/>
              <path d="M90 50 L75 35 L55 35 L45 50 L55 65 L75 65 Z" fill="none" stroke="#FF6B00" strokeWidth="1"/>
            </svg>
          </div>
        </div>

        {/* Bola 2 - Média, movimento horizontal */}
        <div className="absolute animate-float-ball-2">
          <div className="w-40 h-40 opacity-15">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="48" fill="none" stroke="#FF6B00" strokeWidth="1.5"/>
              <path d="M50 10 L65 25 L65 45 L50 55 L35 45 L35 25 Z" fill="#FF6B00" fillOpacity="0.1" stroke="#FF6B00" strokeWidth="1"/>
              <path d="M50 90 L65 75 L65 55 L50 45 L35 55 L35 75 Z" fill="#FF6B00" fillOpacity="0.1" stroke="#FF6B00" strokeWidth="1"/>
              <path d="M10 50 L25 35 L45 35 L55 50 L45 65 L25 65 Z" fill="#FF6B00" fillOpacity="0.1" stroke="#FF6B00" strokeWidth="1"/>
              <path d="M90 50 L75 35 L55 35 L45 50 L55 65 L75 65 Z" fill="#FF6B00" fillOpacity="0.1" stroke="#FF6B00" strokeWidth="1"/>
            </svg>
          </div>
        </div>

        {/* Bola 3 - Pequena, movimento vertical */}
        <div className="absolute animate-float-ball-3">
          <div className="w-24 h-24 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="48" fill="none" stroke="#FF6B00" strokeWidth="2"/>
              <circle cx="50" cy="50" r="30" fill="none" stroke="#FF6B00" strokeWidth="1"/>
              <circle cx="50" cy="50" r="15" fill="#FF6B00" fillOpacity="0.2"/>
            </svg>
          </div>
        </div>

        {/* Gradiente de luz laranja */}
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#FF6B00]/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 -left-32 w-80 h-80 bg-[#FF6B00]/10 rounded-full blur-[100px] animate-pulse-slow-delay" />
      </div>

      {/* Card de Login */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-gradient-to-br from-[#1A1A1A]/95 to-[#0D0D0D]/95 backdrop-blur-xl border border-[#FF6B00]/20 rounded-3xl p-8 shadow-[0_0_60px_rgba(255,107,0,0.1)]">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#FF6B00] to-[#FF8C00] rounded-2xl mb-4 shadow-[0_0_30px_rgba(255,107,0,0.3)]">
              <span className="text-4xl">⚽</span>
            </div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Versus<span className="text-[#FF6B00]">Fut</span>
            </h1>
            <p className="text-white/60 mt-2">Entre na sua conta</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-white/60 text-sm mb-2">Email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Mail className="w-5 h-5 text-white/40" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/30 focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-white/60 text-sm mb-2">Senha</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-white/40" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-4 text-white placeholder-white/30 focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Esqueceu a senha */}
            <div className="text-right">
              <button type="button" className="text-[#FF6B00] text-sm hover:text-[#FF8C00] transition-colors">
                Esqueceu a senha?
              </button>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] hover:from-[#FF7B00] hover:to-[#FF9C00] disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:shadow-[0_0_30px_rgba(255,107,0,0.5)] disabled:shadow-none"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/40 text-sm">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Login Social */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-white transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-white transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span className="text-sm">Apple</span>
            </button>
          </div>

          {/* Credenciais de teste */}
          <div className="mt-6 p-4 bg-[#FF6B00]/5 border border-[#FF6B00]/20 rounded-xl">
            <p className="text-white/40 text-xs text-center mb-2">Credenciais de teste:</p>
            <p className="text-white/60 text-xs text-center font-mono">
              admin@versusfut.com / 123456
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/30 text-sm mt-6">
          © 2024 VersusFut. Todos os direitos reservados.
        </p>
      </div>

      {/* Estilos de animação */}
      <style jsx>{`
        @keyframes float-ball-1 {
          0% {
            transform: translate(-100px, 100vh) rotate(0deg);
          }
          100% {
            transform: translate(100vw, -100px) rotate(360deg);
          }
        }
        
        @keyframes float-ball-2 {
          0% {
            transform: translate(100vw, 30vh) rotate(0deg);
          }
          100% {
            transform: translate(-200px, 60vh) rotate(-360deg);
          }
        }
        
        @keyframes float-ball-3 {
          0% {
            transform: translate(50vw, 100vh) rotate(0deg);
          }
          100% {
            transform: translate(30vw, -150px) rotate(720deg);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.1);
          }
        }

        .animate-float-ball-1 {
          animation: float-ball-1 45s linear infinite;
        }
        
        .animate-float-ball-2 {
          animation: float-ball-2 35s linear infinite;
          animation-delay: -10s;
        }
        
        .animate-float-ball-3 {
          animation: float-ball-3 25s linear infinite;
          animation-delay: -5s;
        }

        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }

        .animate-pulse-slow-delay {
          animation: pulse-slow 8s ease-in-out infinite;
          animation-delay: -4s;
        }
      `}</style>
    </div>
  );
}
