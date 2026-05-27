"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { FloatingContact } from "./floating-contact";

const ROUTES_HIDE_CTA = ["/contato"];

// Rotas onde o "chrome" público (header, footer, floating CTA) NÃO deve
// aparecer. Painel admin e callbacks de auth têm UI própria.
const ROUTES_NO_CHROME = ["/admin", "/auth"];

type SiteChromeProps = {
  children: React.ReactNode;
};

export function SiteChrome({ children }: Readonly<SiteChromeProps>) {
  const pathname = usePathname();

  const hideChrome = ROUTES_NO_CHROME.some((r) => pathname?.startsWith(r));

  if (hideChrome) {
    return <>{children}</>;
  }

  const hideCta = ROUTES_HIDE_CTA.some((r) => pathname?.startsWith(r));

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter hideCta={hideCta} />
      {!hideCta && <FloatingContact />}
    </>
  );
}
