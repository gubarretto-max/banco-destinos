# Banco de Destinos para viagens

Site pessoal para catalogar **destinos internacionais que ainda quero visitar**:
países, suas cidades e informações sobre eles (textos, links, fotos).
Não é um diário de viagens já feitas.

Responda sempre em **português do Brasil**. O dono do projeto usa Windows + PowerShell.

## Stack
- React + TypeScript + Vite
- Supabase (Postgres, Auth, Storage) — plano gratuito
- Publicação: Render, como **Static Site** (build `npm install && npm run build`, pasta `dist`,
  rewrite `/*` → `/index.html`)
- Código em GitHub: `gubarretto-max/banco-destinos`

## Variáveis de ambiente
`.env.local` (nunca commitar; modelo em `.env.example`):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (chave publishable/anon — **nunca** usar a secret/service_role no front)

## Banco de dados (pasta `supabase/`)
Scripts já aplicados no Supabase, nesta ordem:
1. `01_schema.sql` — tabelas, índices, triggers, view
2. `02_storage_rls.sql` — RLS, administradores, bucket `fotos`

`reset.sql` apaga tudo (uso só em emergência no início do projeto).
**Mudanças futuras no banco:** criar um novo arquivo numerado (`03_...sql`), nunca editar os já aplicados.

### Tabelas
- `continentes` (id smallint, nome) — tabela de apoio, pré-preenchida
- `paises` — codigo_iso (char 2, único), nome, nome_local, continente_id, capital, idiomas (text[]),
  moeda, fuso_horario, tomada, visto, melhor_epoca, resumo, descricao (markdown), **interesse (1–5)**
- `cidades` — pais_id, nome (único por país), nome_local, regiao, latitude, longitude, melhor_epoca,
  dias_sugeridos, resumo, descricao, **interesse (1–5)**
- `links`, `fotos`, `textos` — ligados a **um país OU uma cidade** (`num_nonnulls(pais_id, cidade_id) = 1`)
  - `links`: titulo, url, categoria (oficial, guia, hospedagem, restaurante, transporte, passeio, video, blog, outro), observacao
  - `fotos`: **storage_path OU url_externa** (exatamente um), fonte_url (crédito), legenda, capa (máx. 1 por destino), ordem
  - `textos`: titulo, conteudo (markdown), tipo (dica, roteiro, comida, cultura, seguranca, custo, outro)
- `tags` + `cidade_tags` (N:N)
- `administradores` (user_id) + função `is_admin()`
- View `v_paises_resumo` (security_invoker): país + continente + total_cidades + maior_interesse_cidade + foto_capa,
  ordenada por interesse

`interesse`: 1 = curiosidade … 5 = quero muito ir.

### Segurança (RLS)
- Leitura pública (anon) em todas as tabelas de conteúdo.
- Escrita só para usuários em `administradores` (`is_admin()`).
- Cadastro público de usuários desativado no Supabase. Login só do dono.

## Fotos
- Bucket público `fotos`, até 2 MB, só webp/jpeg/png.
- Sempre enviar com `src/lib/uploadFoto.ts` (`enviarFoto`), que redimensiona para 1600 px e converte para WebP.
- Caminho no bucket: `<pais>/<cidade>/<nome>-<sufixo>.webp` (slug sem acento).
- Exibir com `urlFoto()` (resolve storage_path ou url_externa).
- Limite do plano gratuito: 1 GB de Storage no total — manter as fotos comprimidas.

## Convenções
- Nomes de tabelas, colunas, variáveis e funções de domínio em português (ex.: `paises`, `enviarFoto`).
- Cliente Supabase único em `src/lib/supabase.ts`.
- Tema escuro; cor de destaque `#4fc3f7`.
- Antes de considerar uma mudança pronta: `npm run build` precisa passar sem erros.

## Estrutura do front
- `src/App.tsx` — rotas (react-router-dom)
- `src/lib/auth.tsx` — `AuthProvider` / `useAuth()` (session, isAdmin via `rpc('is_admin')`, entrar, sair)
- `src/components/RotaAdmin.tsx` — protege rotas `/admin/*` (exige login + admin)
- `src/components/Interesse.tsx` — `InteresseSelo` (exibição) e `InteresseCampo` (seletor 1–5)
- `src/lib/tipos.ts` — tipos das tabelas + `vazioParaNull`, `numeroOuNull`

### Rotas
- `/` — lista pública de países (view `v_paises_resumo`)
- `/login` — e-mail e senha (Supabase Auth)
- `/admin` — lista de países com busca, editar, excluir
- `/admin/paises/novo`, `/admin/paises/:id` — formulário do país + lista de cidades dele
- `/admin/paises/:paisId/cidades/nova`, `/admin/cidades/:id` — formulário da cidade

## Próximos passos planejados
- Páginas públicas do país e da cidade, com URLs amigáveis (ex.: `/pais/pt`, `/pais/pt/lisboa`)
- Cadastro de links, textos e fotos (usar `enviarFoto`) no admin
- Tags nas cidades
