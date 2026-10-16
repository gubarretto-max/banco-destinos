import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Layout() {
  const { session, isAdmin, sair } = useAuth();

  return (
    <>
      <header className="topo">
        <Link to="/" className="marca">Banco de Destinos</Link>
        <nav>
          <NavLink to="/" end>Destinos</NavLink>
          {isAdmin && <NavLink to="/admin">Cadastro</NavLink>}
          {session ? (
            <button className="link" onClick={sair}>Sair</button>
          ) : (
            <NavLink to="/login">Entrar</NavLink>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
