export type Continente = {
  id: number;
  nome: string;
};

export type Pais = {
  id: string;
  codigo_iso: string;
  nome: string;
  nome_local: string | null;
  continente_id: number | null;
  capital: string | null;
  idiomas: string[] | null;
  moeda: string | null;
  fuso_horario: string | null;
  tomada: string | null;
  visto: string | null;
  melhor_epoca: string | null;
  resumo: string | null;
  descricao: string | null;
  interesse: number | null;
};

export type Cidade = {
  id: string;
  pais_id: string;
  nome: string;
  nome_local: string | null;
  regiao: string | null;
  latitude: number | null;
  longitude: number | null;
  melhor_epoca: string | null;
  dias_sugeridos: number | null;
  resumo: string | null;
  descricao: string | null;
  interesse: number | null;
};

export type PaisResumo = {
  id: string;
  codigo_iso: string;
  nome: string;
  continente: string | null;
  interesse: number | null;
  resumo: string | null;
  total_cidades: number;
  maior_interesse_cidade: number | null;
  foto_capa: string | null;
};

/** Converte "" em null, para não gravar textos vazios no banco. */
export function vazioParaNull(v: string): string | null {
  const t = v.trim();
  return t === '' ? null : t;
}

/** Converte "" em null e o resto em número. */
export function numeroOuNull(v: string): number | null {
  const t = v.trim().replace(',', '.');
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
