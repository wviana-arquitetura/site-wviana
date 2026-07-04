"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useArchitecturalReveal } from "@/hooks/use-architectural-reveal";
import { useDesktopMailtoBlankTarget } from "@/hooks/use-desktop-mailto-target";
import { BRAND } from "@/lib/brand";
import { trackEvent } from "@/lib/analytics";
import { submitContactLead } from "@/lib/contact-lead";
import { getBreadcrumbJsonLd, getContactPageJsonLd, getFaqJsonLd } from "@/lib/seo";

const PROJECT_TYPES = [
  "Residencial",
  "Arquitetura",
  "Comercial",
  "Corporativo",
  "Outros",
] as const;

const contactFaqItems = [
  {
    question: "Como iniciar um projeto com a W.VIANA?",
    answer:
      "O primeiro passo para iniciar seu projeto com a W.VIANA é entrar em contato informando o tipo de projeto, localização do imóvel e etapa atual da obra ou espaço. A partir dessas informações, nossa equipe retorna para entender melhor suas necessidades, alinhar escopo, prazos e dar sequência aos próximos passos do projeto.",
  },
  {
    question: "O escritório faz projeto arquitetônico e de interiores?",
    answer:
      "Sim, o escritório desenvolve tanto projetos arquitetônicos quanto projetos de interiores. Os serviços podem ser contratados de forma separada ou em conjunto, de acordo com a necessidade de cada cliente e etapa do projeto.",
  },
  {
    question: "Onde fica o escritório?",
    answer:
      "O escritório fica em Fortaleza-CE, na Rua Vicente Linhares, 521, no Ed. Humberto Santana Business.",
  },
];

