"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  CONSENT_STORAGE_KEY,
  persistDecision,
  readStoredDecision,
  updateConsent,
  type ConsentDecision,
} from "@/lib/consent";

const subscribe = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  const handler = (event: StorageEvent) => {
    if (event.key === CONSENT_STORAGE_KEY) callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
};

const getDecision = () => readStoredDecision();
const getServerDecision = () => null;

export function CookieConsent() {
  const decision = useSyncExternalStore(subscribe, getDecision, getServerDecision);
  // O banner espera a hero sair da viewport antes de aparecer — evita poluir o impacto inicial.
  // Default `true` no SSR/primeiro render: a página começa no topo, então a hero (se existir) está visível.
  // Páginas sem hero atualizam para `false` no effect a partir do observer.
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    if (decision !== null) return;
    const hero = document.querySelector<HTMLElement>('[data-section="hero"]');
    if (!hero) {
      // Página sem hero: revela o banner no próximo tick, fora do effect body.
      const id = window.setTimeout(() => setHeroVisible(false), 0);
      return () => window.clearTimeout(id);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [decision]);

  if (decision !== null) return null;
  if (heroVisible) return null;

  const handleDecision = (next: ConsentDecision) => {
    persistDecision(next);
    updateConsent(next);
    // Dispara o storage listener manualmente (outras abas reagem automaticamente).
    window.dispatchEvent(new StorageEvent("storage", { key: CONSENT_STORAGE_KEY }));
  };

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[60] border-t bg-background/95 backdrop-blur"
      style={{ borderColor: "hsl(var(--accent) / 0.25)" }}
    >
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between md:gap-8 md:px-16 lg:px-24">
        <p className="max-w-[680px] text-caption leading-[1.5] text-muted-foreground">
          Usamos cookies para medir desempenho do site e melhorar campanhas. Você pode aceitar ou recusar — sua escolha é guardada neste dispositivo.{" "}
          <Link
            href="/privacidade"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => handleDecision("denied")}
            className="border px-5 py-3 text-caption uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            style={{ borderColor: "hsl(var(--accent) / 0.4)" }}
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => handleDecision("granted")}
            className="border bg-foreground px-5 py-3 text-caption uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-80"
            style={{ borderColor: "hsl(var(--foreground))" }}
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
