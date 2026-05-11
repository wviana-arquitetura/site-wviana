import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Processo",
  description:
    "Método W.VIANA: etapas claras de arquitetura e interiores, da imersão ao projeto executivo, com previsibilidade e alinhamento.",
  path: "/processo",
});

export default function ProcessoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
