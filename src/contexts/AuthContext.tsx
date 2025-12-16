'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Buscar perfil do usuário
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }

    return data as Profile;
  };

  // Função para limpar sessão inválida
  const clearInvalidSession = async () => {
    // Limpar localStorage do Supabase
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('sb-') && key.includes('-auth-token')) {
          localStorage.removeItem(key);
        }
      });
    }
    setSession(null);
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    
    // Timeout de segurança para evitar loading infinito
    const loadingTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Timeout ao carregar sessão, resetando estado');
        setLoading(false);
      }
    }, 5000);

    // Verificar sessão atual
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('Erro ao obter sessão:', error.message);
          
          // Verificar se é erro de refresh token inválido
          if (error.message?.includes('Refresh Token') || error.message?.includes('refresh_token')) {
            console.warn('Refresh token inválido, limpando sessão...');
            await clearInvalidSession();
            return;
          }
          
          // Limpar tokens inválidos silenciosamente
          try {
            await supabase.auth.signOut();
          } catch {
            // Ignorar erro de signOut
          }
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (isMounted) {
            setProfile(profile);
          }
        }
      } catch (err: unknown) {
        console.error('Erro inesperado ao verificar sessão:', err);
        if (!isMounted) return;
        
        // Verificar se é erro de refresh token
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage?.includes('Refresh Token') || errorMessage?.includes('refresh_token')) {
          console.warn('Refresh token inválido (catch), limpando sessão...');
          await clearInvalidSession();
          return;
        }
        
        // Limpar estado em caso de erro
        try {
          await supabase.auth.signOut();
        } catch {
          // Ignorar erro de signOut
        }
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('Auth event:', event);
        
        // Tratar erro de token inválido
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.warn('Token refresh falhou, limpando sessão...');
          await clearInvalidSession();
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (isMounted) {
            setProfile(profile);
          }
        } else {
          setProfile(null);
        }

        setLoading(false);

        // Redirecionar após logout
        if (event === 'SIGNED_OUT') {
          router.push('/login');
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, [router]);

  // Função de login
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  };

  // Função de logout
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
