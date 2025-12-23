'use client';

import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Email não confirmado. Verifique sua caixa de entrada.');
      } else {
        setError(error.message || 'Erro ao fazer login');
      }
      setIsLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center relative overflow-hidden">
      {/* Bolas de futebol animadas no fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Bola 1 - Grande, movimento diagonal lento */}
        <div className="absolute animate-float-ball-1">
          <div className="w-72 h-72 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,107,0,0.3)]">
              {/* Fundo da bola */}
              <circle cx="50" cy="50" r="48" fill="#1a1a1a" stroke="#FF6B00" strokeWidth="1"/>
              {/* Pentágonos pretos da bola de futebol */}
              <polygon points="50,15 61,24 57,38 43,38 39,24" fill="#FF6B00" fillOpacity="0.8"/>
              <polygon points="50,85 61,76 57,62 43,62 39,76" fill="#FF6B00" fillOpacity="0.6"/>
              <polygon points="15,50 24,39 38,43 38,57 24,61" fill="#FF6B00" fillOpacity="0.7"/>
              <polygon points="85,50 76,39 62,43 62,57 76,61" fill="#FF6B00" fillOpacity="0.5"/>
              <polygon points="50,50 57,38 70,42 70,58 57,62" fill="#FF6B00" fillOpacity="0.3"/>
              {/* Linhas conectando os pentágonos */}
              <path d="M50,15 L50,2 M61,24 L75,15 M39,24 L25,15" stroke="#FF6B00" strokeWidth="0.8" fill="none" opacity="0.6"/>
              <path d="M57,38 L70,42 M43,38 L30,42" stroke="#FF6B00" strokeWidth="0.8" fill="none" opacity="0.6"/>
              <path d="M38,43 L30,42 M38,57 L30,58" stroke="#FF6B00" strokeWidth="0.8" fill="none" opacity="0.6"/>
              <path d="M62,43 L70,42 M62,57 L70,58" stroke="#FF6B00" strokeWidth="0.8" fill="none" opacity="0.6"/>
            </svg>
          </div>
        </div>

        {/* Bola 2 - Média, movimento horizontal */}
        <div className="absolute animate-float-ball-2">
          <div className="w-48 h-48 opacity-25">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(255,107,0,0.3)]">
              <circle cx="50" cy="50" r="48" fill="#0d0d0d" stroke="#FF6B00" strokeWidth="1.5"/>
              <polygon points="50,12 63,22 59,40 41,40 37,22" fill="#FF6B00" fillOpacity="0.9"/>
              <polygon points="50,88 63,78 59,60 41,60 37,78" fill="#FF6B00" fillOpacity="0.7"/>
              <polygon points="12,50 22,37 40,41 40,59 22,63" fill="#FF6B00" fillOpacity="0.8"/>
              <polygon points="88,50 78,37 60,41 60,59 78,63" fill="#FF6B00" fillOpacity="0.6"/>
              <polygon points="50,50 59,40 72,45 72,55 59,60" fill="#FF6B00" fillOpacity="0.4"/>
              <path d="M50,12 L50,2 M63,22 L78,12 M37,22 L22,12" stroke="#FF6B00" strokeWidth="1" fill="none" opacity="0.5"/>
            </svg>
          </div>
        </div>

        {/* Bola 3 - Pequena, movimento vertical */}
        <div className="absolute animate-float-ball-3">
          <div className="w-32 h-32 opacity-30">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(255,107,0,0.4)]">
              <circle cx="50" cy="50" r="48" fill="#151515" stroke="#FF6B00" strokeWidth="2"/>
              <polygon points="50,10 65,22 60,42 40,42 35,22" fill="#FF6B00"/>
              <polygon points="50,90 65,78 60,58 40,58 35,78" fill="#FF6B00" fillOpacity="0.8"/>
              <polygon points="10,50 22,35 42,40 42,60 22,65" fill="#FF6B00" fillOpacity="0.9"/>
              <polygon points="90,50 78,35 58,40 58,60 78,65" fill="#FF6B00" fillOpacity="0.7"/>
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
            <div className="inline-flex items-center justify-center w-64 h-64">
              <img src="/icons/logo2.png" alt="VersusFut" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-white -mt-12" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
