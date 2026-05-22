const CONTACT_EMAIL = "contato@wvarq.com";

/** Assunto + corpo padrão (mesmo tom do link do WhatsApp). */
const MAILTO_SUBJECT = "Contato pelo site";
const MAILTO_BODY = `Olá,

Vim pelo site e gostaria de conversar sobre um projeto.

`;

export const BRAND = {
  name: "W.Viana | Arquitetura",
  email: CONTACT_EMAIL,
  /** Link mailto com mensagem inicial para o cliente só complementar e enviar. */
  mailtoUrl: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(MAILTO_SUBJECT)}&body=${encodeURIComponent(MAILTO_BODY)}`,
  siteUrl: "https://wvianaarquitetura.com.br",
  whatsappPhone: "5585997177666",
  whatsappPhoneFormatted: "+55 85 9971-7666",
  whatsappUrl:
    "https://wa.me/5585997177666?text=Olá,%20vim%20pelo%20site%20e%20gostaria%20de%20conversar%20sobre%20um%20projeto.",
  location: "Fortaleza, CE",
  instagramUrl: "https://www.instagram.com/wviana.arq/",
  pinterestUrl: "https://br.pinterest.com/wviana_arq/",
  /** Dados legais (LGPD / Marco Civil) — usados em política, termos e footer. */
  legal: {
    razaoSocial: "Wellington Andrade Viana Arquitetura",
    cnpj: "49.493.768/0001-33",
    enderecoComercial: "Rua Vicente Linhares, 521 — Ed. Humberto Santana Business, Aldeota, Fortaleza-CE",
    encarregadoNome: "Wellington Andrade Viana",
    encarregadoEmail: CONTACT_EMAIL,
  },
} as const;
