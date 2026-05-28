/**
 * Compressão de imagem no navegador, ANTES do upload. O OBJETIVO AQUI É SÓ
 * REDIMENSIONAR — pra evitar trafegar fotos de 10-20MB até a Server Action.
 * A compressão de verdade fica com o sharp no servidor (upload.ts), pra não
 * gerar perda dupla (generation loss): canvas q80 → sharp q80 destrói detalhe
 * fino (céus em degradê, sombras) sem ganho de tamanho. Por isso aqui usamos
 * q0.95 (quase-lossless) e o sharp depois aplica a qualidade final.
 */

const MAX_DIMENSION = 3200;
const WEBP_QUALITY = 0.95;

/** Acima disso o Next recusa o body da Server Action (next.config.ts:bodySizeLimit).
 *  Validamos antes pra dar mensagem amigável em vez de erro genérico de rede. */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export function formatUploadSizeError(file: File): string {
  const mb = (file.size / 1024 / 1024).toFixed(1);
  return `${file.name}: arquivo muito grande (${mb} MB). Tamanho máximo: 20 MB. Reduza a resolução ou exporte com mais compressão antes de enviar.`;
}

/**
 * Recebe o arquivo escolhido pelo usuário e devolve um File WebP comprimido.
 * Se algo falhar (formato exótico, navegador sem suporte), devolve o original
 * — o servidor ainda valida tipo/tamanho como rede de segurança.
 */
export async function compressImageForUpload(file: File): Promise<File> {
  // Só tenta comprimir imagens raster; SVG/gif animado etc. passam direto.
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;

    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
    );
    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}
