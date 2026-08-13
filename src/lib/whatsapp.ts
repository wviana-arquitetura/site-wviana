import { BRAND } from "@/lib/brand";
import type { Project } from "@/types/project";

/** Monta o link do wa.me com a mensagem já preenchida. */
export const buildWhatsappUrl = (message: string) =>
  `https://wa.me/${BRAND.whatsappPhone}?text=${encodeURIComponent(message)}`;

/**
 * Mensagem de quem se interessou por um projeto específico. O escritório já
 * recebe nome, tipologia, cidade e o link — o visitante não precisa explicar de
 * onde veio. O projeto entra como referência do que despertou o interesse, não
 * como algo a ser copiado: quem contrata quer o projeto DELE.
 */
export const projectInquiryMessage = (project: Project) => {
  // Boa parte dos projetos já se chama "Residencial XX" / "Comercial XX" —
  // repetir a tipologia entre parênteses soa robótico. Só entra quando o título
  // não a carrega.
  const context = project.title
    .toLowerCase()
    .includes(project.typology.toLowerCase())
    ? project.location
    : `${project.typology}, ${project.location}`;

  return [
    `Olá! Vim pelo site da W.Viana e gostei do projeto “${project.title}” (${context}).`,
    // Casa com o rótulo do CTA do card ("Solicite um orçamento") — o botão
    // promete pedido de orçamento, a mensagem tem que chegar pedindo isso.
    "Gostaria de solicitar um orçamento.",
    "",
    `${BRAND.siteUrl.replace(/\/$/, "")}/projetos/${project.slug}`,
  ].join("\n");
};

export const projectWhatsappUrl = (project: Project) =>
  buildWhatsappUrl(projectInquiryMessage(project));
