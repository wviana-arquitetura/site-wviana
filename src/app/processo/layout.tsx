import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Processo de arquitetura e interiores",
  socialTitle: "Método W.VIANA",
  description:
    "Entenda o método W.VIANA para projetos de arquitetura e interiores em Fortaleza: imersão, conceito, executivo, orçamento e acompanhamento.",
  path: "/processo",
  imageAlt: "Processo de projeto de arquitetura e interiores W.VIANA",
});

export default function ProcessoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
