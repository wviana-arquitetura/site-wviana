import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Projetos",
  description:
    "Projetos de arquitetura e interiores do escritório W.VIANA: obras residenciais e comerciais com assinatura autoral.",
  path: "/projetos",
});

export default function ProjetosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
