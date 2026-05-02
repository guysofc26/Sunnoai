'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/browser';
import { User } from '@supabase/supabase-js';
import { Perfil } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  perfil: Perfil | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshPerfil: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  perfil: null,
  loading: true,
  signOut: async () => {},
  refreshPerfil: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const perfilFetchedRef = useRef<string | null>(null);
  const isInitialLoadDone = useRef(false);

  const fetchPerfil = useCallback(async (userId: string, userEmail: string) => {
    if (perfilFetchedRef.current === userId) return;
    perfilFetchedRef.current = userId;

    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setPerfil(data);
    } else if (error?.code === 'PGRST116') {
      const { data: criado } = await supabase
        .from('perfis')
        .upsert({
          id: userId,
          email: userEmail,
          nome: '',
          plano: 'gratis',
          creditos: 3,
          onboarding_completed: false,
        }, { onConflict: 'id' })
        .select()
        .single();

      if (criado) {
        setPerfil(criado);
      }
    }
  }, []);

  useEffect(() => {
    if (isInitialLoadDone.current) return;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        await fetchPerfil(session.user.id, session.user.email || '');
      }

      setLoading(false);
      isInitialLoadDone.current = true;
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        perfilFetchedRef.current = null;
        setPerfil(null);
        setLoading(true);
        fetchPerfil(session.user.id, session.user.email || '').then(() => {
          setLoading(false);
        });
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        setPerfil(null);
        perfilFetchedRef.current = null;
        setLoading(false);
        isInitialLoadDone.current = false;
      } else if (_event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchPerfil]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPerfil(null);
    perfilFetchedRef.current = null;
    isInitialLoadDone.current = false;
  };

  const refreshPerfil = useCallback(async () => {
    if (user) {
      perfilFetchedRef.current = null;
      await fetchPerfil(user.id, user.email || '');
    }
  }, [user, fetchPerfil]);

  return (
    <AuthContext.Provider value={{ user, perfil, loading, signOut, refreshPerfil }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
