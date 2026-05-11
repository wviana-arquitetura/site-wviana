import type { Metadata } from "next";
import { privateRouteRobots } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Acesso",
  description: "Acesso restrito ao site do escritório W.VIANA.",
  robots: privateRouteRobots,
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
