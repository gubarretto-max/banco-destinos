-- =====================================================================
-- Banco de Destinos para viagens — estrutura (Supabase / PostgreSQL)
-- Foco: destinos que AINDA quero visitar.
-- Rode inteiro no SQL Editor do Supabase.
-- =====================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "unaccent";   -- busca sem acento

-- ---------------------------------------------------------------------
-- Continentes (tabela de apoio)
-- ---------------------------------------------------------------------
create table continentes (
  id    smallint primary key,
  nome  text not null unique
);

insert into continentes (id, nome) values
  (1, 'África'), (2, 'América do Norte'), (3, 'América Central e Caribe'),
  (4, 'América do Sul'), (5, 'Ásia'), (6, 'Europa'), (7, 'Oceania'),
  (8, 'Antártida');

-- ---------------------------------------------------------------------
-- Países
-- interesse: 1 = curiosidade ... 5 = quero muito ir
-- ---------------------------------------------------------------------
create table paises (
  id               uuid primary key default gen_random_uuid(),
  codigo_iso       char(2) not null unique,          -- 'PT', 'JP'
  nome             text    not null,                 -- nome em português
  nome_local       text,                             -- 'Nihon', 'Deutschland'
  continente_id    smallint references continentes(id),
  capital          text,
  idiomas          text[],                           -- {'Português'}
  moeda            text,                             -- 'Euro (EUR)'
  fuso_horario     text,
  tomada           text,                             -- 'Tipo F, 230V'
  visto            text,                             -- exigência p/ brasileiros
  melhor_epoca     text,
  resumo           text,                             -- texto curto p/ cards
  descricao        text,                             -- texto longo (markdown)
  interesse        smallint check (interesse between 1 and 5),
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now()
);
create index paises_interesse_idx on paises(interesse desc);

-- ---------------------------------------------------------------------
-- Cidades
-- ---------------------------------------------------------------------
create table cidades (
  id               uuid primary key default gen_random_uuid(),
  pais_id          uuid not null references paises(id) on delete cascade,
  nome             text not null,
  nome_local       text,
  regiao           text,                             -- estado/província
  latitude         numeric(9,6),
  longitude        numeric(9,6),
  melhor_epoca     text,
  dias_sugeridos   smallint check (dias_sugeridos > 0),
  resumo           text,
  descricao        text,
  interesse        smallint check (interesse between 1 and 5),
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now(),
  unique (pais_id, nome)
);
create index cidades_pais_idx      on cidades(pais_id);
create index cidades_interesse_idx on cidades(interesse desc);

-- ---------------------------------------------------------------------
-- Conteúdos ligados a um país OU a uma cidade
-- (exatamente um dos dois precisa estar preenchido)
-- ---------------------------------------------------------------------

-- Links / sites úteis
create table links (
  id          uuid primary key default gen_random_uuid(),
  pais_id     uuid references paises(id)  on delete cascade,
  cidade_id   uuid references cidades(id) on delete cascade,
  titulo      text not null,
  url         text not null,
  categoria   text check (categoria in
              ('oficial','guia','hospedagem','restaurante','transporte',
               'passeio','video','blog','outro')),
  observacao  text,
  criado_em   timestamptz not null default now(),
  check (num_nonnulls(pais_id, cidade_id) = 1)
);

-- Fotos: aceita arquivo no Supabase Storage OU link externo
create table fotos (
  id             uuid primary key default gen_random_uuid(),
  pais_id        uuid references paises(id)  on delete cascade,
  cidade_id      uuid references cidades(id) on delete cascade,
  storage_path   text,     -- ex.: 'portugal/lisboa/alfama.webp' (bucket 'fotos')
  url_externa    text,     -- ex.: link do Cloudinary / outro serviço
  fonte_url      text,     -- página onde a foto foi encontrada (crédito)
  legenda        text,
  capa           boolean not null default false,
  ordem          smallint not null default 0,
  criado_em      timestamptz not null default now(),
  check (num_nonnulls(pais_id, cidade_id) = 1),
  check (num_nonnulls(storage_path, url_externa) = 1)
);
-- no máximo uma foto de capa por país e por cidade
create unique index fotos_capa_pais_uq   on fotos(pais_id)   where capa and pais_id   is not null;
create unique index fotos_capa_cidade_uq on fotos(cidade_id) where capa and cidade_id is not null;

-- Textos livres (dicas, roteiro, comidas típicas, custos...)
create table textos (
  id          uuid primary key default gen_random_uuid(),
  pais_id     uuid references paises(id)  on delete cascade,
  cidade_id   uuid references cidades(id) on delete cascade,
  titulo      text not null,
  conteudo    text not null,              -- markdown
  tipo        text check (tipo in
              ('dica','roteiro','comida','cultura','seguranca','custo','outro')),
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  check (num_nonnulls(pais_id, cidade_id) = 1)
);

create index links_pais_idx    on links(pais_id);
create index links_cidade_idx  on links(cidade_id);
create index fotos_pais_idx    on fotos(pais_id);
create index fotos_cidade_idx  on fotos(cidade_id);
create index textos_pais_idx   on textos(pais_id);
create index textos_cidade_idx on textos(cidade_id);

-- ---------------------------------------------------------------------
-- Tags (praia, montanha, gastronomia, inverno...)
-- ---------------------------------------------------------------------
create table tags (
  id    serial primary key,
  nome  text not null unique
);

create table cidade_tags (
  cidade_id  uuid references cidades(id) on delete cascade,
  tag_id     int  references tags(id)    on delete cascade,
  primary key (cidade_id, tag_id)
);

-- ---------------------------------------------------------------------
-- atualizado_em automático
-- ---------------------------------------------------------------------
create or replace function set_atualizado_em() returns trigger as $$
begin
  new.atualizado_em := now();
  return new;
end $$ language plpgsql;

create trigger paises_upd  before update on paises  for each row execute function set_atualizado_em();
create trigger cidades_upd before update on cidades for each row execute function set_atualizado_em();
create trigger textos_upd  before update on textos  for each row execute function set_atualizado_em();

-- ---------------------------------------------------------------------
-- View para a listagem principal (ordenada por interesse)
-- ---------------------------------------------------------------------
create view v_paises_resumo as
select
  p.id, p.codigo_iso, p.nome, c.nome as continente, p.interesse, p.resumo,
  count(ci.id)                      as total_cidades,
  max(ci.interesse)                 as maior_interesse_cidade,
  (select coalesce(f.url_externa, f.storage_path)
     from fotos f where f.pais_id = p.id and f.capa limit 1) as foto_capa
from paises p
left join continentes c on c.id = p.continente_id
left join cidades ci    on ci.pais_id = p.id
group by p.id, c.nome
order by p.interesse desc nulls last, p.nome;

-- ---------------------------------------------------------------------
-- Dados de exemplo (pode apagar)
-- ---------------------------------------------------------------------
insert into paises (codigo_iso, nome, continente_id, capital, idiomas, moeda, interesse)
values ('PT', 'Portugal', 6, 'Lisboa', '{Português}', 'Euro (EUR)', 4);

insert into cidades (pais_id, nome, latitude, longitude, dias_sugeridos, interesse)
select id, 'Lisboa', 38.722252, -9.139337, 4, 5 from paises where codigo_iso = 'PT';
