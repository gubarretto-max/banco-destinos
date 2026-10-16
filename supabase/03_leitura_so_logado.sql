-- =====================================================================
-- 03 — Leitura só para usuários logados
-- Antes: qualquer pessoa (anon) podia ler o conteúdo pela API.
-- Agora: só quem fez login lê; escrita continua só para administradores.
-- Rode no SQL Editor do Supabase. Pode rodar mais de uma vez.
-- =====================================================================

do $$
declare t text;
begin
  foreach t in array array[
    'continentes','paises','cidades','links','fotos','textos','tags','cidade_tags'
  ] loop
    execute format('drop policy if exists "leitura publica" on %I', t);
    execute format('drop policy if exists "leitura logado" on %I', t);
    execute format(
      'create policy "leitura logado" on %I for select to authenticated using (true)', t);
  end loop;
end $$;

-- Observação: o bucket "fotos" continua público. Quem tiver o link exato de
-- uma foto consegue abri-la, mas não há como listar as fotos sem login.
