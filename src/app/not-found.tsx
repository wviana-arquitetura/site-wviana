import type { Metadata } from "next";
import { NotFoundContent } from "@/components/not-found/not-found-content";
import { privateRouteRobots } from "@/lib/seo";
import { getAllProjects } from "@/services/projects.service";

export const metadata: Metadata = {
  title: "Página não encontrada",
  description: "O endereço não existe ou foi removido.",
  robots: privateRouteRobots,
};

export default async function NotFound() {
  const featured = (await getAllProjects()).slice(0, 3);
  return <NotFoundContent featured={featured} />;
}
