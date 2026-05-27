"use server";

import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";

const STORAGE_BUCKET = "project-images";
const ALLOWED_MIMES = ["image/webp", "image/jpeg", "image/png"];
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

export type UploadResult =
  | { ok: true; url: string }
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
      error: `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo 8MB.`,
    };
  }

  const safePrefix = sanitizeFilename(pathPrefix);
  const originalName = sanitizeFilename(file.name) || "image";
  const timestamp = Date.now();
  const storagePath = `${safePrefix}/${timestamp}-${originalName}`;

  const supabase = createSupabaseServiceRoleClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return { ok: true, url: data.publicUrl };
}
