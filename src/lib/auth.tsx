import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

type AuthState = {
  session: Session | null;
  isAdmin: boolean;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<string | null>;
  sair: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessaoPronta, setSessaoPronta] = useState(false);
  const [adminPronto, setAdminPronto] = useState(false);

  // sessão atual + mudanças de login/logout
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessaoPronta(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_evento, nova) => {
      setSession(nova);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // verifica se o usuário logado está na tabela administradores
  const userId = session?.user.id;
  useEffect(() => {
    if (!sessaoPronta) return;
    if (!userId) {
      setIsAdmin(false);
      setAdminPronto(true);
      return;
    }
    setAdminPronto(false);
    supabase.rpc('is_admin').then(({ data, error }) => {
      setIsAdmin(!error && data === true);
      setAdminPronto(true);
    });
  }, [userId, sessaoPronta]);

  async function entrar(email: string, senha: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (!error) return null;
    if (error.message.toLowerCase().includes('invalid login')) return 'E-mail ou senha incorretos.';
    return error.message;
  }

  async function sair() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{ session, isAdmin, carregando: !sessaoPronta || !adminPronto, entrar, sair }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
