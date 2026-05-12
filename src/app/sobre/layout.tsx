import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Sobre Wellington Viana",
  socialTitle: "Sobre a W.VIANA",
  description:
    "Conheça Wellington Viana e o escritório W.VIANA, especializado em arquitetura e interiores em Fortaleza com projetos autorais.",
  path: "/sobre",
  imageAlt: "Wellington Viana, fundador do escritório W.VIANA em Fortaleza",
});

export default function SobreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
