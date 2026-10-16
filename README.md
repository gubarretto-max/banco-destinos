# Banco de Destinos

Site pessoal com destinos internacionais que quero visitar: países, cidades, textos, links e fotos.

**Stack:** React + TypeScript + Vite · Supabase · Render (Static Site)

## Rodando localmente

```powershell
git clone https://github.com/gubarretto-max/banco-destinos.git
cd banco-destinos
npm install
copy .env.example .env.local   # depois edite com a URL e a chave do Supabase
npm run dev
```

## Banco de dados

Os scripts ficam em `supabase/` e são rodados no SQL Editor do Supabase, na ordem numérica.
Detalhes da estrutura e das regras de acesso estão em `CLAUDE.md`.

## Publicação (Render)

- Tipo: **Static Site**
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Variáveis: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Rewrite: `/*` → `/index.html`
