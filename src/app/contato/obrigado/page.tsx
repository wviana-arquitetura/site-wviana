import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { pageMeta, privateRouteRobots } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Mensagem enviada",
  description:
    "Recebemos sua mensagem. Em breve a equipe da W.VIANA retorna pelo canal escolhido.",
  path: "/contato/obrigado",
  robots: privateRouteRobots,
});

export default function ObrigadoPage() {
  return (
    <div className="min-h-[100svh] bg-background text-foreground">
      <main className="flex min-h-[100svh] flex-col">
        <section className="flex flex-1 items-center px-8 pt-28 pb-16 md:px-16 md:pt-32 md:pb-20 lg:px-24">
          <div className="mx-auto flex w-full max-w-[1100px] flex-col">
            <span
              className="text-micro uppercase tracking-[0.22em]"
              style={{ color: "hsl(var(--accent-strong))" }}
            >
              Mensagem enviada
            </span>
            <h1 className="mt-3 max-w-[860px] text-[clamp(2rem,6vw,4.5rem)] font-light leading-[1.05] text-foreground">
              Obrigado pelo contato. Em breve responderemos.
            </h1>
            <p className="mt-4 max-w-[620px] text-body-lg text-muted-foreground">
              Sua conversa foi aberta no WhatsApp em outra aba. Caso ela não tenha aparecido, use os canais abaixo — costumamos responder no mesmo dia útil.
            </p>

            <div
              className="mt-8 h-px w-full"
              style={{ background: "hsl(var(--accent) / 0.3)" }}
            />

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={BRAND.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-baseline gap-3 transition-opacity hover:opacity-60"
              >
                <span
                  className="shrink-0 text-micro uppercase tracking-[0.22em]"
                  style={{ color: "hsl(var(--accent-strong))" }}
                >
                  whatsapp
                </span>
                <span className="text-body-lg text-foreground">
                  {BRAND.whatsappPhoneFormatted}
                </span>
              </Link>

              <Link
                href={BRAND.mailtoUrl}
                className="group flex items-baseline gap-3 transition-opacity hover:opacity-60"
              >
                <span
                  className="shrink-0 text-micro uppercase tracking-[0.22em]"
                  style={{ color: "hsl(var(--accent-strong))" }}
                >
                  E-mail
                </span>
                <span className="text-body-lg text-foreground">{BRAND.email}</span>
              </Link>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <Link
                href="/projetos"
                className="group inline-flex items-center justify-center gap-3 border px-6 py-4 text-caption uppercase tracking-[0.18em] text-foreground transition-all hover:bg-secondary"
                style={{ borderColor: "hsl(var(--accent) / 0.4)" }}
              >
                ver projetos
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="transition-transform group-hover:translate-x-1"
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

              <Link
                href="/"
                className="text-caption uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
              >
                voltar à página inicial
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
