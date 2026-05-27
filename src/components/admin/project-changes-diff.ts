import type { ProjectFormValues } from "@/app/admin/_actions/projects";
import type { GalleryItem } from "./gallery-editor";

export type ChangeEntry = {
  field: string;
  before: string;
  after: string;
  kind: "modified" | "added" | "removed";
};

const FIELD_LABELS: Record<string, string> = {
  slug: "Slug (URL)",
  title: "Título",
  category: "Categoria",
  typology: "Tipologia",
  status_label: "Status",
  location: "Localização",
  country: "País/Estado",
  area: "Área",
  year: "Ano",
  client: "Cliente",
  image_src: "Imagem de capa",
  image_alt: "Alt da capa",
  og_image_src: "Imagem OG",
  summary: "Resumo",
  scope: "Escopo de serviços",
  services: "Serviços (schema)",
  area_served: "Áreas atendidas (schema)",
  seo_title: "SEO title",
  seo_description: "SEO description",
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "(vazio)";
  if (Array.isArray(value)) {
    return value.length === 0 ? "(vazio)" : value.join(", ");
  }
  if (typeof value === "string") {
    return value.length > 80 ? value.slice(0, 80) + "…" : value;
  }
  return String(value);
}

function arraysEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

function isImageUrl(value: unknown): value is string {
  return typeof value === "string" && /^https?:\/\//.test(value) && /\.(webp|jpe?g|png)/i.test(value);
}

/**
 * Compara dois snapshots de `ProjectFormValues` e retorna lista de alterações
 * legíveis em português. Pula campos iguais.
 */
export function diffProjectValues(
  before: ProjectFormValues,
  after: ProjectFormValues,
): ChangeEntry[] {
  const changes: ChangeEntry[] = [];

  const simpleKeys: Array<keyof ProjectFormValues> = [
    "slug",
    "title",
    "category",
    "typology",
    "status_label",
    "location",
    "country",
    "area",
    "year",
    "client",
    "image_src",
    "image_alt",
    "og_image_src",
    "summary",
    "seo_title",
    "seo_description",
  ];

  for (const key of simpleKeys) {
    const b = before[key] ?? null;
    const a = after[key] ?? null;
    if (b === a) continue;
    changes.push({
      field: FIELD_LABELS[key as string] ?? (key as string),
      before: formatValue(b),
      after: formatValue(a),
      kind: !b && a ? "added" : b && !a ? "removed" : "modified",
    });
  }

  // Arrays
  const arrayKeys: Array<keyof ProjectFormValues> = [
    "scope",
    "services",
    "area_served",
  ];
  for (const key of arrayKeys) {
    const b = (before[key] ?? []) as string[];
    const a = (after[key] ?? []) as string[];
    if (arraysEqual(b, a)) continue;
    changes.push({
      field: FIELD_LABELS[key as string] ?? (key as string),
      before: formatValue(b),
      after: formatValue(a),
      kind: b.length === 0 ? "added" : a.length === 0 ? "removed" : "modified",
    });
  }

  // Chapters — comparação resumida por título e conteúdo
  const beforeChapters = before.chapters ?? [];
  const afterChapters = after.chapters ?? [];
  const chaptersDifferent =
    beforeChapters.length !== afterChapters.length ||
    beforeChapters.some(
      (c, i) =>
        c.title !== afterChapters[i]?.title ||
        c.content !== afterChapters[i]?.content,
    );
  if (chaptersDifferent) {
    if (beforeChapters.length !== afterChapters.length) {
      changes.push({
        field: "Capítulos",
        before: `${beforeChapters.length} capítulo(s)`,
        after: `${afterChapters.length} capítulo(s)`,
        kind: "modified",
      });
    } else {
      // Mesmo número, conteúdo mudou
      for (let i = 0; i < beforeChapters.length; i++) {
        const b = beforeChapters[i]!;
        const a = afterChapters[i]!;
        if (b.title !== a.title) {
          changes.push({
            field: `Capítulo ${i + 1} — título`,
            before: formatValue(b.title),
            after: formatValue(a.title),
            kind: "modified",
          });
        }
        if (b.content !== a.content) {
          changes.push({
            field: `Capítulo ${i + 1} — conteúdo`,
            before: formatValue(b.content),
            after: formatValue(a.content),
            kind: "modified",
          });
        }
      }
    }
  }

  return changes;
}

/**
 * Compara duas galerias e retorna mudanças (adições, remoções, reordenações,
 * alterações de alt text).
 */
export function diffGallery(
  before: GalleryItem[],
  after: GalleryItem[],
): ChangeEntry[] {
  const changes: ChangeEntry[] = [];

  const beforeBySrc = new Map(before.map((i) => [i.src, i]));
  const afterBySrc = new Map(after.map((i) => [i.src, i]));

  // Adições
  const added = after.filter((i) => !beforeBySrc.has(i.src));
  if (added.length > 0) {
    changes.push({
      field: "Galeria — adições",
      before: "—",
      after: `${added.length} nova(s) imagem(ns)`,
      kind: "added",
    });
  }

  // Remoções
  const removed = before.filter((i) => !afterBySrc.has(i.src));
  if (removed.length > 0) {
    changes.push({
      field: "Galeria — remoções",
      before: `${removed.length} imagem(ns)`,
      after: "removidas",
      kind: "removed",
    });
  }

  // Alterações em alt text
  let altChanges = 0;
  for (const beforeItem of before) {
    const afterItem = afterBySrc.get(beforeItem.src);
    if (afterItem && afterItem.alt !== beforeItem.alt) {
      altChanges++;
    }
  }
  if (altChanges > 0) {
    changes.push({
      field: "Galeria — alt texts",
      before: "—",
      after: `${altChanges} descrição(ões) alterada(s)`,
      kind: "modified",
    });
  }

  // Reordenação (mesma quantidade, mesmos srcs, ordem diferente)
  if (added.length === 0 && removed.length === 0) {
    const beforeSrcs = before.map((i) => i.src);
    const afterSrcs = after.map((i) => i.src);
    if (!arraysEqual(beforeSrcs, afterSrcs)) {
      changes.push({
        field: "Galeria — ordem",
        before: "—",
        after: "ordem alterada",
        kind: "modified",
      });
    }
  }

  return changes;
}

export { isImageUrl };
