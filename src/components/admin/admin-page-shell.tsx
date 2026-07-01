import { cn } from "@/lib/utils";

/**
 * Primitivos de layout do painel admin.
 *
 * Filosofia: quem rola é o <main> do AdminLayout (h-screen + overflow-y-auto,
 * com data-lenis-prevent pra o Lenis do site público não sequestrar o scroll).
 * As barras de topo/rodapé usam `position: sticky` ancorado nesse <main> —
 * padrão que já funcionava no admin (lista de reordenar, save bar do form).
 *
 * Offsets sticky coordenados entre as peças:
 *   - AdminHeader     → top-0,  altura ~4rem (min-h-16)
 *   - abas (TabsList) → top-16  (encosta logo abaixo do header)
 *   - aside lateral   → top-20  (um respiro a mais)
 *   - AdminFooterBar  → bottom-0
 *
 * `AdminShell` é `min-h-full flex-col`: telas curtas preenchem a altura do
 * <main> (footer encosta embaixo) e telas longas rolam dentro dele.
 */

const BORDER = "hsl(var(--accent) / 0.3)";

export function AdminShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    // min-h-full = 100% do <main> (que é h-screen e rola): telas curtas preenchem
    // a altura e o footer encosta embaixo; telas longas rolam dentro do <main>.
    <div className={cn("flex min-h-full flex-col", className)}>{children}</div>
  );
}

type AdminHeaderProps = {
  /** Slot à esquerda do título (ex.: link "← Voltar"). */
  back?: React.ReactNode;
  /** Sobre-título curto (uppercase, accent). */
  eyebrow?: string;
  /** Título principal. */
  title: React.ReactNode;
  /** Linha de metadados abaixo do título (ex.: /slug · status). */
  meta?: React.ReactNode;
  /** Slot à direita (ex.: "+ Novo projeto"). */
  actions?: React.ReactNode;
};

export function AdminHeader({
  back,
  eyebrow,
  title,
  meta,
  actions,
}: AdminHeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      style={{ borderColor: BORDER }}
    >
      {/* Altura estável (~h-16) sem wrap, pra que abas/aside grudem em top-16 sem
          sobreposição. pl-16 no mobile pra não cobrir o hambúrguer (fixed left-6 top-6) */}
      <div className="flex min-h-16 items-center gap-4 py-2.5 pl-16 pr-6 md:gap-5 md:px-16 lg:px-24">
        {back ? <div className="shrink-0">{back}</div> : null}
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <span
              className="block truncate text-micro uppercase tracking-[0.32em]"
              style={{ color: "hsl(var(--accent-strong))" }}
            >
              {eyebrow}
            </span>
          ) : null}
          <div className="flex min-w-0 items-baseline gap-2">
            <h1 className="truncate text-lg font-light leading-tight text-foreground md:text-xl">
              {title}
            </h1>
            {meta ? (
              <span className="hidden shrink-0 text-micro uppercase tracking-[0.18em] text-muted-foreground sm:inline">
                {meta}
              </span>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-3">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}

export function AdminBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-1 flex-col px-8 py-8 md:px-16 lg:px-24", className)}>
      {children}
    </div>
  );
}

export function AdminFooterBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-30 flex flex-wrap items-center justify-between gap-4 border-t bg-background/95 px-8 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-16 lg:px-24",
        className,
      )}
      style={{ borderColor: BORDER }}
    >
      {children}
    </div>
  );
}
