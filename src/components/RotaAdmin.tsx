import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

/** Dentro da área logada, só deixa passar administradores. */
export default function RotaAdmin({ children }: { children: ReactNode }) {
  const { isAdmin, carregando } = useAuth();

  if (carregando) return <p className="suave">Carregando…</p>;
  if (!isAdmin) {
    return (
      <div className="cartao">
        <h2>Sem permissão</h2>
        <p>Este usuário não está cadastrado como administrador.</p>
        <Link to="/" className="botao">Voltar aos destinos</Link>
      </div>
    );
  }
  return <>{children}</>;
}
