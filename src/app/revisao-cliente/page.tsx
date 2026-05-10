"use client";

import { FormEvent, useRef, useState } from "react";
import { useArchitecturalReveal } from "@/hooks/v2/use-architectural-reveal";

const ALIGNMENT_OPTIONS = [
  { value: "muito_alinhado", label: "Muito alinhado" },
  { value: "bem_alinhado", label: "Bem alinhado, com ajustes" },
  { value: "parcial", label: "Parcialmente alinhado" },
  { value: "pouco_alinhado", label: "Pouco alinhado" },
] as const;

const TEXT_STATUS_OPTIONS = [
  { value: "prontos", label: "Sim, já tenho textos" },
  { value: "parcial", label: "Tenho parte dos textos" },
  {
    value: "desenvolver",
    label: "Prefiro que vocês desenvolvam com base no posicionamento",
  },
] as const;

const SECTION_ACTION_OPTIONS = [
  { value: "approved", label: "Aprovado como está" },
  { value: "minor_adjustments", label: "Precisa de ajustes leves" },
  { value: "major_adjustments", label: "Precisa de ajustes importantes" },
] as const;

type SubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; id: string }
  | { status: "error"; message: string };

export default function ClientReviewPage() {
  const rootRef = useRef<HTMLElement>(null);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const todayLabel = new Date().toLocaleDateString("pt-BR");

  useArchitecturalReveal(rootRef);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitState({ status: "loading" });

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/client-review", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as
        | { ok: true; id: string }
        | { ok: false; error?: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? "Falha ao enviar." : payload.error || "Falha ao enviar.");
      }

      setSubmitState({ status: "success", id: payload.id });
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado no envio.";
      setSubmitState({ status: "error", message });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main ref={rootRef}>
        <section className="px-8 pt-36 pb-24 md:px-16 md:pt-44 md:pb-32 lg:px-24">
          <div className="mx-auto w-full max-w-[1100px]">
            <span
              className="reveal-illuminate text-micro uppercase tracking-[0.22em]"
              style={{ color: "hsl(var(--accent-strong))" }}
            >
              Revisão de conteúdo
            </span>

            <h1 className="reveal-rise mt-4 max-w-[780px] text-architectural font-light leading-[1.05] text-foreground">
              Seu olhar sobre a v1 do site.
            </h1>

            <p className="reveal-illuminate mt-5 max-w-[760px] text-body-lg text-muted-foreground">
              Este formulário foi desenhado para ser rápido e leve. A ideia é alinhar ajustes,
              reunir materiais e orientar os próximos passos com clareza.
            </p>

            <p className="reveal-illuminate mt-3 max-w-[760px] text-sm text-muted-foreground">
              Como o direcionamento é clean e minimalista, esta versão pode trazer alguns elementos
              extras para teste de percepção. Tudo que parecer “a mais” é simples de ajustar:
              podemos remover, reduzir ou simplificar com facilidade.
            </p>

            <div
              className="reveal-draw mt-10 h-px w-full"
              style={{ background: "hsl(var(--accent) / 0.3)" }}
            />

            <form className="mt-10 space-y-12" onSubmit={handleSubmit} aria-label="Revisão do site">
              <fieldset className="space-y-5">
                <legend className="text-caption uppercase tracking-[0.18em] text-foreground">
                  1) Antes de começar
                </legend>
                <p className="text-sm text-muted-foreground">
                  Identificação rápida para organizar sua revisão. Tempo estimado: 5 a 10 minutos.
                </p>
                <div className="grid gap-6 md:grid-cols-2">
                  <InputField label="Nome" name="name" required />
                  <InputField
                    label="Data da revisão"
                    name="reviewDate"
                    placeholder="Ex.: 25/03/2026"
                    defaultValue={todayLabel}
                  />
                </div>
              </fieldset>

              <fieldset className="space-y-5">
                <legend className="text-caption uppercase tracking-[0.18em] text-foreground">
                  2) Impressão geral
                </legend>
                <p className="text-sm text-muted-foreground">
                  Primeira percepção do site como um todo: sensação, clareza e alinhamento com a sua visão.
                </p>
                <div className="grid gap-3">
                  {ALIGNMENT_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-start gap-3 border px-4 py-3 text-sm"
                      style={{ borderColor: "hsl(var(--accent) / 0.28)" }}
                    >
                      <input type="radio" name="alignment" value={option.value} required className="mt-1" />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>

                <TextAreaField
                  label="Comentário rápido"
                  name="alignmentComment"
                  optional
                  placeholder="Se quiser, conte em poucas frases o porquê."
                />
              </fieldset>

              <fieldset className="space-y-5">
                <legend className="text-caption uppercase tracking-[0.18em] text-foreground">
                  3) Direção de marca
                </legend>
                <p className="text-sm text-muted-foreground">
                  Aqui queremos entender se a presença digital expressa sua identidade autoral.
                </p>
                <TextAreaField
                  label="O site traduz sua identidade como arquiteto(a)?"
                  name="brandDirection"
                  required
                />
              </fieldset>

              <fieldset className="space-y-8">
                <legend className="text-caption uppercase tracking-[0.18em] text-foreground">
                  4) Feedback por seção
                </legend>
                <p className="text-sm text-muted-foreground">
                  Avaliação objetiva por área do site: o que funciona e o que deve ser refinado.
                </p>
                <SectionFeedback
                  sectionLabel="Home"
                  sectionKey="home"
                  hint="Entrada do site: impacto inicial, ritmo visual e clareza da proposta."
                />
                <SectionFeedback
                  sectionLabel="Menu"
                  sectionKey="menu"
                  hint="Navegação principal: clareza dos caminhos, entendimento das páginas e fluidez de uso."
                />
                <SectionFeedback
                  sectionLabel="Manifesto"
                  sectionKey="manifesto"
                  hint="Posicionamento do estúdio: essência, tom de voz e conexão emocional."
                />
                <SectionFeedback
                  sectionLabel="Processo"
                  sectionKey="process"
                  hint="Método de trabalho: clareza das etapas, confiança e percepção de valor."
                />
                <SectionFeedback
                  sectionLabel="Quem somos"
                  sectionKey="studio"
                  hint="Apresentação do escritório: equipe, trajetória e autoridade da marca."
                />
                <SectionFeedback
                  sectionLabel="Projetos"
                  sectionKey="projects"
                  hint="Portfólio: curadoria, narrativa dos cases e leitura das imagens."
                />
                <SectionFeedback
                  sectionLabel="Contato"
                  sectionKey="contact"
                  hint="Conversão: facilidade para o cliente entrar em contato e agir."
                />
              </fieldset>

              <fieldset className="space-y-5">
                <legend className="text-caption uppercase tracking-[0.18em] text-foreground">
                  5) Conteúdos e materiais
                </legend>
                <p className="text-sm text-muted-foreground">
                  Centralização dos arquivos para manter o fluxo de produção rápido e organizado.
                </p>
                <InputField
                  label="Link da pasta de materiais (Drive, Dropbox, etc.)"
                  name="materialsLink"
                  type="url"
                  optional
                />

                <TextAreaField
                  label="Organização por projeto"
                  name="materialsOrganization"
                  optional
                  placeholder="Ex.: Casa Veredas / Loft Cais / Apartamento C." 
                />
              </fieldset>

              <fieldset className="space-y-5">
                <legend className="text-caption uppercase tracking-[0.18em] text-foreground">
                  6) Conteúdo textual
                </legend>
                <p className="text-sm text-muted-foreground">
                  Definição de autoria dos textos: envio pronto ou desenvolvimento em conjunto.
                </p>
                <div className="grid gap-3">
                  {TEXT_STATUS_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-start gap-3 border px-4 py-3 text-sm"
                      style={{ borderColor: "hsl(var(--accent) / 0.28)" }}
                    >
                      <input type="radio" name="textStatus" value={option.value} required className="mt-1" />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>

                <TextAreaField
                  label="Observações sobre tom, estilo ou palavras importantes"
                  name="textNotes"
                  optional
                />
              </fieldset>

              <fieldset className="space-y-5">
                <legend className="text-caption uppercase tracking-[0.18em] text-foreground">
                  7) Prioridades
                </legend>
                <p className="text-sm text-muted-foreground">
                  Ordem de foco para guiar os próximos ajustes com objetividade.
                </p>
                <div className="grid gap-6 md:grid-cols-3">
                  <InputField label="Prioridade #1" name="priority1" required />
                  <InputField label="Prioridade #2" name="priority2" optional />
                  <InputField label="Prioridade #3" name="priority3" optional />
                </div>
              </fieldset>

              <div className="border p-5" style={{ borderColor: "hsl(var(--accent) / 0.28)" }}>
                <button
                  type="submit"
                  disabled={submitState.status === "loading"}
                  className="group flex w-full items-center justify-center gap-3 border py-4 text-caption uppercase tracking-[0.18em] text-foreground transition-all hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ borderColor: "hsl(var(--accent) / 0.4)" }}
                >
                  {submitState.status === "loading" ? "Enviando..." : "Enviar revisão"}
                </button>

                {submitState.status === "success" ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Revisão enviada com sucesso. Protocolo: <strong>{submitState.id}</strong>
                  </p>
                ) : null}

                {submitState.status === "error" ? (
                  <p className="mt-4 text-sm text-red-700">{submitState.message}</p>
                ) : null}
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

