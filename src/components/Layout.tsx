import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';

/** Moldura das páginas internas (só aparece para quem está logado). */
export default function Layout() {
  const { session, isAdmin, sair } = useAuth();

  return (
    <>
      <header className="topo">
        <Link to="/" className="marca">Banco de Destinos</Link>
        <nav>
          <NavLink to="/" end>Destinos</NavLink>
          {isAdmin && <NavLink to="/admin">Cadastro</NavLink>}
          <span className="suave usuario" title={session?.user.email}>{session?.user.email}</span>
          <button className="link" onClick={sair}>Sair</button>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
