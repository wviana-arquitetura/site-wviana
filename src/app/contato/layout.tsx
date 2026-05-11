import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Contato",
  description:
    "Fale com o escritório W.VIANA: orçamento e conversa inicial sobre arquitetura, interiores e novos projetos.",
  path: "/contato",
});

export default function ContatoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
