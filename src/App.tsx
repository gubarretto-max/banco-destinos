// Tela provisória: só confirma que o site está conversando com o Supabase.
// Será substituída pelas telas definitivas (lista de países, país, cidade, admin).
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

type PaisResumo = {
  id: string;
  nome: string;
  continente: string | null;
  interesse: number | null;
  total_cidades: number;
};

export default function App() {
  const [paises, setPaises] = useState<PaisResumo[] | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    supabase
      .from('v_paises_resumo')
      .select('id, nome, continente, interesse, total_cidades')
      .then(({ data, error }) => {
        if (error) setErro(error.message);
        else setPaises(data ?? []);
      });
  }, []);

  return (
    <main>
      <h1>Banco de Destinos</h1>
      {erro && <p className="erro">Erro ao conectar: {erro}</p>}
      {!erro && paises === null && <p>Carregando…</p>}
      {paises?.length === 0 && <p>Conectado, mas ainda não há países cadastrados.</p>}
      {paises && paises.length > 0 && (
        <ul>
          {paises.map((p) => (
            <li key={p.id}>
              <strong>{p.nome}</strong>
              {p.continente && <span> · {p.continente}</span>}
              <span> · interesse {p.interesse ?? '–'}</span>
              <span> · {p.total_cidades} cidade(s)</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
