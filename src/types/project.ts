export type ProjectChapter = {
  title: string;
  content: string;
};

export type ProjectGalleryItem = {
  src: string;
  alt: string;
  /** BlurHash string (~20-30 chars) — fonte do placeholder. Vem do banco.
   *  Pode ser undefined em legados sem backfill — front cai em fundo neutro. */
  blurHash?: string;
  /** data:image/png URL com a versão borrada da foto (32x32). Decodada do
   *  blurHash no server, embutida no HTML inicial. É o que faz o blur valer
   *  a pena (aparece antes da hidratação). Ver lib/blurhash-server.ts. */
  blurDataURL?: string;
};

export type Project = {
  slug: string;
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  imageAlt?: string;
  ogImageSrc?: string;
  category: string;
  typology: "Residencial" | "Comercial" | "Corporativo";
  status: "Concluído" | "Em andamento";
  location: string;
  country: string;
  year?: string;
  area?: string;
  /** Data ISO (YYYY-MM-DD) da ultima edicao do projeto. Usada no sitemap para sinalizar freshness ao Google. */
  updatedAt?: string;
  imageSrc: string;
  /** BlurHash da capa. Mesmo contrato de ProjectGalleryItem.blurHash. */
  imageBlurHash?: string;
  /** data:image/png da capa, decodada server-side (ver ProjectGalleryItem.blurDataURL). */
  imageBlurDataURL?: string;
  summary: string;
  scope: string[];
  services?: string[];
  areaServed?: string[];
  client?: string;
  chapters: ProjectChapter[];
  gallery: ProjectGalleryItem[];
};
