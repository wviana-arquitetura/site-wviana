import type { ProjectChapter } from "@/types/project";
import { Void } from "@/components/ui/void";

type ProjectNarrativeProps = {
  chapters: ProjectChapter[];
};

export function ProjectNarrative({ chapters }: ProjectNarrativeProps) {
  const showWatermark = chapters.length > 1;

  return (
    <section className="bg-background px-8 md:px-16 lg:px-24">
      <div className="mx-auto max-w-[1800px]">
        {chapters.map((chapter, i) => (
          <div key={i}>
            <article className="relative py-16 md:py-24">
              {showWatermark ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 top-8 select-none font-extrabold leading-none md:top-12"
                  style={{
                    fontSize: "clamp(4rem, 8vw, 10rem)",
                    color: "hsl(var(--accent) / 0.1)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              ) : null}

              <div className={`relative max-w-[680px] ${showWatermark ? "ml-0 md:ml-[20%]" : "mx-auto"}`}>
                {chapter.title ? (
                  <h2 className="reveal-rise text-architectural font-light text-foreground">
                    {chapter.title}
                  </h2>
                ) : null}
                <p
                  className={`reveal-illuminate text-body-lg leading-[1.7] text-muted-foreground ${
                    chapter.title ? "mt-6" : ""
                  }`}
                >
                  {chapter.content}
                </p>
              </div>
            </article>
            {i < chapters.length - 1 && <Void height="8vh" />}
          </div>
        ))}
      </div>
    </section>
  );
}
