"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOutAction } from "@/app/admin/_actions/auth";
import { useAdminDirtyStore } from "@/store/use-admin-dirty-store";
import { ConfirmLeaveDialog } from "./confirm-leave-dialog";

type NavItem = {
  href: string;
  label: string;
  description?: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/home", label: "Home", description: "Os 3 destaques da página inicial" },
  { href: "/admin/projetos", label: "Projetos", description: "Listagem, edição e criação" },
  { href: "/admin/logs", label: "Atividade", description: "Histórico de alterações" },
];

type AdminNavProps = {
  userEmail: string;
};

export function AdminNav({ userEmail }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<{
    kind: "internal" | "external" | "logout";
    target: string;
  } | null>(null);

  const dirty = useAdminDirtyStore((s) => s.dirty);
  const changesCount = useAdminDirtyStore((s) => s.changesCount);
  const clearDirty = useAdminDirtyStore((s) => s.clear);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  /**
   * Tenta navegar para `href`. Se há alterações pendentes, abre dialog de
   * confirmação primeiro. Retorna true se navegação foi bloqueada.
   */
  function tryNavigate(
    e: React.MouseEvent,
    target: string,
    kind: "internal" | "external" = "internal",
  ): boolean {
    if (!dirty) return false;
    e.preventDefault();
    setPendingTarget({ kind, target });
    return true;
  }

  function confirmNavigation() {
    if (!pendingTarget) return;
    clearDirty();
    const { kind, target } = pendingTarget;
    setPendingTarget(null);
    setMobileOpen(false);
    if (kind === "external") {
      window.open(target, "_blank", "noopener,noreferrer");
    } else if (kind === "logout") {
      // Submete o form de logout via JS sem o dirty bloquear
      void signOutAction();
    } else {
      router.push(target);
    }
  }

  return (
    <>
      {/* Mobile menu toggle */}
      <button
        type="button"
        className="fixed left-6 top-6 z-50 md:hidden flex h-10 w-10 items-center justify-center border bg-background text-foreground"
        style={{ borderColor: "hsl(var(--accent) / 0.4)" }}
        onClick={() => setMobileOpen((v) => !v)}
        aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={mobileOpen}
      >
        <span className="text-micro uppercase tracking-[0.18em]">
          {mobileOpen ? "✕" : "≡"}
        </span>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r bg-background transition-transform
          md:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
      >
        {/* Header */}
        <div className="px-8 py-7">
          <Link
            href="/admin"
            className="block transition-opacity hover:opacity-60"
            onClick={(e) => {
              if (!tryNavigate(e, "/admin")) setMobileOpen(false);
            }}
          >
            <span
              className="block text-micro uppercase tracking-[0.32em]"
              style={{ color: "hsl(var(--accent-strong))" }}
            >
              W.VIANA
            </span>
            <span className="mt-1 block text-body-lg font-light text-foreground">
              Painel
            </span>
          </Link>
        </div>

        <div
          className="mx-8 h-px"
          style={{ background: "hsl(var(--accent) / 0.2)" }}
        />

        {/* Navigation */}
        <nav className="flex-1 px-8 py-6">
          <ul className="space-y-4">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      if (!tryNavigate(e, item.href)) setMobileOpen(false);
                    }}
                    className="group block"
                  >
                    <span
                      className={`block text-caption uppercase tracking-[0.22em] transition-colors ${
                        active
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.description ? (
                      <span
                        className="mt-1 block text-micro uppercase tracking-[0.18em]"
                        style={{ color: "hsl(var(--accent-strong) / 0.7)" }}
                      >
                        {item.description}
                      </span>
                    ) : null}
                    {active ? (
                      <span
                        className="mt-2 block h-px w-12"
                        style={{ background: "hsl(var(--accent-strong))" }}
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          className="mx-8 h-px"
          style={{ background: "hsl(var(--accent) / 0.2)" }}
        />

        {/* Footer */}
        <div className="px-8 py-6 space-y-4">
          <div>
            <span
              className="block text-micro uppercase tracking-[0.22em]"
              style={{ color: "hsl(var(--accent-strong))" }}
            >
              Logado como
            </span>
            <span className="mt-1 block break-all text-body text-foreground">
              {userEmail}
            </span>
          </div>
          <div className="space-y-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => tryNavigate(e, "/", "external")}
              className="block text-micro uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Ver site →
            </a>
            <form
              action={signOutAction}
              onSubmit={(e) => {
                if (dirty) {
                  e.preventDefault();
                  setPendingTarget({ kind: "logout", target: "" });
                }
              }}
            >
              <button
                type="submit"
                className="text-micro uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Backdrop mobile */}
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-foreground/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      {/* Dialog de confirmação de saída */}
      <ConfirmLeaveDialog
        open={pendingTarget !== null}
        onOpenChange={(open) => {
          if (!open) setPendingTarget(null);
        }}
        changesCount={changesCount}
        onConfirm={confirmNavigation}
      />
    </>
  );
}
