export type ProjectChapter = {
  title: string;
  content: string;
};

export type ProjectMetric = {
  label: string;
  value: string;
  description: string;
};

export type ProjectGalleryItem = {
  src: string;
  alt: string;
};

export type ProjectTestimonial = {
  quote: string;
  author: string;
  role: string;
};

export type Project = {
  slug: string;
  title: string;
  category: string;
  typology: "Residencial" | "Comercial" | "Corporativo";
  status: "Concluído" | "Em andamento";
  location: string;
  country: string;
  year?: string;
  area?: string;
  imageSrc: string;
  summary: string;
  scope: string[];
  client?: string;
  chapters: ProjectChapter[];
  metrics?: ProjectMetric[];
  gallery: ProjectGalleryItem[];
  testimonial?: ProjectTestimonial;
};
