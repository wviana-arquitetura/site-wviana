import type { Metadata } from "next";
import localFont from "next/font/local";
import { GlobalIntroLoader } from "@/components/providers/GlobalIntroLoader";
import { ArchitecturalGrid } from "@/components/layout/architectural-grid";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { BRAND } from "@/lib/brand";

/* Aeonik — manual: Light / Medium / Bold (TRIAL: Regular cobre 400 e 500) */
const aeonik = localFont({
  src: [
    { path: "../fonts/AeonikTRIAL-Light.otf", weight: "300", style: "normal" },
    { path: "../fonts/AeonikTRIAL-Regular.otf", weight: "400", style: "normal" },
    { path: "../fonts/AeonikTRIAL-Regular.otf", weight: "500", style: "normal" },
    { path: "../fonts/AeonikTRIAL-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});

/* Agrandir Grand — manual: títulos e destaques (Light + Heavy) */
const agrandirGrand = localFont({
  src: [
    { path: "../fonts/Agrandir-GrandLight.otf", weight: "300", style: "normal" },
    { path: "../fonts/Agrandir-GrandHeavy.otf", weight: "700", style: "normal" },
    { path: "../fonts/Agrandir-GrandHeavy.otf", weight: "800", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "W.VIANA — Arquitetura | Interiores",
  description:
    "Escritório de arquitetura e interiores fundado por Wellington Viana. Soluções personalizadas que elevam experiências e expectativas.",
  metadataBase: new URL(BRAND.siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: BRAND.name,
    title: "W.VIANA — Arquitetura | Interiores",
    description:
      "Arquitetura sensorial, minimalista e autoral. Forma, luz e silêncio em projetos residenciais e interiores.",
  },
  twitter: {
    card: "summary_large_image",
    title: "W.VIANA — Arquitetura | Interiores",
    description:
      "Arquitetura sensorial, minimalista e autoral. Forma, luz e silêncio.",
  },
};

const hydrationGuardScript = `
  (() => {
    try {
      const clean = () => {
        document.querySelectorAll('[bis_skin_checked]').forEach((el) => {
          el.removeAttribute('bis_skin_checked');
        });
      };

      // Limpeza imediata (antes da hidratação)
      clean();

      // Rodadas curtas para pegar injeções tardias de extensões
      let runs = 0;
      const maxRuns = 120; // ~6s
      const timer = setInterval(() => {
        clean();
        runs += 1;
        if (runs >= maxRuns) clearInterval(timer);
      }, 50);

      const observer = new MutationObserver(() => clean());
      observer.observe(document.documentElement, {
        attributes: true,
        childList: true,
        subtree: true,
      });

      // Desliga o observer depois da janela crítica de hidratação
      setTimeout(() => observer.disconnect(), 10000);
    } catch {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: hydrationGuardScript }} />
      </head>
      <body
        suppressHydrationWarning
        className={`${aeonik.variable} ${agrandirGrand.variable} bg-background font-sans text-foreground antialiased`}
      >
        <GlobalIntroLoader />
        <ArchitecturalGrid />
        <QueryProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
