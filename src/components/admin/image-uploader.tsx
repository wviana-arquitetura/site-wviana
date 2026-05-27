"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { uploadImageAction } from "@/app/admin/_actions/upload";

type ImageUploaderProps = {
  /** Slug do projeto, usado como pasta no Storage. */
  pathPrefix: string;
  /** URL atual (se já tem imagem). */
  value?: string | null;
  /** Callback quando upload finaliza com sucesso. */
  onUploaded: (url: string) => void;
  /** Label exibido no botão / dropzone. */
  label?: string;
  /** Aspect ratio CSS (ex: "16/9", "4/5"). */
  aspect?: string;
};

export function ImageUploader({
  pathPrefix,
  value,
  onUploaded,
  label = "Solte uma imagem aqui ou clique para selecionar",
  aspect = "4/5",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!pathPrefix) {
        toast.error("Defina o slug do projeto antes de subir imagens");
        return;
      }

      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pathPrefix", pathPrefix);

      const result = await uploadImageAction(formData);
      setUploading(false);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Imagem enviada");
      onUploaded(result.url);
    },
    [pathPrefix, onUploaded],
  );

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        disabled={uploading}
        className="relative block w-full overflow-hidden border-2 border-dashed transition-colors disabled:opacity-60"
        style={{
          aspectRatio: aspect,
          borderColor: dragOver
            ? "hsl(var(--accent-strong))"
            : "hsl(var(--accent) / 0.4)",
          background: dragOver ? "hsl(var(--accent) / 0.08)" : undefined,
        }}
      >
        {value ? (
          <>
            <Image
              src={value}
              alt="Imagem atual"
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 transition-opacity hover:opacity-100">
              <span className="text-caption uppercase tracking-[0.18em] text-background">
                {uploading ? "Enviando..." : "Trocar imagem"}
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <span className="text-body text-foreground">
              {uploading ? "Enviando..." : label}
            </span>
            <span className="mt-2 text-micro uppercase tracking-[0.18em] text-muted-foreground">
              WebP, JPEG ou PNG · até 8MB
            </span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/webp,image/jpeg,image/png"
        className="hidden"
        onChange={onSelect}
      />
    </div>
  );
}
