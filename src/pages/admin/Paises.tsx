import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { PaisResumo } from '../../lib/tipos';
import { InteresseSelo } from '../../components/Interesse';

export default function AdminPaises() {
  const [paises, setPaises] = useState<PaisResumo[] | null>(null);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  async function carregar() {
    const { data, error } = await supabase.from('v_paises_resumo').select('*');
    if (error) setErro(error.message);
    else setPaises((data as PaisResumo[]) ?? []);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function excluir(p: PaisResumo) {
    const aviso = p.total_cidades > 0
      ? `Excluir ${p.nome}? As ${p.total_cidades} cidade(s), links, fotos e textos dele também serão apagados.`
      : `Excluir ${p.nome}?`;
    if (!confirm(aviso)) return;
    const { error } = await supabase.from('paises').delete().eq('id', p.id);
    if (error) alert(`Não foi possível excluir: ${error.message}`);
    else carregar();
  }

  const termo = busca.trim().toLowerCase();
  const filtrados = paises?.filter((p) => !termo || p.nome.toLowerCase().includes(termo)) ?? [];

  return (
    <>
      <div className="cabecalho-pagina">
        <h1>Países</h1>
        <Link to="/admin/paises/novo" className="botao primario">+ Novo país</Link>
      </div>

      {erro && <p className="erro">{erro}</p>}
      {!paises && !erro && <p className="suave">Carregando…</p>}

      {paises && paises.length > 0 && (
        <input className="busca" placeholder="Buscar país…" value={busca}
               onChange={(e) => setBusca(e.target.value)} />
      )}

      {paises && paises.length === 0 && (
        <p className="suave">Nenhum país ainda. Comece pelo botão “Novo país”.</p>
      )}

      <ul className="lista">
        {filtrados.map((p) => (
          <li key={p.id}>
            <div>
              <Link to={`/admin/paises/${p.id}`}><strong>{p.nome}</strong></Link>
              <span className="suave"> · {p.codigo_iso} · {p.total_cidades} cidade(s)</span>
            </div>
            <div className="acoes">
              <InteresseSelo valor={p.interesse} />
              <Link to={`/admin/paises/${p.id}`} className="botao">Editar</Link>
              <button className="botao perigo" onClick={() => excluir(p)}>Excluir</button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
