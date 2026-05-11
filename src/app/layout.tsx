import type { Metadata } from "next";
import localFont from "next/font/local";
import { GlobalIntroLoader } from "@/components/providers/GlobalIntroLoader";
import { HydrationGuard } from "@/components/providers/HydrationGuard";
import { SiteChrome } from "@/components/layout/site-chrome";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { ScrollProgress } from "@/components/ui/scroll-progress";
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

/* Agrandir Narrow — manual: títulos e destaques */
const agrandirNarrow = localFont({
  src: [
    { path: "../fonts/Agrandir-Narrow.otf", weight: "300", style: "normal" },
    { path: "../fonts/Agrandir-Narrow.otf", weight: "400", style: "normal" },
    { path: "../fonts/Agrandir-Narrow.otf", weight: "700", style: "normal" },
    { path: "../fonts/Agrandir-Narrow.otf", weight: "800", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "W.VIANA — Arquitetura | Interiores",
  description:
    "Escritório de arquitetura e interiores fundado por Wellington Viana. Soluções personalizadas que elevam experiências e expectativas.",
  metadataBase: new URL(BRAND.siteUrl),
  icons: {
    icon: [
      {
        url: "/icon-light.svg",
        media: "(prefers-color-scheme: light)",
        type: "image/svg+xml",
      },
      {
        url: "/icon-dark.svg",
        media: "(prefers-color-scheme: dark)",
        type: "image/svg+xml",
      },
      { url: "/favicon-legacy.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
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

const preHydrationCleanScript = `
(function(){
  try {
    var ATTRS = ['bis_skin_checked','bis_use','bis_register'];
    var PREFIXES = ['data-bis-','data-dynamic-id'];
    function clean(){
      var nodes = document.querySelectorAll('*');
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        for (var j = 0; j < ATTRS.length; j++) {
          if (el.hasAttribute(ATTRS[j])) el.removeAttribute(ATTRS[j]);
        }
        var attrs = el.attributes;
        for (var k = attrs.length - 1; k >= 0; k--) {
          var name = attrs[k].name;
          for (var p = 0; p < PREFIXES.length; p++) {
            if (name.indexOf(PREFIXES[p]) === 0) {
              el.removeAttribute(name);
              break;
            }
          }
        }
      }
    }
    clean();
    var obs = new MutationObserver(clean);
    obs.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
    setTimeout(function(){ obs.disconnect(); }, 8000);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${aeonik.variable} ${agrandirNarrow.variable} bg-background font-sans text-foreground antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{ __html: preHydrationCleanScript }}
          suppressHydrationWarning
        />
        <HydrationGuard />
        <GlobalIntroLoader />
        <QueryProvider>
          <SmoothScrollProvider>
            <ScrollProgress />
            <SiteChrome>{children}</SiteChrome>
          </SmoothScrollProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
