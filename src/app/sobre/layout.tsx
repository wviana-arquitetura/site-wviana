import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Sobre",
  description:
    "Escritório W.VIANA: arquitetura e interiores em Fortaleza, com foco em materialidade, luz e experiência espacial.",
  path: "/sobre",
});

export default function SobreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
