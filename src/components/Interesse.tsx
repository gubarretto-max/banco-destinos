const ROTULOS = ['', 'Curiosidade', 'Talvez', 'Quero ir', 'Quero muito', 'Prioridade'];

/** Exibe o interesse como 5 bolinhas. */
export function InteresseSelo({ valor }: { valor: number | null }) {
  if (!valor) return <span className="suave">sem nota</span>;
  return (
    <span className="interesse" title={`${valor} – ${ROTULOS[valor]}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= valor ? 'ponto cheio' : 'ponto'} />
      ))}
    </span>
  );
}

/** Seletor de 1 a 5 (clicar no valor atual limpa). */
export function InteresseCampo({
  valor,
  onChange,
}: {
  valor: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="interesse-campo" role="radiogroup" aria-label="Nível de interesse">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={valor === n}
          className={valor !== null && n <= valor ? 'ponto-botao cheio' : 'ponto-botao'}
          onClick={() => onChange(valor === n ? null : n)}
          title={`${n} – ${ROTULOS[n]}`}
        >
          {n}
        </button>
      ))}
      <span className="suave">{valor ? ROTULOS[valor] : 'sem nota'}</span>
    </div>
  );
}
