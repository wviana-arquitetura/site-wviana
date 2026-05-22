import { NextResponse } from "next/server";
import { Resend } from "resend";
import type { ContactLeadPayload } from "@/lib/contact-lead";

export const runtime = "nodejs";

const FROM_EMAIL = process.env.LEAD_FROM_EMAIL ?? "onboarding@resend.dev";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const LEAD_NOTIFICATION_EMAIL = process.env.LEAD_NOTIFICATION_EMAIL;
const LEADS_SHEET_WEBHOOK_URL = process.env.LEADS_SHEET_WEBHOOK_URL;

const MAX_FIELD_LENGTH = 5000;
const MAX_EMAIL_LENGTH = 254;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const sanitize = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, MAX_FIELD_LENGTH);
};

const isValidEmail = (value: string): boolean => {
  if (!value) return true;
  if (value.length > MAX_EMAIL_LENGTH) return false;
  return EMAIL_REGEX.test(value);
};

const escapeHtml = (raw: string): string =>
  raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const renderEmailHtml = (lead: Required<ContactLeadPayload>): string => {
  const rows: string[] = [];
  if (lead.name) rows.push(`<tr><td><strong>Nome</strong></td><td>${escapeHtml(lead.name)}</td></tr>`);
  if (lead.email) rows.push(`<tr><td><strong>E-mail</strong></td><td>${escapeHtml(lead.email)}</td></tr>`);
  if (lead.projectType) rows.push(`<tr><td><strong>Tipo de projeto</strong></td><td>${escapeHtml(lead.projectType)}</td></tr>`);

  const messageBlock = lead.message
    ? `<p style="margin-top:24px"><strong>Mensagem</strong></p><p style="white-space:pre-wrap;line-height:1.6">${escapeHtml(lead.message)}</p>`
    : "";

  return `<!doctype html>
<html lang="pt-BR">
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111;line-height:1.5;max-width:560px;margin:0 auto;padding:24px">
  <h1 style="font-size:18px;font-weight:600;margin:0 0 16px">Novo lead pelo site W.VIANA</h1>
  <table style="width:100%;border-collapse:collapse;font-size:14px">${rows.join("")}</table>
  ${messageBlock}
  <hr style="border:none;border-top:1px solid #eee;margin:32px 0 12px" />
  <p style="font-size:12px;color:#888;margin:0">Enviado automaticamente pelo formulário de contato.</p>
</body>
</html>`;
};

const renderEmailText = (lead: Required<ContactLeadPayload>): string => {
  const lines: string[] = ["Novo lead pelo site W.VIANA", ""];
  if (lead.name) lines.push(`Nome: ${lead.name}`);
  if (lead.email) lines.push(`E-mail: ${lead.email}`);
  if (lead.projectType) lines.push(`Tipo de projeto: ${lead.projectType}`);
  if (lead.message) {
    lines.push("", "Mensagem:", lead.message);
  }
  return lines.join("\n");
};

const sendEmail = async (lead: Required<ContactLeadPayload>): Promise<void> => {
  if (!RESEND_API_KEY) {
    console.error("[contact] RESEND_API_KEY ausente — email não enviado");
    return;
  }
  if (!LEAD_NOTIFICATION_EMAIL) {
    console.error("[contact] LEAD_NOTIFICATION_EMAIL ausente — email não enviado");
    return;
  }

  const resend = new Resend(RESEND_API_KEY);
  const subjectName = lead.name || lead.email || "sem identificação";

  const result = await resend.emails.send({
    from: `W.VIANA Site <${FROM_EMAIL}>`,
    to: [LEAD_NOTIFICATION_EMAIL],
    replyTo: lead.email || undefined,
    subject: `Novo lead — ${subjectName}`,
    html: renderEmailHtml(lead),
    text: renderEmailText(lead),
  });

  if (result.error) {
    console.error("[contact] resend retornou erro", result.error);
    throw new Error(result.error.message ?? "Resend error");
  }
};

const sendToSheet = async (lead: Required<ContactLeadPayload>): Promise<void> => {
  if (!LEADS_SHEET_WEBHOOK_URL) {
    console.error("[contact] LEADS_SHEET_WEBHOOK_URL ausente — planilha não atualizada");
    return;
  }

  const response = await fetch(LEADS_SHEET_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      name: lead.name,
      email: lead.email,
      projectType: lead.projectType,
      message: lead.message,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("[contact] apps script falhou", response.status, body);
    throw new Error(`Sheet webhook ${response.status}`);
  }
};

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const payload = raw as Partial<ContactLeadPayload> | null;
  const lead = {
    name: sanitize(payload?.name),
    email: sanitize(payload?.email),
    projectType: sanitize(payload?.projectType),
    message: sanitize(payload?.message),
  } satisfies Required<ContactLeadPayload>;

  const hasAnyField = Boolean(lead.name || lead.email || lead.projectType || lead.message);
  if (!hasAnyField) {
    return NextResponse.json({ ok: false, error: "empty_payload" }, { status: 400 });
  }

  if (!isValidEmail(lead.email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const results = await Promise.allSettled([sendEmail(lead), sendToSheet(lead)]);
  const failures = results.filter((r) => r.status === "rejected");

  if (failures.length === results.length) {
    return NextResponse.json({ ok: false, error: "all_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, partial: failures.length > 0 });
}
