import Image from "next/image";
import type { ProjectGalleryItem } from "@/types/project";

type ProjectDocumentationProps = {
  gallery: ProjectGalleryItem[];
  slug: string;
};

export function ProjectDocumentation({ gallery, slug }: ProjectDocumentationProps) {
  return (
    <section className="bg-background">
      <div className="px-8 pb-8 md:px-16 md:pb-12 lg:px-24">
        <div className="mx-auto max-w-[1800px]">
          <span
            className="reveal-illuminate text-micro uppercase tracking-[0.22em]"
            style={{ color: "hsl(var(--accent))" }}
          >
            Galeria
          </span>
        </div>
      </div>
      <div className="px-8 pb-16 md:px-16 md:pb-24 lg:px-24">
        <div className="mx-auto grid max-w-[1800px] grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {gallery.map((item, i) => (
            <div
              key={`${slug}-gallery-${i}`}
              className="reveal-curtain relative aspect-[2/3] w-full overflow-hidden"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-top"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
