import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Login() {
  const { session, entrar } = useAuth();
  const navegar = useNavigate();
  const local = useLocation();
  const voltarPara = (local.state as { voltarPara?: string } | null)?.voltarPara ?? '/admin';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

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
    <form className="cartao estreito" onSubmit={enviar}>
      <h1>Entrar</h1>
      <label>
        E-mail
        <input type="email" autoComplete="email" required value={email}
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
  );
}