function InputField({
  label,
  name,
  type = "text",
  required = false,
  optional = false,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: "text" | "email" | "url";
  required?: boolean;
  optional?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  const finalLabel = optional ? `${label} (opcional)` : label;

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-micro uppercase tracking-[0.22em]"
        style={{ color: "hsl(var(--accent-strong))" }}
      >
        {finalLabel}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full border-0 border-b bg-transparent pb-3 text-caption text-foreground outline-none transition-colors focus:border-foreground"
        style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
      />
    </div>
  );
}

function TextAreaField({
  label,
  name,
  required = false,
  optional = false,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  optional?: boolean;
  placeholder?: string;
}) {
  const finalLabel = optional ? `${label} (opcional)` : label;

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-micro uppercase tracking-[0.22em]"
        style={{ color: "hsl(var(--accent-strong))" }}
      >
        {finalLabel}
      </label>
      <textarea
        id={name}
        name={name}
        required={required}
        rows={4}
        placeholder={placeholder}
        className="w-full resize-y border px-4 py-3 text-caption text-foreground outline-none transition-colors focus:border-foreground"
        style={{ borderColor: "hsl(var(--accent) / 0.3)", backgroundColor: "transparent" }}
      />
    </div>
  );
}

function SectionFeedback({
  sectionLabel,
  sectionKey,
  hint,
}: {
  sectionLabel: string;
  sectionKey: "home" | "menu" | "manifesto" | "process" | "studio" | "projects" | "contact";
  hint: string;
}) {
  return (
    <div className="space-y-5 border p-5" style={{ borderColor: "hsl(var(--accent) / 0.22)" }}>
      <h3 className="text-sm uppercase tracking-[0.18em] text-foreground">{sectionLabel}</h3>
      <p className="text-xs text-muted-foreground">{hint}</p>

      <div>
        <p
          className="mb-2 block text-micro uppercase tracking-[0.22em]"
          style={{ color: "hsl(var(--accent-strong))" }}
        >
          Status da seção (obrigatório)
        </p>
        <div className="grid gap-3">
          {SECTION_ACTION_OPTIONS.map((option) => (
            <label
              key={`${sectionKey}-${option.value}`}
              className="flex cursor-pointer items-start gap-3 border px-4 py-3 text-sm"
              style={{ borderColor: "hsl(var(--accent) / 0.28)" }}
            >
              <input
                type="radio"
                name={`${sectionKey}Decision`}
                value={option.value}
                required
                className="mt-1"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <TextAreaField label="O que funciona bem?" name={`${sectionKey}Works`} optional />
      <TextAreaField label="O que você ajustaria?" name={`${sectionKey}Adjust`} optional />
    </div>
  );
}
