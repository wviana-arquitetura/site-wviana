import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Projetos",
  description:
    "Portfólio de arquitetura e interiores: projetos residenciais e comerciais assinados pelo escritório W.VIANA.",
  path: "/projetos",
});

export default function ProjetosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
