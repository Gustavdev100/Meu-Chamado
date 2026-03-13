import nodemailer from "nodemailer";
import type { Ticket } from "@shared/schema";
import { log } from "./index";

// Criar transporter SMTP (Office 365 / Vale)
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "465"),
    secure: true, // Use SSL/TLS for port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const FROM = () =>
  process.env.EMAIL_FROM ||
  `Meu Chamado <${process.env.EMAIL_USER}>`;

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "Aguardando";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    open: "🟡 Aberto",
    in_progress: "🔵 Em Andamento",
    resolved: "🟢 Resolvido",
    closed: "⚫ Fechado",
  };
  return map[status] ?? status;
}

function buildDeadlinesHtml(ticket: Ticket): string {
  if (ticket.type === "MID") {
    return `
      <tr><td style="padding:6px 12px;color:#888;">Prazo de Busca:</td>
          <td style="padding:6px 12px;font-weight:600;">${formatDate(ticket.deadlinePickup)}</td></tr>`;
  }
  return `
    <tr><td style="padding:6px 12px;color:#888;">Prazo Visita Técnica:</td>
        <td style="padding:6px 12px;font-weight:600;">${formatDate(ticket.deadlineVisit)}</td></tr>
    <tr><td style="padding:6px 12px;color:#888;">Prazo Orçamento:</td>
        <td style="padding:6px 12px;font-weight:600;">${formatDate(ticket.deadlineQuote)}</td></tr>
    <tr><td style="padding:6px 12px;color:#888;">Prazo Entrega:</td>
        <td style="padding:6px 12px;font-weight:600;">${formatDate(ticket.deadlineDelivery)}</td></tr>`;
}

function baseEmailHtml(ticket: Ticket, body: string): string {
  const ticketNum = String(ticket.id).padStart(6, "0");
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Segoe UI,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#007e7a,#005f5c);padding:28px 32px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">📋 Meu Chamado - CN</h1>
          <p style="margin:6px 0 0;color:#b2dfdb;font-size:14px;">Plataforma de Solicitações Unificada</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          ${body}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8f9fa;padding:18px 32px;text-align:center;border-top:1px solid #eee;">
          <p style="margin:0;color:#aaa;font-size:12px;">
            Chamado <strong>#${ticketNum}</strong> · Solicitante: ${ticket.contactName}<br>
            Este é um e-mail automático, não responda.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── E-mail 1: Confirmação de Criação ─────────────────────────────────────────

export async function sendTicketConfirmation(ticket: Ticket): Promise<void> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    log("E-mail não configurado — pulando envio de confirmação", "email");
    return;
  }
  const ticketNum = String(ticket.id).padStart(6, "0");

  const body = `
    <h2 style="color:#007e7a;margin-top:0;">✅ Solicitação Recebida!</h2>
    <p style="color:#555;">Olá, <strong>${ticket.contactName}</strong>! Sua solicitação foi registrada com sucesso e nossa equipe irá analisá-la em breve.</p>

    <table cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e9ecef;border-radius:8px;overflow:hidden;margin:20px 0;font-size:14px;">
      <tr style="background:#f8f9fa;">
        <td colspan="2" style="padding:10px 12px;font-weight:700;color:#333;border-bottom:1px solid #e9ecef;">
          📄 Detalhes da Solicitação
        </td>
      </tr>
      <tr><td style="padding:6px 12px;color:#888;">Número:</td>
          <td style="padding:6px 12px;font-weight:700;color:#007e7a;">#${ticketNum}</td></tr>
      <tr style="background:#f8f9fa;">
          <td style="padding:6px 12px;color:#888;">Tipo:</td>
          <td style="padding:6px 12px;">${ticket.type}</td></tr>
      <tr><td style="padding:6px 12px;color:#888;">Status:</td>
          <td style="padding:6px 12px;">${statusLabel(ticket.status)}</td></tr>
      <tr style="background:#f8f9fa;">
          <td style="padding:6px 12px;color:#888;">Cidade / Base:</td>
          <td style="padding:6px 12px;">${ticket.city} — ${ticket.base}</td></tr>
      <tr><td style="padding:6px 12px;color:#888;">Data da Solicitação:</td>
          <td style="padding:6px 12px;">${formatDate(ticket.createdAt)}</td></tr>
      ${ticket.description ? `<tr style="background:#f8f9fa;"><td style="padding:6px 12px;color:#888;vertical-align:top;">Descrição:</td>
          <td style="padding:6px 12px;">${ticket.description}</td></tr>` : ""}
    </table>

    <p style="color:#555;font-size:13px;">Você receberá um novo e-mail quando houver atualização no seu chamado.</p>
    <p style="color:#555;font-size:13px;">Para acompanhar, acesse o sistema e use seu e-mail na aba <strong>Acompanhar</strong>.</p>
  `;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: FROM(),
    to: ticket.contactEmail,
    subject: `✅ Chamado #${ticketNum} recebido — ${ticket.type}`,
    html: baseEmailHtml(ticket, body),
  });

  log(`📧 Confirmação enviada para ${ticket.contactEmail} (ticket #${ticketNum})`, "email");
}

