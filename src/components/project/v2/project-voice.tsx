import type { ProjectTestimonial } from "@/types/project";

type ProjectVoiceProps = {
  testimonial: ProjectTestimonial;
};

export function ProjectVoice({ testimonial }: ProjectVoiceProps) {
  return (
    <section
      className="relative flex min-h-[80vh] items-center justify-center bg-background-warm px-8 py-24 md:px-16 md:py-32 lg:px-24"
    >
      {/* Decorative quote mark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-8 top-16 select-none font-extrabold leading-none md:left-16 lg:left-24"
        style={{
          fontSize: "clamp(6rem, 15vw, 20rem)",
          color: "hsl(var(--accent) / 0.08)",
        }}
      >
        &ldquo;
      </span>

      <blockquote className="relative mx-auto max-w-[900px] text-center">
        <p className="reveal-illuminate text-architectural font-light leading-[1.15] text-foreground">
          &ldquo;{testimonial.quote}&rdquo;
        </p>
        <footer className="mt-8">
          <span
            className="text-caption uppercase tracking-[0.18em]"
            style={{ color: "hsl(var(--accent-strong))" }}
          >
            {testimonial.author} — {testimonial.role}
          </span>
        </footer>
      </blockquote>
    </section>
  );
}
