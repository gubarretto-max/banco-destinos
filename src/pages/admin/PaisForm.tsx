import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { vazioParaNull, type Cidade, type Continente, type Pais } from '../../lib/tipos';
import { InteresseCampo, InteresseSelo } from '../../components/Interesse';

type Campos = {
  codigo_iso: string;
  nome: string;
  nome_local: string;
  continente_id: string;
  capital: string;
  idiomas: string;
  moeda: string;
  fuso_horario: string;
  tomada: string;
  visto: string;
  melhor_epoca: string;
  resumo: string;
  descricao: string;
};

const VAZIO: Campos = {
  codigo_iso: '', nome: '', nome_local: '', continente_id: '', capital: '', idiomas: '',
  moeda: '', fuso_horario: '', tomada: '', visto: '', melhor_epoca: '', resumo: '', descricao: '',
};

function paraCampos(p: Pais): Campos {
  return {
    codigo_iso: p.codigo_iso,
    nome: p.nome,
    nome_local: p.nome_local ?? '',
    continente_id: p.continente_id?.toString() ?? '',
    capital: p.capital ?? '',
    idiomas: (p.idiomas ?? []).join(', '),
    moeda: p.moeda ?? '',
    fuso_horario: p.fuso_horario ?? '',
    tomada: p.tomada ?? '',
    visto: p.visto ?? '',
    melhor_epoca: p.melhor_epoca ?? '',
    resumo: p.resumo ?? '',
    descricao: p.descricao ?? '',
  };
}