// ─── E-mail 2: Atualização pelo Admin ─────────────────────────────────────────

export async function sendTicketUpdate(ticket: Ticket): Promise<void> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    log("E-mail não configurado — pulando envio de atualização", "email");
    return;
  }
  const ticketNum = String(ticket.id).padStart(6, "0");

  const body = `
    <h2 style="color:#007e7a;margin-top:0;">🔔 Atualização no seu Chamado</h2>
    <p style="color:#555;">Olá, <strong>${ticket.contactName}</strong>! Houve uma atualização na sua solicitação <strong>#${ticketNum}</strong>.</p>

    <table cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e9ecef;border-radius:8px;overflow:hidden;margin:20px 0;font-size:14px;">
      <tr style="background:#f8f9fa;">
        <td colspan="2" style="padding:10px 12px;font-weight:700;color:#333;border-bottom:1px solid #e9ecef;">
          📋 Status Atual
        </td>
      </tr>
      <tr><td style="padding:6px 12px;color:#888;">Número:</td>
          <td style="padding:6px 12px;font-weight:700;color:#007e7a;">#${ticketNum}</td></tr>
      <tr style="background:#f8f9fa;">
          <td style="padding:6px 12px;color:#888;">Tipo:</td>
          <td style="padding:6px 12px;">${ticket.type}</td></tr>
      <tr><td style="padding:6px 12px;color:#888;">Status:</td>
          <td style="padding:6px 12px;">${statusLabel(ticket.status)}</td></tr>
      <tr style="background:#f8f9fa;">
          <td style="padding:6px 12px;color:#888;">Cidade / Base:</td>
          <td style="padding:6px 12px;">${ticket.city} — ${ticket.base}</td></tr>
      ${buildDeadlinesHtml(ticket)}
      ${ticket.adminObservations ? `
      <tr style="background:#fffde7;">
        <td style="padding:10px 12px;color:#888;vertical-align:top;">📝 Observações:</td>
        <td style="padding:10px 12px;color:#333;">${ticket.adminObservations}</td>
      </tr>` : ""}
      ${ticket.adminPhotoUrl ? `
      <tr>
        <td style="padding:6px 12px;color:#888;">Anexo:</td>
        <td style="padding:6px 12px;"><a href="${ticket.adminPhotoUrl}" style="color:#007e7a;">📷 Ver foto anexada</a></td>
      </tr>` : ""}
    </table>

    <p style="color:#555;font-size:13px;">Para ver todos os detalhes, acesse o sistema na aba <strong>Acompanhar</strong> usando seu e-mail.</p>
  `;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: FROM(),
    to: ticket.contactEmail,
    subject: `🔔 Atualização no Chamado #${ticketNum} — ${ticket.type}`,
    html: baseEmailHtml(ticket, body),
  });

  log(`📧 Atualização enviada para ${ticket.contactEmail} (ticket #${ticketNum})`, "email");
}
