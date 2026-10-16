import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Login() {
  const { session, carregando, entrar } = useAuth();
  const navegar = useNavigate();
  const local = useLocation();
  const pedido = (local.state as { voltarPara?: string } | null)?.voltarPara;
  const voltarPara = pedido && !pedido.startsWith('/login') ? pedido : '/';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (carregando) return <p className="carregando-tela suave">Carregando…</p>;
  if (session) return <Navigate to={voltarPara} replace />;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    const falha = await entrar(email.trim(), senha);
    setEnviando(false);
    if (falha) setErro(falha);
    else navegar(voltarPara, { replace: true });
  }

  return (
    <div className="tela-login">
      <form className="cartao estreito" onSubmit={enviar}>
        <p className="marca-login">Banco de Destinos</p>
        <h1>Entrar</h1>
        <label>
          E-mail
          <input type="email" autoComplete="email" required autoFocus value={email}
                 onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Senha
          <input type="password" autoComplete="current-password" required value={senha}
                 onChange={(e) => setSenha(e.target.value)} />
        </label>
        {erro && <p className="erro">{erro}</p>}
        <button className="botao primario" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
