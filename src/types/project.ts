export type ProjectChapter = {
  title: string;
  content: string;
};

export type ProjectGalleryItem = {
  src: string;
  alt: string;
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
  summary: string;
  scope: string[];
  services?: string[];
  areaServed?: string[];
  client?: string;
  chapters: ProjectChapter[];
  gallery: ProjectGalleryItem[];
};
