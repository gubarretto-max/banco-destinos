// Upload de fotos para o bucket "fotos" do Supabase,
// com redimensionamento e conversão para WebP no navegador.
//
// Uso:
//   const foto = await enviarFoto(supabase, arquivo, {
//     pasta: 'portugal/lisboa', cidadeId: '...', legenda: 'Alfama', fonteUrl: 'https://...'
//   });

import type { SupabaseClient } from '@supabase/supabase-js';

const LARGURA_MAX = 1600;   // px
const QUALIDADE = 0.8;      // 0 a 1

/** Redimensiona (sem aumentar) e converte para WebP. */
export async function comprimirImagem(arquivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, LARGURA_MAX / bitmap.width);
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao converter imagem'))),
      'image/webp',
      QUALIDADE,
    ),
  );
}

/** Gera um nome de arquivo seguro: "Praça do Comércio.JPG" -> "praca-do-comercio-k3f9a.webp" */
function nomeArquivo(original: string): string {
  const base = original
    .replace(/\.[^.]+$/, '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    .slice(0, 50) || 'foto';
  return `${base}-${Math.random().toString(36).slice(2, 7)}.webp`;
}

type Destino =
  | { paisId: string; cidadeId?: never }
  | { cidadeId: string; paisId?: never };

type Opcoes = Destino & {
  pasta: string;          // ex.: 'portugal/lisboa'
  legenda?: string;
  fonteUrl?: string;
  capa?: boolean;
};

/** Comprime, envia ao Storage e registra na tabela "fotos". */
export async function enviarFoto(supabase: SupabaseClient, arquivo: File, op: Opcoes) {
  const blob = await comprimirImagem(arquivo);
  const caminho = `${op.pasta.replace(/^\/|\/$/g, '')}/${nomeArquivo(arquivo.name)}`;

  const { error: erroUpload } = await supabase.storage
    .from('fotos')
    .upload(caminho, blob, { contentType: 'image/webp', cacheControl: '31536000' });
  if (erroUpload) throw erroUpload;

  const { data, error } = await supabase
    .from('fotos')
    .insert({
      pais_id: op.paisId ?? null,
      cidade_id: op.cidadeId ?? null,
      storage_path: caminho,
      legenda: op.legenda ?? null,
      fonte_url: op.fonteUrl ?? null,
      capa: op.capa ?? false,
    })
    .select()
    .single();

  if (error) {
    // desfaz o upload se o registro falhar, para não sobrar arquivo órfão
    await supabase.storage.from('fotos').remove([caminho]);
    throw error;
  }
  return data;
}

/** URL pública para usar no <img src>. */
export function urlFoto(supabase: SupabaseClient, foto: { storage_path: string | null; url_externa: string | null }) {
  if (foto.url_externa) return foto.url_externa;
  return supabase.storage.from('fotos').getPublicUrl(foto.storage_path!).data.publicUrl;
}

/** Apaga o arquivo e o registro. */
export async function apagarFoto(supabase: SupabaseClient, foto: { id: string; storage_path: string | null }) {
  if (foto.storage_path) {
    const { error } = await supabase.storage.from('fotos').remove([foto.storage_path]);
    if (error) throw error;
  }
  const { error } = await supabase.from('fotos').delete().eq('id', foto.id);
  if (error) throw error;
}
