import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Projetos de arquitetura e interiores em Fortaleza",
  socialTitle: "Projetos W.VIANA",
  description:
    "Conheça projetos residenciais, comerciais e corporativos do escritório W.VIANA em Fortaleza e no Ceará.",
  path: "/projetos",
  ogImagePath: "/og/default",
  imageAlt: "Portfólio de projetos residenciais e comerciais W.VIANA",
});

export default function ProjetosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
