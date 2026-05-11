import type { Metadata } from "next";
import Link from "next/link";
import { privateRouteRobots } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Página não encontrada",
  description: "O endereço não existe ou foi removido.",
  robots: privateRouteRobots,
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      {/* Watermark */}
      <span
        className="pointer-events-none select-none font-extrabold leading-none text-foreground/[0.04]"
        style={{ fontSize: "clamp(8rem, 15vw, 20rem)" }}
      >
        404
      </span>

      <p className="mt-4 text-caption uppercase tracking-[0.18em] text-foreground">
        Pagina nao encontrada
      </p>

      <Link
        href="/"
        className="mt-6 flex items-center gap-2 text-caption uppercase tracking-[0.18em] text-foreground transition-opacity hover:opacity-60"
      >
        Voltar
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </main>
  );
}
