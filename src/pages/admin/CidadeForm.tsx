import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { numeroOuNull, vazioParaNull, type Cidade } from '../../lib/tipos';
import { InteresseCampo } from '../../components/Interesse';

type Campos = {
  nome: string;
  nome_local: string;
  regiao: string;
  latitude: string;
  longitude: string;
  melhor_epoca: string;
  dias_sugeridos: string;
  resumo: string;
  descricao: string;
};

const VAZIO: Campos = {
  nome: '', nome_local: '', regiao: '', latitude: '', longitude: '',
  melhor_epoca: '', dias_sugeridos: '', resumo: '', descricao: '',
};

/**
 * Rotas:
 *   /admin/paises/:paisId/cidades/nova  → nova cidade
 *   /admin/cidades/:id                  → editar cidade
 */
export default function CidadeForm() {
  const { id, paisId: paisIdRota } = useParams();
  const novo = !id;
  const navegar = useNavigate();

  const [paisId, setPaisId] = useState(paisIdRota ?? '');
  const [paisNome, setPaisNome] = useState('');
  const [campos, setCampos] = useState<Campos>(VAZIO);
  const [interesse, setInteresse] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregar() {
      let pid = paisIdRota ?? '';
      if (!novo) {
        const { data, error } = await supabase.from('cidades').select('*').eq('id', id).single();
        if (error) { setErro(error.message); setCarregando(false); return; }
        const c = data as Cidade;
        pid = c.pais_id;
        setCampos({
          nome: c.nome,
          nome_local: c.nome_local ?? '',
          regiao: c.regiao ?? '',
          latitude: c.latitude?.toString() ?? '',
          longitude: c.longitude?.toString() ?? '',
          melhor_epoca: c.melhor_epoca ?? '',
          dias_sugeridos: c.dias_sugeridos?.toString() ?? '',
          resumo: c.resumo ?? '',
          descricao: c.descricao ?? '',
        });
        setInteresse(c.interesse);
      }
      setPaisId(pid);
      const { data: pais } = await supabase.from('paises').select('nome').eq('id', pid).single();
      setPaisNome(pais?.nome ?? '');
      setCarregando(false);
    }
    carregar();
  }, [id, novo, paisIdRota]);

  function alterar(campo: keyof Campos, valor: string) {
    setCampos((c) => ({ ...c, [campo]: valor }));
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro('');

    const lat = numeroOuNull(campos.latitude);
    const lon = numeroOuNull(campos.longitude);
    if (lat !== null && (lat < -90 || lat > 90)) return setErro('Latitude deve estar entre -90 e 90.');
    if (lon !== null && (lon < -180 || lon > 180)) return setErro('Longitude deve estar entre -180 e 180.');
    const dias = numeroOuNull(campos.dias_sugeridos);
    if (dias !== null && (!Number.isInteger(dias) || dias < 1)) {
      return setErro('Dias sugeridos deve ser um número inteiro maior que zero.');
    }

    const dados = {
      pais_id: paisId,
      nome: campos.nome.trim(),
      nome_local: vazioParaNull(campos.nome_local),
      regiao: vazioParaNull(campos.regiao),
      latitude: lat,
      longitude: lon,
      melhor_epoca: vazioParaNull(campos.melhor_epoca),
      dias_sugeridos: dias,
      resumo: vazioParaNull(campos.resumo),
      descricao: vazioParaNull(campos.descricao),
      interesse,
    };

    setSalvando(true);
    const { error } = novo
      ? await supabase.from('cidades').insert(dados)
      : await supabase.from('cidades').update(dados).eq('id', id);
    setSalvando(false);

    if (error) {
      setErro(error.code === '23505'
        ? `${dados.nome} já está cadastrada em ${paisNome}.`
        : error.message);
      return;
    }
    navegar(`/admin/paises/${paisId}`);
  }

  if (carregando) return <p className="suave">Carregando…</p>;

  return (
    <>
      <p><Link to={`/admin/paises/${paisId}`}>← {paisNome || 'País'}</Link></p>
      <h1>{novo ? `Nova cidade em ${paisNome}` : campos.nome}</h1>

      <form className="cartao formulario" onSubmit={salvar}>
        <div className="grade">
          <label>Nome *
            <input required value={campos.nome} onChange={(e) => alterar('nome', e.target.value)} />
          </label>
          <label>Nome local
            <input value={campos.nome_local} onChange={(e) => alterar('nome_local', e.target.value)} />
          </label>
          <label>Região / estado
            <input value={campos.regiao} onChange={(e) => alterar('regiao', e.target.value)} />
          </label>
          <label>Dias sugeridos
            <input inputMode="numeric" value={campos.dias_sugeridos}
                   onChange={(e) => alterar('dias_sugeridos', e.target.value)} />
          </label>
          <label>Latitude
            <input inputMode="decimal" value={campos.latitude}
                   onChange={(e) => alterar('latitude', e.target.value)} placeholder="38.7223" />
          </label>
          <label>Longitude
            <input inputMode="decimal" value={campos.longitude}
                   onChange={(e) => alterar('longitude', e.target.value)} placeholder="-9.1393" />
          </label>
          <label>Melhor época
            <input value={campos.melhor_epoca}
                   onChange={(e) => alterar('melhor_epoca', e.target.value)} />
          </label>
        </div>

        <div className="campo">
          <span>Interesse</span>
          <InteresseCampo valor={interesse} onChange={setInteresse} />
        </div>

        <label>Resumo
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
            {salvando ? 'Salvando…' : novo ? 'Criar cidade' : 'Salvar'}
          </button>
          <Link to={`/admin/paises/${paisId}`} className="botao">Cancelar</Link>
        </div>
      </form>
    </>
  );
}
