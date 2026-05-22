import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Contato para projetos de arquitetura em Fortaleza",
  socialTitle: "Contato W.VIANA",
  description:
    "Fale com o escritório W.VIANA em Fortaleza para conversar sobre projetos residenciais, comerciais, arquitetura e interiores.",
  path: "/contato",
  ogImagePath: "/og/contato",
  imageAlt: "Contato do escritório W.VIANA em Fortaleza",
});

export default function ContatoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
