import type { Metadata } from "next";
import { privateRouteRobots } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Revisão de conteúdo",
  description: "Formulário interno de revisão de conteúdo do site W.VIANA.",
  robots: privateRouteRobots,
};

export default function RevisaoClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