export default function PaisForm() {
  const { id } = useParams();
  const novo = !id;
  const navegar = useNavigate();

  const [continentes, setContinentes] = useState<Continente[]>([]);
  const [campos, setCampos] = useState<Campos>(VAZIO);
  const [interesse, setInteresse] = useState<number | null>(null);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [carregando, setCarregando] = useState(!novo);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    supabase.from('continentes').select('*').order('id')
      .then(({ data }) => setContinentes(data ?? []));
  }, []);

  useEffect(() => {
    if (novo) {
      setCampos(VAZIO);
      setInteresse(null);
      setCidades([]);
      return;
    }
    setCarregando(true);
    Promise.all([
      supabase.from('paises').select('*').eq('id', id).single(),
      supabase.from('cidades').select('*').eq('pais_id', id)
        .order('interesse', { ascending: false, nullsFirst: false }).order('nome'),
    ]).then(([pais, cids]) => {
      if (pais.error) setErro(pais.error.message);
      else {
        setCampos(paraCampos(pais.data as Pais));
        setInteresse((pais.data as Pais).interesse);
      }
      setCidades((cids.data as Cidade[]) ?? []);
      setCarregando(false);
    });
  }, [id, novo]);

  function alterar(campo: keyof Campos, valor: string) {
    setCampos((c) => ({ ...c, [campo]: valor }));
    setAviso('');
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setAviso('');

    const codigo = campos.codigo_iso.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(codigo)) {
      setErro('O código ISO precisa ter exatamente 2 letras (ex.: PT, JP, IT).');
      return;
    }

    const dados = {
      codigo_iso: codigo,
      nome: campos.nome.trim(),
      nome_local: vazioParaNull(campos.nome_local),
      continente_id: campos.continente_id ? Number(campos.continente_id) : null,
      capital: vazioParaNull(campos.capital),
      idiomas: campos.idiomas.split(',').map((s) => s.trim()).filter(Boolean),
      moeda: vazioParaNull(campos.moeda),
      fuso_horario: vazioParaNull(campos.fuso_horario),
      tomada: vazioParaNull(campos.tomada),
      visto: vazioParaNull(campos.visto),
      melhor_epoca: vazioParaNull(campos.melhor_epoca),
      resumo: vazioParaNull(campos.resumo),
      descricao: vazioParaNull(campos.descricao),
      interesse,
    };

    setSalvando(true);
    const resposta = novo
      ? await supabase.from('paises').insert(dados).select('id').single()
      : await supabase.from('paises').update(dados).eq('id', id).select('id').single();
    setSalvando(false);

    if (resposta.error) {
      setErro(resposta.error.code === '23505'
        ? `Já existe um país com o código ${codigo}.`
        : resposta.error.message);
      return;
    }
    if (novo) navegar(`/admin/paises/${resposta.data.id}`, { replace: true });
    else setAviso('Salvo.');
  }

  async function excluirCidade(c: Cidade) {
    if (!confirm(`Excluir ${c.nome}? Links, fotos e textos dela também serão apagados.`)) return;
    const { error } = await supabase.from('cidades').delete().eq('id', c.id);
    if (error) alert(`Não foi possível excluir: ${error.message}`);
    else setCidades((lista) => lista.filter((x) => x.id !== c.id));
  }

  if (carregando) return <p className="suave">Carregando…</p>;

  return (
    <>
      <p><Link to="/admin">← Países</Link></p>
      <h1>{novo ? 'Novo país' : campos.nome || 'País'}</h1>

      <form className="cartao formulario" onSubmit={salvar}>
        <div className="grade">
          <label>Nome *
            <input required value={campos.nome} onChange={(e) => alterar('nome', e.target.value)}
                   placeholder="Portugal" />
          </label>
          <label>Código ISO *
            <input required maxLength={2} value={campos.codigo_iso}
                   onChange={(e) => alterar('codigo_iso', e.target.value.toUpperCase())}
                   placeholder="PT" />
          </label>
          <label>Nome local
            <input value={campos.nome_local} onChange={(e) => alterar('nome_local', e.target.value)}
                   placeholder="Nihon, Deutschland…" />
          </label>
          <label>Continente
            <select value={campos.continente_id}
                    onChange={(e) => alterar('continente_id', e.target.value)}>
              <option value="">—</option>
              {continentes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>
          <label>Capital
            <input value={campos.capital} onChange={(e) => alterar('capital', e.target.value)} />
          </label>
          <label>Idiomas <small className="suave">(separados por vírgula)</small>
            <input value={campos.idiomas} onChange={(e) => alterar('idiomas', e.target.value)}
                   placeholder="Português, Inglês" />
          </label>
          <label>Moeda
            <input value={campos.moeda} onChange={(e) => alterar('moeda', e.target.value)}
                   placeholder="Euro (EUR)" />
          </label>
          <label>Fuso horário
            <input value={campos.fuso_horario}
                   onChange={(e) => alterar('fuso_horario', e.target.value)} placeholder="UTC+0" />
          </label>
          <label>Tomada
            <input value={campos.tomada} onChange={(e) => alterar('tomada', e.target.value)}
                   placeholder="Tipo F, 230V" />
          </label>
          <label>Visto (para brasileiros)
            <input value={campos.visto} onChange={(e) => alterar('visto', e.target.value)}
                   placeholder="Isento até 90 dias" />
          </label>
          <label>Melhor época
            <input value={campos.melhor_epoca}
                   onChange={(e) => alterar('melhor_epoca', e.target.value)}
                   placeholder="Abril a junho" />
          </label>
        </div>

        <div className="campo">
          <span>Interesse</span>
          <InteresseCampo valor={interesse} onChange={(v) => { setInteresse(v); setAviso(''); }} />
        </div>

        <label>Resumo <small className="suave">(aparece nos cards)</small>
          <input value={campos.resumo} onChange={(e) => alterar('resumo', e.target.value)}
                 maxLength={200} />
        </label>
        <label>Descrição
          <textarea rows={6} value={campos.descricao}
                    onChange={(e) => alterar('descricao', e.target.value)} />
        </label>

        {erro && <p className="erro">{erro}</p>}
        <div className="acoes">
          <button className="botao primario" disabled={salvando}>
            {salvando ? 'Salvando…' : novo ? 'Criar país' : 'Salvar'}
          </button>
          {aviso && <span className="ok">{aviso}</span>}
        </div>
      </form>

      {!novo && (
        <section>
          <div className="cabecalho-pagina">
            <h2>Cidades</h2>
            <Link to={`/admin/paises/${id}/cidades/nova`} className="botao primario">
              + Nova cidade
            </Link>
          </div>
          {cidades.length === 0 ? (
            <p className="suave">Nenhuma cidade cadastrada.</p>
          ) : (
            <ul className="lista">
              {cidades.map((c) => (
                <li key={c.id}>
                  <div>
                    <Link to={`/admin/cidades/${c.id}`}><strong>{c.nome}</strong></Link>
                    {c.regiao && <span className="suave"> · {c.regiao}</span>}
                    {c.dias_sugeridos && <span className="suave"> · {c.dias_sugeridos} dia(s)</span>}
                  </div>
                  <div className="acoes">
                    <InteresseSelo valor={c.interesse} />
                    <Link to={`/admin/cidades/${c.id}`} className="botao">Editar</Link>
                    <button className="botao perigo" onClick={() => excluirCidade(c)}>Excluir</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
