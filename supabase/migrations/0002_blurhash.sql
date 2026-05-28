-- =============================================================================
-- Adiciona blur_hash em projetos e galeria
-- =============================================================================
-- BlurHash é uma string curta (~20-30 chars) que codifica uma versão minúscula
-- e borrada da imagem. Decodada no cliente em data:image SVG/canvas, serve
-- como placeholder enquanto a foto carrega — mostra cores e formas
-- principais sem peso. Ver docs/blurhash.md e src/lib/blurhash.ts.
--
-- nullable em ambas: legado (imagens migradas) pode ter null até backfill;
-- o front faz fallback elegante (fundo neutro) se vier null.

alter table public.projects
  add column if not exists image_blur_hash text;

alter table public.project_gallery_images
  add column if not exists blur_hash text;

comment on column public.projects.image_blur_hash is
  'BlurHash string da capa (gerado no upload via lib/blurhash-server.ts). Placeholder progressivo enquanto a foto carrega.';

comment on column public.project_gallery_images.blur_hash is
  'BlurHash string da imagem da galeria. Mesma lógica de placeholder progressivo.';
