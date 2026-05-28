"use server";

import sharp from "sharp";
import { generateBlurHash } from "@/lib/blurhash-server";
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";

const STORAGE_BUCKET = "project-images";
const ALLOWED_MIMES = ["image/webp", "image/jpeg", "image/png"];
const MAX_SIZE = 15 * 1024 * 1024; // 15MB — arquivo pós-canvas q0.95 a 3200px pode pesar bem mais que antes (q0.8 a 2400px).

// O sharp é a ÚNICA fonte de verdade da compressão final. O canvas no navegador
// só redimensiona (ver image-compress.ts). Portfolio de arquitetura → q85 + teto
// 3200px (telas retina/4K servidas com folga; calibrado pelo diagnóstico).
const MAX_DIMENSION = 3200;
const WEBP_QUALITY = 85;
const CACHE_CONTROL_SECONDS = "31536000";

export type UploadResult =
  | { ok: true; url: string; blurHash: string | null }
  | { ok: false; error: string };

async function requireAdminId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  return data ? user.id : null;
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Upload de imagem pra Supabase Storage.
 * `pathPrefix` é o slug do projeto (ex: "residencial-rc").
 */
export async function uploadImageAction(
  formData: FormData,
): Promise<UploadResult> {
  const userId = await requireAdminId();
  if (!userId) return { ok: false, error: "Não autorizado" };

  const file = formData.get("file") as File | null;
  const pathPrefix = formData.get("pathPrefix") as string | null;

  if (!file) return { ok: false, error: "Nenhum arquivo enviado" };
  if (!pathPrefix) return { ok: false, error: "pathPrefix ausente" };

  if (!ALLOWED_MIMES.includes(file.type)) {
    return {
      ok: false,
      error: `Tipo de arquivo não suportado (${file.type}). Use WebP, JPEG ou PNG.`,
    };
  }
  if (file.size > MAX_SIZE) {
    return {
      ok: false,
      error: `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo 15MB.`,
    };
  }

  const safePrefix = sanitizeFilename(pathPrefix);
  // Sempre recodificamos pra WebP, então o nome final leva extensão .webp
  // (independente do upload ter sido jpg/png).
  const baseName =
    sanitizeFilename(file.name.replace(/\.[^.]+$/, "")) || "image";
  const timestamp = Date.now();
  const storagePath = `${safePrefix}/${timestamp}-${baseName}.webp`;

  const supabase = createSupabaseServiceRoleClient();
  const original = Buffer.from(await file.arrayBuffer());

  // Comprime: reescala o lado maior pra no máx 2400px (sem ampliar) e recodifica
  // em WebP q80 — mesma política do script de migração.
  const compressed = await sharp(original)
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  // BlurHash em paralelo ao upload: a partir do mesmo Buffer comprimido, mas
  // gerado pelo sharp interno (sample 32px). Se falhar, devolve null e o front
  // mostra fundo neutro — não bloqueia o upload.
  const [uploadResult, blurHash] = await Promise.all([
    supabase.storage.from(STORAGE_BUCKET).upload(storagePath, compressed, {
      contentType: "image/webp",
      cacheControl: CACHE_CONTROL_SECONDS,
      upsert: false,
    }),
    generateBlurHash(compressed),
  ]);

  if (uploadResult.error) {
    return { ok: false, error: uploadResult.error.message };
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return { ok: true, url: data.publicUrl, blurHash };
}
