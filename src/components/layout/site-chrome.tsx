"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

const ROUTES_WITHOUT_CHROME = ["/login"];
const ROUTES_HIDE_CTA = ["/contato", "/admin/reviews", "/revisao-cliente"];

type SiteChromeProps = {
  children: React.ReactNode;
};

export function SiteChrome({ children }: Readonly<SiteChromeProps>) {
  const pathname = usePathname();

  const hideChrome = ROUTES_WITHOUT_CHROME.some((r) => pathname?.startsWith(r));
  if (hideChrome) {
    return <>{children}</>;
  }

  const hideCta = ROUTES_HIDE_CTA.some((r) => pathname?.startsWith(r));

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter hideCta={hideCta} />
    </>
  );
}
