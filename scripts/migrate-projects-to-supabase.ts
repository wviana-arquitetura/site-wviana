/**
 * Migração one-shot do projects.json + imagens locais para o Supabase.
 *
 * - Faz upload das imagens em public/images/projects/<slug>/* para Storage
 * - Insere cada projeto na tabela `projects` com status `published`
 * - Insere as imagens de galeria em `project_gallery_images`
 * - Cria os 3 destaques iniciais em `home_featured`
 *
 * Idempotente: se rodar de novo, atualiza por slug (upsert) e re-upload
 * sobrescreve imagens com mesmo nome.
 *
 * Como rodar:
 *   npm run migrate:projects
 *
 * Pré-requisitos:
 *   - SUPABASE_SERVICE_ROLE_KEY e NEXT_PUBLIC_SUPABASE_URL em .env.local
 *   - Schema 0001_initial_schema.sql aplicado no Supabase
 *   - Bucket `project-images` criado (parte do schema)
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import projectsData from "../src/data/projects.json" with { type: "json" };
import type { Project } from "../src/types/project";

// Carrega .env.local manualmente (não roda em ambiente Next.js)
config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error(
    "❌ Faltam variáveis: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY. Configure em .env.local.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const projects = projectsData as Project[];

const STORAGE_BUCKET = "project-images";

const HOME_FEATURED_SLUGS = ["residencial-rc", "residencial-pl", "residencial-tn"];

const MIME_FOR_EXT: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

function logStep(label: string) {
  console.log(`\n▸ ${label}`);
}

function getMime(filePath: string): string {
  const ext = filePath.toLowerCase().match(/\.[^.]+$/)?.[0] ?? "";
  return MIME_FOR_EXT[ext] ?? "application/octet-stream";
}

/**
 * Faz upload de um arquivo local pro Supabase Storage e retorna a URL pública.
 * Se já existe no bucket, sobrescreve (upsert: true).
 */
