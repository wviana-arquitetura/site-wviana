export type ContactLeadPayload = {
  name?: string;
  email?: string;
  projectType?: string;
  message?: string;
  /** Honeypot anti-bot: humanos não veem este campo. Sempre vazio em submissões legítimas. */
  website?: string;
};

const API_PATH = "/api/contact";

/**
 * Envia o lead para o backend de forma fire-and-forget.
 *
 * Usa `keepalive: true` para que a request sobreviva ao redirect do
 * `window.open(whatsappLink)` que acontece logo depois. Em iOS Safari,
 * sem isso a request seria cancelada quando a aba perde foco.
 *
 * Não lança erro: se a captura falhar, o usuário não pode ser punido —
 * o fluxo do WhatsApp continua normalmente. Erros são apenas logados.
 */
export function submitContactLead(payload: ContactLeadPayload): void {
  if (typeof window === "undefined") return;

  const hasAnyField = Boolean(
    payload.name || payload.email || payload.projectType || payload.message,
  );
  if (!hasAnyField) return;

  try {
    void fetch(API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch((error) => {
      console.error("[contact-lead] submit failed", error);
    });
  } catch (error) {
    console.error("[contact-lead] submit threw", error);
  }
}
