-- =====================================================================
-- Banco de Destinos — ZERAR a estrutura para rodar os scripts de novo
-- ATENÇÃO: apaga todas as tabelas e dados do site. Use só agora, no início.
-- Pode rodar mais de uma vez sem erro.
-- =====================================================================

-- view
drop view if exists v_paises_resumo;

-- tabelas (inclui as da primeira versão: visitas, notas)
drop table if exists cidade_tags     cascade;
drop table if exists tags            cascade;
drop table if exists textos          cascade;
drop table if exists notas           cascade;
drop table if exists fotos           cascade;
drop table if exists links           cascade;
drop table if exists visitas         cascade;
drop table if exists cidades         cascade;
drop table if exists paises          cascade;
drop table if exists continentes     cascade;
drop table if exists administradores cascade;

-- funções
drop function if exists set_atualizado_em() cascade;
drop function if exists is_admin() cascade;

-- políticas do Storage (o bucket "fotos" pode ficar; o script recria/atualiza)
drop policy if exists "fotos: admin envia"    on storage.objects;
drop policy if exists "fotos: admin atualiza" on storage.objects;
drop policy if exists "fotos: admin apaga"    on storage.objects;
