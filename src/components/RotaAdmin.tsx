import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

/** Só deixa passar quem está logado E é administrador. */
export default function RotaAdmin({ children }: { children: ReactNode }) {
  const { session, isAdmin, carregando, sair } = useAuth();
  const local = useLocation();

  if (carregando) return <p className="suave">Carregando…</p>;
  if (!session) return <Navigate to="/login" replace state={{ voltarPara: local.pathname }} />;
  if (!isAdmin) {
    return (
      <div className="cartao">
        <h2>Sem permissão</h2>
        <p>Este usuário não está cadastrado como administrador.</p>
        <button className="botao" onClick={sair}>Sair</button>
      </div>
    );
  }
  return <>{children}</>;
}
