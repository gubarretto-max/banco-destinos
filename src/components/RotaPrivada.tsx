import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

/** Exige login para qualquer página do site. Sem sessão, manda para /login. */
export default function RotaPrivada({ children }: { children: ReactNode }) {
  const { session, carregando } = useAuth();
  const local = useLocation();

  if (carregando) return <p className="carregando-tela suave">Carregando…</p>;
  if (!session) {
    return <Navigate to="/login" replace state={{ voltarPara: local.pathname + local.search }} />;
  }
  return <>{children}</>;
}
