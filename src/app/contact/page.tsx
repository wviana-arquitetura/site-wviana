"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { useArchitecturalReveal } from "@/hooks/v2/use-architectural-reveal";
import { BRAND } from "@/lib/brand";

const PROJECT_TYPES = [
  "Residencial",
  "Comercial",
  "Hospitalidade",
  "Corporativo",
  "Outro",
] as const;

export default function ContactPage() {
  const rootRef = useRef<HTMLElement>(null);
  const [submitState, setSubmitState] = useState<"idle" | "sent">("idle");
  useArchitecturalReveal(rootRef);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const projectType = String(data.get("project-type") || "").trim();
    const message = String(data.get("message") || "").trim();

    const text = [
      "Olá, vim pelo site da W.Viana.",
      "",
      `Nome: ${name || "-"}`,
      `E-mail: ${email || "-"}`,
      `Tipo de projeto: ${projectType || "-"}`,
      "",
      "Mensagem:",
      message || "-",
    ].join("\n");

    const whatsappLink = `https://wa.me/${BRAND.whatsappPhone}?text=${encodeURIComponent(text)}`;
    window.open(whatsappLink, "_blank", "noopener,noreferrer");

    setSubmitState("sent");
    form.reset();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
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
                Preencha o formulário ou entre em contato diretamente.
              </p>

              <div
                className="reveal-draw mt-8 h-px w-full"
                style={{ background: "hsl(var(--accent) / 0.3)" }}
              />

              <div className="mt-8 flex flex-col gap-4">
                <Link
                  href={`mailto:${BRAND.email}`}
                  className="reveal-illuminate group flex items-baseline gap-3 transition-opacity hover:opacity-60"
                >
                  <span
                    className="shrink-0 text-micro uppercase tracking-[0.22em]"
                    style={{ color: "hsl(var(--accent-strong))" }}
                  >
                    E-mail
                  </span>
                  <span className="text-body-lg text-foreground">
                    {BRAND.email}
                  </span>
                </Link>

                <Link
                  href={BRAND.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
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
                  <span className="text-body-lg text-foreground">
                    {BRAND.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Right — Form */}
            <div className="flex flex-col justify-center">
              <form
                className="space-y-6"
                aria-label="Formulário de contato"
                onSubmit={handleSubmit}
              >
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
                    required
                    defaultValue=""
                    className="w-full cursor-pointer appearance-none border-0 border-b bg-transparent pb-3 text-caption text-foreground outline-none transition-colors focus:border-foreground"
                    style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
                  >
                    <option value="" disabled className="text-muted-foreground">
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
                    Mensagem
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    defaultValue="Gostaria de conversar sobre um projeto."
                    className="w-full resize-none border-0 border-b bg-transparent pb-3 text-caption text-foreground outline-none transition-colors focus:border-foreground"
                    style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
                  />
                </div>

                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-3 border py-4 text-caption uppercase tracking-[0.18em] text-foreground transition-all hover:bg-foreground hover:text-background"
                  style={{ borderColor: "hsl(var(--accent) / 0.4)" }}
                >
                  Enviar no whatsapp
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
                </button>

                {submitState === "sent" ? (
                  <p
                    className="text-center text-micro uppercase tracking-[0.22em]"
                    style={{ color: "hsl(var(--accent-strong))" }}
                  >
                    Mensagem preparada. Confira a aba do whatsapp.
                  </p>
                ) : null}
              </form>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter hideCta />
    </div>
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
        required
        className="w-full border-0 border-b bg-transparent pb-3 text-caption text-foreground outline-none transition-colors focus:border-foreground"
        style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
      />
    </div>
  );
}
