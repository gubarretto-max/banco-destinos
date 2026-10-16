import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { PaisResumo } from '../lib/tipos';
import { InteresseSelo } from '../components/Interesse';

export default function Inicio() {
  const [paises, setPaises] = useState<PaisResumo[] | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    supabase
      .from('v_paises_resumo')
      .select('*')
      .then(({ data, error }) => {
        if (error) setErro(error.message);
        else setPaises((data as PaisResumo[]) ?? []);
      });
  }, []);

  if (erro) return <p className="erro">Erro ao carregar: {erro}</p>;
  if (!paises) return <p className="suave">Carregando…</p>;

  return (
    <>
      <h1>Destinos</h1>
      {paises.length === 0 ? (
        <p className="suave">Nenhum país cadastrado ainda.</p>
      ) : (
        <ul className="lista">
          {paises.map((p) => (
            <li key={p.id}>
              <div>
                <strong>{p.nome}</strong>
                <span className="suave">
                  {p.continente ? ` · ${p.continente}` : ''} · {p.total_cidades} cidade(s)
                </span>
                {p.resumo && <p className="resumo">{p.resumo}</p>}
              </div>
              <InteresseSelo valor={p.interesse} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