export default function ContactPage() {
  const rootRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "sent">("idle");
  const contactJsonLd = getContactPageJsonLd();
  const faqJsonLd = getFaqJsonLd(contactFaqItems);
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Início", path: "/" },
    { name: "Contato", path: "/contato" },
  ]);
  useArchitecturalReveal(rootRef);

  const mailtoTarget = useDesktopMailtoBlankTarget();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitState === "submitting") return;

    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const projectType = String(data.get("project-type") || "").trim();
    const message = String(data.get("message") || "").trim();
    const website = String(data.get("website") || "").trim();

    const hasAnyField = Boolean(name || email || projectType || message);
    const formProjectType = projectType || undefined;

    setSubmitState("submitting");

    trackEvent("whatsapp_form_submit", {
      cta_location: "contato_page_form",
      contact_channel: "whatsapp",
      form_project_type: formProjectType,
      form_has_message: Boolean(message),
    });

    submitContactLead({ name, email, projectType, message, website });

    const text = hasAnyField
      ? [
          "Olá, vim pelo site da W.Viana.",
          "",
          name ? `Nome: ${name}` : null,
          email ? `E-mail: ${email}` : null,
          projectType ? `Tipo de projeto: ${projectType}` : null,
          message ? "" : null,
          message ? "Mensagem:" : null,
          message ? message : null,
        ]
          .filter((line): line is string => line !== null)
          .join("\n")
      : "Olá, vim pelo site da W.Viana e gostaria de conversar sobre um projeto.";

    const whatsappLink = `https://wa.me/${BRAND.whatsappPhone}?text=${encodeURIComponent(text)}`;
    window.open(whatsappLink, "_blank", "noopener,noreferrer");

    setSubmitState("sent");
    form.reset();
    router.push("/contato/obrigado");
  };

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="min-h-screen bg-background text-foreground">
        <main ref={rootRef}>
          <section className="px-8 pt-36 pb-24 md:px-16 md:pt-44 md:pb-32 lg:px-24">
            <div className="mx-auto grid w-full max-w-[1800px] gap-12 md:grid-cols-2 md:gap-16 lg:gap-24">
              {/* Left — Context */}
              <div className="flex flex-col justify-center">
                <span
                  className="reveal-illuminate text-micro uppercase tracking-[0.22em]"
                  style={{ color: "hsl(var(--accent-strong))" }}
                >
                  Contato
                </span>
                <h1 className="reveal-rise mt-4 text-architectural font-light leading-[1.05] text-foreground">
                  Vamos conversar sobre o seu projeto.
                </h1>
                <p className="reveal-illuminate mt-4 max-w-[440px] text-body-lg text-muted-foreground">
                  Atendemos projetos de arquitetura e interiores presencialmente em Fortaleza, no Ceará, além de desenvolver projetos para outras regiões do Brasil de forma remota/online.
                </p>

                <div
                  className="reveal-draw mt-8 h-px w-full"
                  style={{ background: "hsl(var(--accent) / 0.3)" }}
                />

                <div className="mt-8 flex flex-col gap-4">
                  <Link
                    href={BRAND.mailtoUrl}
                    target={mailtoTarget}
                    rel={mailtoTarget ? "noopener noreferrer" : undefined}
                    onClick={() =>
                      trackEvent("email_click", {
                        cta_location: "contato_page_email",
                        contact_channel: "email",
                        link_domain: "mailto",
                        link_path: "/email",
                      })
                    }
                    className="reveal-illuminate group flex items-baseline gap-3 transition-opacity hover:opacity-60"
                  >
                    <span
                      className="shrink-0 text-micro uppercase tracking-[0.22em]"
                      style={{ color: "hsl(var(--accent-strong))" }}
                    >
                      E-mail
                    </span>
                    <span className="text-body-lg text-foreground">{BRAND.email}</span>
                  </Link>

                  <Link
                    href={BRAND.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackEvent("whatsapp_click", {
                        cta_location: "contato_page_whatsapp",
                        contact_channel: "whatsapp",
                        link_domain: "wa.me",
                        link_path: "/whatsapp",
                      })
                    }
                    className="reveal-illuminate group flex items-baseline gap-3 transition-opacity hover:opacity-60"
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

                  <div className="reveal-illuminate flex items-baseline gap-3">
                    <span
                      className="shrink-0 text-micro uppercase tracking-[0.22em]"
                      style={{ color: "hsl(var(--accent-strong))" }}
                    >
                      Localização
                    </span>
                    <span className="text-body-lg text-foreground">{BRAND.location}</span>
                  </div>
                </div>

                <div className="mt-10 grid gap-4 text-muted-foreground md:grid-cols-3">
                  {[
                    "Residencial",
                    "Comercial",
                    "Corporativo",
                  ].map((item) => (
                    <span
                      key={item}
                      className="reveal-illuminate border-t pt-3 text-micro uppercase tracking-[0.22em]"
                      style={{ borderColor: "hsl(var(--accent) / 0.22)" }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right — invitational form, all fields optional */}
              <div className="flex flex-col justify-center">
                <span
                  className="reveal-illuminate text-micro uppercase tracking-[0.22em]"
                  style={{ color: "hsl(var(--accent-strong))" }}
                >
                  Mensagem
                </span>
                <p className="reveal-illuminate mt-3 text-body-lg text-muted-foreground">
                  Envie uma primeira mensagem, mesmo sem ter todos os detalhes definidos.
                </p>

                <form
                  className="mt-8 space-y-6"
                  aria-label="Formulário de contato"
                  onSubmit={handleSubmit}
                >
                  {/* Honeypot anti-bot: humanos não veem; bots automáticos preenchem. */}
                  <div aria-hidden="true" className="sr-only">
                    <label htmlFor="website">Deixe em branco</label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      defaultValue=""
                    />
                  </div>

                  <FormField label="Nome" name="name" />
                  <FormField label="E-mail" name="email" type="email" />

                  <div>
                    <label
                      htmlFor="project-type"
                      className="mb-2 block text-micro uppercase tracking-[0.22em]"
                      style={{ color: "hsl(var(--accent-strong))" }}
                    >
                      Tipo de projeto
                    </label>
                    <select
                      id="project-type"
                      name="project-type"
                      defaultValue=""
                      className="w-full cursor-pointer appearance-none border-0 border-b bg-transparent pb-3 text-base text-foreground outline-none transition-colors focus:border-foreground md:text-caption"
                      style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
                    >
                      <option value="" className="text-muted-foreground">
                        Selecione
                      </option>
                      {PROJECT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-micro uppercase tracking-[0.22em]"
                      style={{ color: "hsl(var(--accent-strong))" }}
                    >
                      Sobre o projeto
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder="Conte um pouco sobre o que você tem em mente — o que quiser compartilhar."
                      className="w-full resize-none border-0 border-b bg-transparent pb-3 text-base leading-[1.5] text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground md:text-caption"
                      style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitState !== "idle"}
                    aria-busy={submitState === "submitting"}
                    className="group mt-2 flex w-full items-center justify-center gap-3 border py-4 text-caption uppercase tracking-[0.18em] text-foreground transition-all hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
                    style={{ borderColor: "hsl(var(--accent) / 0.4)" }}
                  >
                    {submitState === "submitting" ? "enviando…" : "conversar no whatsapp →"}
                    {submitState === "idle" ? (
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
                    ) : null}
                  </button>

                  {submitState === "sent" ? (
                    <p className="mt-2 text-center text-body text-muted-foreground">
                      Pronto. Sua mensagem foi enviada no WhatsApp e responderemos assim que possível.
                    </p>
                  ) : null}
                </form>
              </div>
            </div>
          </section>

          <section className="px-8 pb-24 md:px-16 md:pb-32 lg:px-24">
            <div className="mx-auto grid w-full max-w-[1800px] gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
              <div>
                <span
                  className="reveal-illuminate text-micro uppercase tracking-[0.22em]"
                  style={{ color: "hsl(var(--accent-strong))" }}
                >
                  Perguntas
                </span>
                <h2 className="reveal-rise mt-4 max-w-[520px] text-architectural font-light leading-[1.05] text-foreground">
                  Um início simples para um projeto bem conduzido.
                </h2>
              </div>

              <div
                className="flex flex-col border-t"
                style={{ borderColor: "hsl(var(--accent) / 0.18)" }}
              >
                {contactFaqItems.map((item) => (
                  <div
                    key={item.question}
                    className="reveal-rise border-b py-8"
                    style={{ borderColor: "hsl(var(--accent) / 0.18)" }}
                  >
                    <h3 className="text-body-lg font-medium text-foreground">{item.question}</h3>
                    <p className="mt-3 leading-[1.6] text-muted-foreground">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

function FormField({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-micro uppercase tracking-[0.22em]"
        style={{ color: "hsl(var(--accent-strong))" }}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="w-full border-0 border-b bg-transparent pb-3 text-base text-foreground outline-none transition-colors focus:border-foreground md:text-caption"
        style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
      />
    </div>
  );
}
