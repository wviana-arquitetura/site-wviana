import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import Script from "next/script";
import { GlobalIntroLoader } from "@/components/providers/GlobalIntroLoader";
import { SiteChrome } from "@/components/layout/site-chrome";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { BRAND } from "@/lib/brand";
import { GTM_ID } from "@/lib/analytics";
import {
  defaultDescription,
  defaultOgDescription,
  defaultOgImageAlt,
  defaultOgImagePath,
} from "@/lib/seo";

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

export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "W.VIANA — Arquitetura | Interiores",
    template: "%s | W.VIANA",
  },
  description: defaultDescription,
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
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: BRAND.name,
    title: "W.VIANA — Arquitetura | Interiores",
    description: defaultOgDescription,
    images: [{ url: defaultOgImagePath, alt: defaultOgImageAlt }],
  },
  twitter: {
    card: "summary_large_image",
    title: "W.VIANA — Arquitetura | Interiores",
    description: defaultOgDescription,
    images: [defaultOgImagePath],
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

const gtmScript = GTM_ID
  ? `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');
`
  : "";

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
        {GTM_ID ? (
          <>
            <Script id="gtm-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: gtmScript }} />
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
                title="Google Tag Manager"
              />
            </noscript>
          </>
        ) : null}
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <GlobalIntroLoader />
        <QueryProvider>
          <Suspense>
            <SmoothScrollProvider>
              <ScrollProgress />
              <SiteChrome>{children}</SiteChrome>
            </SmoothScrollProvider>
          </Suspense>
        </QueryProvider>
      </body>
    </html>
  );
}
