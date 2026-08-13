"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { projectWhatsappUrl } from "@/lib/whatsapp";
import type { Project } from "@/types/project";

type ProjectActionsProps = {
  project: Project;
  /** Prefixo do `cta_location` no analytics (ex.: "home_gallery"). */
  location: string;
  /** Posição do projeto na listagem, 1-based — mede quais puxam mais contato. */
  position?: number;
};

/**
 * `inline-lg` — empilha e vira linha única no lg (card largo da home).
 * `stacked`   — nunca vira linha. No grid de /projetos a coluna de texto tem
 *               ~290px (metade da tela dividida em dois cards) e o par não cabe
 *               em nenhuma largura; com `whitespace-nowrap` isso transbordaria.
 * Classes literais: o scanner do Tailwind não resolve string montada.
 */
const ROW_LAYOUT = {
  "inline-lg":
    "flex flex-col gap-1 md:items-start lg:flex-row lg:items-center lg:gap-6",
  stacked: "flex flex-col gap-1 md:items-start",
} as const;

type ProjectActionsLayout = keyof typeof ROW_LAYOUT;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-4 focus-visible:ring-offset-background";

const projectAnalyticsParams = (project: Project, position?: number) => ({
  project_slug: project.slug,
  project_name: project.title,
  project_type: project.typology,
  project_position: position,
});

/**
 * Par de ações no pé do card: "Ver projeto" (aprofundar) e "Solicite um
 * orçamento" (contato). Mesma escala tipográfica; a hierarquia vem do
 * contraste — taupe para explorar, tinta preta + fio para o contato, que é o
 * fim de linha da coluna. Sem verde: o WhatsApp entra como glifo, não como marca.
 */
export function ProjectActions({
  project,
  location,
  position,
  layout = "inline-lg",
  className = "",
}: ProjectActionsProps & {
  layout?: ProjectActionsLayout;
  /** Posicionamento no container do card (ex.: `md:mt-auto` pra ancorar no pé). */
  className?: string;
}) {
  const projectParams = projectAnalyticsParams(project, position);

  return (
    // Empilhado por padrão; quando vira linha única, é só no lg — abaixo disso a
    // coluna de texto é estreita demais e os dois rótulos quebram no meio.
    // Sem `items-start` no mobile, o stretch dá área de toque de largura total;
    // do md pra cima a área volta a ser do tamanho do texto (mouse).
    <div className={`reveal-illuminate ${ROW_LAYOUT[layout]} ${className}`}>
      <Link
        href={`/projetos/${project.slug}`}
        onClick={() =>
          trackEvent("project_cta_click", {
            ...projectParams,
            cta_location: `${location}_link`,
          })
        }
        className={`group/link inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap text-caption uppercase tracking-[0.18em] transition-opacity hover:opacity-60 active:opacity-60 ${FOCUS_RING}`}
        style={{ color: "hsl(var(--accent-strong))" }}
      >
        Ver projeto
        {/* Três cards por página: sem isso, o leitor de tela anuncia
            "Ver projeto" idêntico nos três. */}
        <span className="sr-only">{project.title}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="transition-transform duration-300 ease-out group-hover/link:translate-x-1 motion-reduce:transition-none"
        >
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      {layout === "inline-lg" && (
        <span
          aria-hidden="true"
          className="hidden h-3 w-px lg:block"
          style={{ background: "hsl(var(--accent) / 0.4)" }}
        />
      )}

      <ProjectContactCta
        project={project}
        location={location}
        position={position}
      />
    </div>
  );
}

/**
 * Só o CTA de contato, sem o par. Usado onde "Ver projeto" não faz sentido —
 * a própria página do projeto. Fica com largura de conteúdo (nunca esticado):
 * fora do card ele vive num container largo, e uma área de hover de 1800px
 * dispararia o fio a meia tela de distância do texto.
 */
export function ProjectContactCta({
  project,
  location,
  position,
}: ProjectActionsProps) {
  return (
    <a
      href={projectWhatsappUrl(project)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        // Mesmo evento dos outros CTAs de WhatsApp (segue como conversão
        // secundária no Ads); o recorte por projeto vem nos parâmetros.
        // Sem o texto da mensagem no link_path — ver docs/ANALYTICS_TRACKING.md.
        trackEvent("whatsapp_click", {
          ...projectAnalyticsParams(project, position),
          cta_location: `${location}_whatsapp`,
          contact_channel: "whatsapp",
          link_domain: "wa.me",
          link_path: "/whatsapp",
        })
      }
      className={`group/wa inline-flex min-h-[44px] items-center gap-2.5 whitespace-nowrap text-caption uppercase tracking-[0.18em] text-foreground transition-opacity active:opacity-60 ${FOCUS_RING}`}
    >
      {/* Glifo depois do rótulo: empilhado no mobile, um ícone à frente
          recuaria só este rótulo e quebraria a margem esquerda da coluna. */}
      <span className="relative inline-block">
        Solicite um orçamento
        <span className="sr-only">
          {" "}
          — pelo WhatsApp, a partir do projeto {project.title}
        </span>
        <span
          aria-hidden="true"
          className="absolute -bottom-[4px] left-0 h-px w-full bg-foreground/20"
        />
        <span
          aria-hidden="true"
          className="absolute -bottom-[4px] left-0 h-px w-full origin-left scale-x-0 bg-foreground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/wa:scale-x-100 group-focus-visible/wa:scale-x-100 motion-reduce:transition-none"
        />
      </span>
      <WhatsappGlyph />
    </a>
  );
}

/** Glifo do WhatsApp em currentColor — reforço semântico, não cor de marca. */
function WhatsappGlyph() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0 translate-y-[-0.5px]"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
    </svg>
  );
}
