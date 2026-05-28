#!/usr/bin/env node
/**
 * Backfill de BlurHash para projetos e galerias já existentes.
 *
 * Lê cada linha de `projects` e `project_gallery_images` que tem URL mas
 * NÃO tem blur_hash, baixa a imagem do Supabase Storage, gera o hash e
 * atualiza no banco.
 *
 * Idempotente: pode rodar quantas vezes quiser, só processa linhas pendentes.
 * Lê env vars do .env.local automaticamente (precisa de NEXT_PUBLIC_SUPABASE_URL
 * + SUPABASE_SERVICE_ROLE_KEY).
 *
 * Uso:
 *   node scripts/backfill-blurhash.mjs            # processa todas pendentes
 *   node scripts/backfill-blurhash.mjs --dry-run  # mostra o que faria, sem escrever
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { encode } from "blurhash";

// --- carrega .env.local manualmente (sem dep extra) ---
const envPath = join(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const [, key, rawValue] = m;
    if (process.env[key]) continue; // não sobrescreve
    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "[backfill] Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local",
  );
  process.exit(1);
}

const isDryRun = process.argv.includes("--dry-run");
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Mesmos parâmetros de src/lib/blurhash-server.ts.
const COMPONENTS_X = 4;
const COMPONENTS_Y = 3;
const SAMPLE_MAX = 32;

async function generateBlurHash(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} baixando ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const { data, info } = await sharp(buffer)
    .rotate()
    .resize({
      width: SAMPLE_MAX,
      height: SAMPLE_MAX,
      fit: "inside",
      withoutEnlargement: false,
    })
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });
  return encode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    COMPONENTS_X,
    COMPONENTS_Y,
  );
}

async function backfillProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("id, slug, image_src, image_blur_hash")
    .is("image_blur_hash", null)
    .not("image_src", "is", null);

  if (error) {
    console.error("[backfill] Erro lendo projects:", error.message);
    return;
  }
  console.log(`[backfill] ${data.length} capas pendentes`);

  for (const row of data) {
    try {
      console.log(`  · ${row.slug} (capa) …`);
      const hash = await generateBlurHash(row.image_src);
      if (isDryRun) {
        console.log(`    [dry-run] geraria: ${hash}`);
        continue;
      }
      const { error: upErr } = await supabase
        .from("projects")
        .update({ image_blur_hash: hash })
        .eq("id", row.id);
      if (upErr) {
        console.error(`    falhou: ${upErr.message}`);
      } else {
        console.log(`    ok: ${hash}`);
      }
    } catch (e) {
      console.error(`    falhou: ${e.message}`);
    }
  }
}

async function backfillGallery() {
  const { data, error } = await supabase
    .from("project_gallery_images")
    .select("id, src, blur_hash, project_id")
    .is("blur_hash", null)
    .not("src", "is", null);

  if (error) {
    console.error("[backfill] Erro lendo gallery:", error.message);
    return;
  }
  console.log(`[backfill] ${data.length} fotos de galeria pendentes`);

  for (const row of data) {
    try {
      const shortName = row.src.split("/").slice(-1)[0];
      console.log(`  · ${shortName} …`);
      const hash = await generateBlurHash(row.src);
      if (isDryRun) {
        console.log(`    [dry-run] geraria: ${hash}`);
        continue;
      }
      const { error: upErr } = await supabase
        .from("project_gallery_images")
        .update({ blur_hash: hash })
        .eq("id", row.id);
      if (upErr) {
        console.error(`    falhou: ${upErr.message}`);
      } else {
        console.log(`    ok: ${hash}`);
      }
    } catch (e) {
      console.error(`    falhou: ${e.message}`);
    }
  }
}

console.log(
  isDryRun
    ? "[backfill] DRY-RUN — nada será escrito no banco"
    : "[backfill] gravando no banco",
);

await backfillProjects();
await backfillGallery();
console.log("[backfill] fim");
