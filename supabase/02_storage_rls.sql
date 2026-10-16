-- =====================================================================
-- Banco de Destinos — Storage de fotos + regras de acesso (RLS)
-- Rode DEPOIS do schema.sql, no SQL Editor do Supabase.
--
-- Regra geral: qualquer pessoa pode LER; só administradores EDITAM.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Quem é administrador
-- ---------------------------------------------------------------------
create table administradores (
  user_id  uuid primary key references auth.users(id) on delete cascade
);
alter table administradores enable row level security;
-- sem políticas: ninguém lê nem altera pela API, só pelo painel/SQL

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from administradores where user_id = auth.uid());
$$;
grant execute on function is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- 2) RLS nas tabelas: leitura pública, escrita só admin
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'continentes','paises','cidades','links','fotos','textos','tags','cidade_tags'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy "leitura publica" on %I for select to anon, authenticated using (true)', t);
    execute format(
      'create policy "escrita admin" on %I for all to authenticated using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

-- a view passa a respeitar o RLS de quem consulta
alter view v_paises_resumo set (security_invoker = true);

-- ---------------------------------------------------------------------
-- 3) Bucket de fotos
--    público para leitura, até 2 MB por arquivo, só imagens
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 2097152,
        array['image/webp','image/jpeg','image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Leitura: o bucket é público, então as URLs públicas já funcionam.
-- Escrita (enviar, substituir, apagar): só admin.
create policy "fotos: admin envia" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos' and is_admin());

create policy "fotos: admin atualiza" on storage.objects
  for update to authenticated
  using (bucket_id = 'fotos' and is_admin())
  with check (bucket_id = 'fotos' and is_admin());

create policy "fotos: admin apaga" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos' and is_admin());

-- ---------------------------------------------------------------------
-- 4) Depois de criar seu usuário (Authentication > Users > Add user),
--    copie o UUID dele e rode:
--
--    insert into administradores (user_id) values ('COLE-O-UUID-AQUI');
-- ---------------------------------------------------------------------
