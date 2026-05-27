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
import { uploadImageAction } from "@/app/admin/_actions/upload";
import { Textarea } from "@/components/ui/textarea";

export type GalleryItem = {
  /** ID local (id do banco em edição, gerado em criação) */
  id: string;
  src: string;
  alt: string;
};

type GalleryEditorProps = {
  pathPrefix: string;
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
};

export function GalleryEditor({ pathPrefix, items, onChange }: GalleryEditorProps) {
  const [uploading, setUploading] = useState(false);
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
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";

    if (files.length === 0) return;
    if (!pathPrefix) {
      toast.error("Salve o projeto primeiro pra subir imagens");
      return;
    }

    setUploading(true);
    const newItems: GalleryItem[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pathPrefix", pathPrefix);
      const result = await uploadImageAction(formData);
      if (!result.ok) {
        toast.error(`${file.name}: ${result.error}`);
        continue;
      }
      newItems.push({
        id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        src: result.url,
        alt: "",
      });
    }
    setUploading(false);

    if (newItems.length > 0) {
      onChange([...items, ...newItems]);
      toast.success(`${newItems.length} imagem(ns) adicionada(s)`);
    }
  };

  const removeItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const updateAlt = (id: string, alt: string) => {
    onChange(items.map((i) => (i.id === id ? { ...i, alt } : i)));
  };

  return (
    <div className="space-y-6">
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

      {items.length === 0 ? (
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
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function GallerySortableItem({
  item,
  index,
  onRemove,
  onAltChange,
}: {
  item: GalleryItem;
  index: number;
  onRemove: (id: string) => void;
  onAltChange: (id: string, alt: string) => void;
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
      className="border p-3 space-y-3"
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