async function uploadImage(
  localPath: string,
  storagePath: string,
): Promise<string> {
  const file = readFileSync(localPath);
  const contentType = getMime(localPath);

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Falha no upload de ${storagePath}: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

/**
 * Mapeia um path local do JSON (ex: "/images/projects/residencial-tn/capa-projeto-residencial-tn.webp")
 * para um path do bucket Storage (ex: "residencial-tn/capa-projeto-residencial-tn.webp").
 */
function localPathToStoragePath(localImageSrc: string): string {
  // Remove "/images/projects/" do início
  return localImageSrc.replace(/^\/images\/projects\//, "");
}

/**
 * Resolve o caminho absoluto do arquivo em public/.
 */
function resolveLocalFile(localImageSrc: string): string {
  // localImageSrc começa com "/images/projects/..."
  return join("public", localImageSrc.replace(/^\//, ""));
}

async function uploadProjectImages(project: Project): Promise<{
  coverUrl: string;
  galleryUrls: Array<{ src: string; alt: string }>;
}> {
  console.log(`  ↳ uploading images for ${project.slug}...`);

  // Cover
  const coverLocal = resolveLocalFile(project.imageSrc);
  if (!existsSync(coverLocal)) {
    throw new Error(`Imagem de capa não encontrada: ${coverLocal}`);
  }
  const coverStoragePath = localPathToStoragePath(project.imageSrc);
  const coverUrl = await uploadImage(coverLocal, coverStoragePath);

  // Gallery
  const galleryUrls: Array<{ src: string; alt: string }> = [];
  for (const item of project.gallery) {
    const localFile = resolveLocalFile(item.src);
    if (!existsSync(localFile)) {
      console.warn(`    ⚠️  Imagem de galeria não encontrada: ${localFile}`);
      continue;
    }
    const storagePath = localPathToStoragePath(item.src);
    const url = await uploadImage(localFile, storagePath);
    galleryUrls.push({ src: url, alt: item.alt });
  }

  console.log(`    ✓ ${1 + galleryUrls.length} imagens enviadas`);

  return { coverUrl, galleryUrls };
}

async function upsertProject(
  project: Project,
  coverUrl: string,
  displayOrder: number,
): Promise<string> {
  const row = {
    slug: project.slug,
    title: project.title,
    category: project.category,
    typology: project.typology,
    status_label: project.status,
    location: project.location,
    country: project.country,
    area: project.area ?? null,
    year: project.year ?? null,
    client: project.client ?? null,
    image_src: coverUrl,
    image_alt: project.imageAlt ?? null,
    og_image_src: project.ogImageSrc ?? null,
    summary: project.summary,
    scope: project.scope,
    services: project.services ?? null,
    area_served: project.areaServed ?? null,
    chapters: project.chapters,
    seo_title: project.seoTitle ?? null,
    seo_description: project.seoDescription ?? null,
    published_status: "published" as const,
    display_order: displayOrder,
  };

  const { data, error } = await supabase
    .from("projects")
    .upsert(row, { onConflict: "slug" })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Falha ao inserir projeto ${project.slug}: ${error?.message}`);
  }

  return data.id;
}

async function replaceGallery(
  projectId: string,
  galleryUrls: Array<{ src: string; alt: string }>,
) {
  // Limpa galeria existente desse projeto
  const { error: deleteError } = await supabase
    .from("project_gallery_images")
    .delete()
    .eq("project_id", projectId);

  if (deleteError) {
    throw new Error(`Falha ao limpar galeria de ${projectId}: ${deleteError.message}`);
  }

  if (galleryUrls.length === 0) return;

  const rows = galleryUrls.map((item, index) => ({
    project_id: projectId,
    src: item.src,
    alt: item.alt,
    position: index,
  }));

  const { error: insertError } = await supabase
    .from("project_gallery_images")
    .insert(rows);

  if (insertError) {
    throw new Error(`Falha ao inserir galeria de ${projectId}: ${insertError.message}`);
  }
}

async function setHomeFeatured(slugToId: Map<string, string>) {
  // Limpa tabela
  const { error: deleteError } = await supabase
    .from("home_featured")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (deleteError) {
    throw new Error(`Falha ao limpar home_featured: ${deleteError.message}`);
  }

  const rows = HOME_FEATURED_SLUGS.map((slug, index) => {
    const projectId = slugToId.get(slug);
    if (!projectId) {
      throw new Error(`Slug em destaque não encontrado: ${slug}`);
    }
    return { project_id: projectId, position: index + 1 };
  });

  const { error: insertError } = await supabase
    .from("home_featured")
    .insert(rows);

  if (insertError) {
    throw new Error(`Falha ao inserir home_featured: ${insertError.message}`);
  }
}

async function main() {
  console.log("=== Migração projects.json → Supabase ===");
  console.log(`Total de projetos no JSON: ${projects.length}`);
  console.log(`Bucket de imagens: ${STORAGE_BUCKET}`);

  const slugToId = new Map<string, string>();

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i]!;
    logStep(`[${i + 1}/${projects.length}] ${project.slug} — ${project.title}`);

    const { coverUrl, galleryUrls } = await uploadProjectImages(project);
    const projectId = await upsertProject(project, coverUrl, i);
    await replaceGallery(projectId, galleryUrls);
    slugToId.set(project.slug, projectId);

    console.log(`  ✓ projeto ${project.slug} migrado (id: ${projectId})`);
  }

  logStep("Configurando home_featured (3 destaques)");
  await setHomeFeatured(slugToId);
  console.log(`  ✓ destaques: ${HOME_FEATURED_SLUGS.join(", ")}`);

  console.log("\n✅ Migração concluída com sucesso!");
}

main().catch((error) => {
  console.error("\n❌ Erro durante a migração:");
  console.error(error);
  process.exit(1);
});
