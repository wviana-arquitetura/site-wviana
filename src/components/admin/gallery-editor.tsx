"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Maximize2 } from "lucide-react";
import { uploadImageAction } from "@/app/admin/_actions/upload";
import { GalleryLightbox } from "./gallery-lightbox";
import {
  compressImageForUpload,
  formatUploadSizeError,
  MAX_UPLOAD_BYTES,
} from "@/lib/image-compress";
import { Textarea } from "@/components/ui/textarea";

export type GalleryItem = {
  /** ID local (id do banco em edição, gerado em criação) */
  id: string;
  src: string;
  alt: string;
  /** BlurHash gerado no upload; null se não foi possível. Persiste no banco
   *  via replaceProjectGalleryAction. */
  blurHash?: string | null;
};

type GalleryEditorProps = {
  pathPrefix: string;
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
};

/** Tile temporário renderizado enquanto o arquivo correspondente sobe.
 *  `status: "uploading"` → fundo taupe + sweep + label. Some quando o upload
 *  termina e o GalleryItem real entra na lista. */
type PendingTile = {
  id: string;
  label: string;
  status: "uploading" | "failed";
};

export function GalleryEditor({ pathPrefix, items, onChange }: GalleryEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState<PendingTile[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(items, oldIndex, newIndex));
  };

  const onSelectFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const allFiles = Array.from(e.target.files ?? []);
    e.target.value = "";

    if (allFiles.length === 0) return;
    if (!pathPrefix) {
      toast.error("Salve o projeto primeiro pra subir imagens");
      return;
    }

    // Filtra arquivos acima do limite ANTES de começar o upload — assim o
    // usuário vê de uma vez quais foram rejeitados, em vez de descobrir um
    // a um durante o lote. Cada rejeitado vira um toast (até 3 visíveis).
    const files: File[] = [];
    const rejected: File[] = [];
    for (const f of allFiles) {
      if (f.size > MAX_UPLOAD_BYTES) rejected.push(f);
      else files.push(f);
    }
    for (const f of rejected.slice(0, 3)) toast.error(formatUploadSizeError(f));
    if (rejected.length > 3) {
      toast.error(`+ ${rejected.length - 3} arquivo(s) acima de 20 MB ignorados`);
    }
    if (files.length === 0) return;

    setUploading(true);

    // Cria um pending tile por arquivo já no início — o usuário vê todos
    // os "espaços" aparecerem imediatamente, com o fundo da marca e sweep,
    // em vez de só "..." durante 30s.
    const pendingIds = files.map(
      (_, i) => `pending-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
    );
    setPending(
      files.map((file, i) => ({
        id: pendingIds[i],
        label: file.name,
        status: "uploading" as const,
      })),
    );

    // Snapshot dos items reais no início — adicionamos cima dele e re-emitimos
    // a lista a cada sucesso (incremental). Usar `items` direto dentro do loop
    // daria stale closure.
    let runningItems = items;
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const pendingId = pendingIds[i];

      const compressed = await compressImageForUpload(file);
      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("pathPrefix", pathPrefix);
      const result = await uploadImageAction(formData);

      if (!result.ok) {
        toast.error(`${file.name}: ${result.error}`);
        // Marca o pending como failed pra dar feedback (o usuário pode fechar).
        setPending((prev) =>
          prev.map((p) =>
            p.id === pendingId ? { ...p, status: "failed" as const } : p,
          ),
        );
        continue;
      }

      // Sucesso: remove o pending, adiciona o item real e emite a lista atualizada.
      runningItems = [
        ...runningItems,
        {
          id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          src: result.url,
          alt: "",
          blurHash: result.blurHash,
        },
      ];
      onChange(runningItems);
      setPending((prev) => prev.filter((p) => p.id !== pendingId));
      successCount++;
    }

    setUploading(false);
    if (successCount > 0) {
      toast.success(`${successCount} imagem(ns) adicionada(s)`);
    }
  };

  const dismissFailedPending = (id: string) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const updateAlt = (id: string, alt: string) => {
    onChange(items.map((i) => (i.id === id ? { ...i, alt } : i)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-body text-muted-foreground">
          {items.length} imagem(ns) · arraste para reordenar
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="border px-6 py-3 text-caption uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
          style={{ borderColor: "hsl(var(--accent) / 0.4)" }}
        >
          {uploading ? "Enviando..." : "+ Adicionar imagens"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/webp,image/jpeg,image/png"
          multiple
          className="hidden"
          onChange={onSelectFiles}
        />
      </div>

      {items.length === 0 && pending.length === 0 ? (
        <div
          className="flex h-48 items-center justify-center border-2 border-dashed"
          style={{ borderColor: "hsl(var(--accent) / 0.4)" }}
        >
          <span className="text-body text-muted-foreground">
            Nenhuma imagem ainda.
          </span>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {items.map((item, index) => (
                <GallerySortableItem
                  key={item.id}
                  item={item}
                  index={index}
                  onRemove={removeItem}
                  onAltChange={updateAlt}
                  onExpand={() => setLightboxIndex(index)}
                />
              ))}
              {pending.map((p) => (
                <PendingGalleryTile
                  key={p.id}
                  tile={p}
                  onDismiss={() => dismissFailedPending(p.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <GalleryLightbox
        items={items}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
      />
    </div>
  );
}

function GallerySortableItem({
  item,
  index,
  onRemove,
  onAltChange,
  onExpand,
}: {
  item: GalleryItem;
  index: number;
  onRemove: (id: string) => void;
  onAltChange: (id: string, alt: string) => void;
  onExpand: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="group border p-3 space-y-3"
    >
      <div
        className="relative aspect-[4/3] w-full overflow-hidden bg-secondary cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <Image
          src={item.src}
          alt={item.alt || `Imagem ${index + 1}`}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover pointer-events-none"
        />
        <span
          className="absolute left-2 top-2 px-2 py-1 text-micro uppercase tracking-[0.18em]"
          style={{
            background: "hsl(var(--background) / 0.9)",
            color: "hsl(var(--foreground))",
          }}
        >
          {index + 1}
        </span>
        {/* Ampliar. Discreto: só aparece no hover do card (group) ou via foco
            por teclado. Fica fora da alça de arrastar — o pointer-down para de
            propagar pro dnd-kit, então o clique nunca vira um drag. */}
        <div className="absolute right-2 top-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onExpand}
            aria-label={`Ampliar imagem ${index + 1}`}
            className="peer flex h-7 w-7 items-center justify-center rounded-sm text-foreground/80 backdrop-blur-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/40"
            style={{ background: "hsl(var(--background) / 0.75)" }}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          {/* Tooltip: aparece ao passar o mouse no botão. */}
          <span
            className="pointer-events-none absolute right-0 top-full mt-1.5 whitespace-nowrap rounded-sm px-2 py-1 text-micro uppercase tracking-[0.18em] opacity-0 transition-opacity duration-150 peer-hover:opacity-100"
            style={{
              background: "hsl(var(--foreground))",
              color: "hsl(var(--background))",
            }}
          >
            Ampliar
          </span>
        </div>
      </div>
      <Textarea
        value={item.alt}
        onChange={(e) => onAltChange(item.id, e.target.value)}
        rows={2}
        placeholder="Descrição (alt text)"
        className="text-caption"
      />
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="w-full text-micro uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        Remover
      </button>
    </div>
  );
}

/** Renderiza o "espaço reservado" enquanto um arquivo está subindo, usando o
 *  mesmo idioma visual do site público (fundo taupe + sweep). Em caso de
 *  falha, vira um aviso clicável que se descarta. */
function PendingGalleryTile({
  tile,
  onDismiss,
}: {
  tile: PendingTile;
  onDismiss: () => void;
}) {
  const isFailed = tile.status === "failed";
  return (
    <div className="border p-3 space-y-3" aria-busy={!isFailed}>
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <span
          aria-hidden="true"
          data-loaded={isFailed ? "true" : "false"}
          className="iwr-skeleton pointer-events-none absolute inset-0"
        >
          {!isFailed && <span className="iwr-sweep" />}
        </span>
        {isFailed ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 text-center"
            style={{ background: "hsl(var(--background) / 0.85)" }}
          >
            <span className="text-caption uppercase tracking-[0.18em] text-foreground">
              Falhou
            </span>
            <button
              type="button"
              onClick={onDismiss}
              className="text-micro uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
            >
              Dispensar
            </button>
          </div>
        ) : (
          <span
            className="absolute left-2 top-2 px-2 py-1 text-micro uppercase tracking-[0.18em]"
            style={{
              background: "hsl(var(--background) / 0.9)",
              color: "hsl(var(--foreground))",
            }}
          >
            Enviando…
          </span>
        )}
      </div>
      <p
        className="truncate text-caption text-muted-foreground"
        title={tile.label}
      >
        {tile.label}
      </p>
    </div>
  );
}
