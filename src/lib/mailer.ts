import 'server-only';
import { env } from './env';
import { logger } from './logger';

/**
 * Transactional email. With no SMTP host configured the message is logged instead of
 * sent, so a fresh self-host install can be tested before mail is wired up.
 */

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

let transporterPromise: Promise<import('nodemailer').Transporter | null> | null = null;

async function getTransporter() {
  if (!env.smtp.host) return null;
  if (!transporterPromise) {
    transporterPromise = (async () => {
      const nodemailer = await import('nodemailer');
      return nodemailer.createTransport({
        host: env.smtp.host,
        port: env.smtp.port,
        secure: env.smtp.secure,
        auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.password } : undefined,
      });
    })();
  }
  return transporterPromise;
}

export async function sendMail(message: MailMessage): Promise<{ sent: boolean; error?: string }> {
  const transporter = await getTransporter();
  if (!transporter) {
    logger.info('email (not sent — SMTP not configured)', {
      to: message.to,
      subject: message.subject,
      preview: message.text.slice(0, 400),
    });
    return { sent: false, error: 'SMTP not configured' };
  }
  try {
    await transporter.sendMail({
      from: env.smtp.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    return { sent: true };
  } catch (error) {
    logger.error('email send failed', { to: message.to, error: (error as Error).message });
    return { sent: false, error: (error as Error).message };
  }
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function layout(options: { heading: string; body: string; cta?: { label: string; url: string }; footnote?: string }): string {
  const cta = options.cta
    ? `<tr><td style="padding:8px 0 24px"><a href="${options.cta.url}" style="display:inline-block;background:#4F46E5;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 24px;border-radius:10px">${escapeHtml(options.cta.label)}</a></td></tr>`
    : '';
  const footnote = options.footnote
    ? `<tr><td style="padding-top:8px;color:#64748B;font-size:13px;line-height:20px">${options.footnote}</td></tr>`
    : '';

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F172A">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:16px;border:1px solid #E2E8F0;overflow:hidden">
        <tr><td style="padding:28px 32px 0">
          <div style="font-size:15px;font-weight:700;letter-spacing:-0.01em;color:#0F172A">
            <span style="display:inline-block;width:22px;height:22px;border-radius:7px;background:linear-gradient(135deg,#4F46E5,#0EA5E9);vertical-align:-5px;margin-right:9px"></span>${escapeHtml(env.appName)}
          </div>
        </td></tr>
        <tr><td style="padding:22px 32px 0">
          <h1 style="margin:0 0 12px;font-size:22px;line-height:30px;letter-spacing:-0.02em">${escapeHtml(options.heading)}</h1>
        </td></tr>
        <tr><td style="padding:0 32px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="font-size:15px;line-height:24px;color:#334155;padding-bottom:20px">${options.body}</td></tr>
            ${cta}
            ${footnote}
          </table>
        </td></tr>
        <tr><td style="padding:24px 32px 28px;border-top:1px solid #E2E8F0;margin-top:16px;color:#94A3B8;font-size:12px;line-height:18px">
          Sent by ${escapeHtml(env.appName)} · <a href="${env.appUrl}" style="color:#64748B">${escapeHtml(env.appUrl.replace(/^https?:\/\//, ''))}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function verificationEmail(email: string, token: string): MailMessage {
  const url = `${env.appUrl}/verify-email?token=${encodeURIComponent(token)}`;
  return {
    to: email,
    subject: `Confirm your email · ${env.appName}`,
    html: layout({
      heading: 'Confirm your email address',
      body: `You are one click away from your ${escapeHtml(env.appName)} account. Confirming your email keeps your QR codes recoverable if you ever lose your password.`,
      cta: { label: 'Confirm email', url },
      footnote: 'This link works for 48 hours. If you did not create an account, you can ignore this email.',
    }),
    text: `Confirm your email address for ${env.appName}: ${url}`,
  };
}

export function passwordResetEmail(email: string, token: string): MailMessage {
  const url = `${env.appUrl}/reset-password?token=${encodeURIComponent(token)}`;
  return {
    to: email,
    subject: `Reset your password · ${env.appName}`,
    html: layout({
      heading: 'Reset your password',
      body: 'Use the button below to choose a new password. Your QR codes keep working normally in the meantime.',
      cta: { label: 'Choose a new password', url },
      footnote: 'The link expires in 2 hours and can be used once. If you did not request this, no action is needed.',
    }),
    text: `Reset your ${env.appName} password: ${url}`,
  };
}

export function inviteEmail(options: {
  email: string;
  workspaceName: string;
  inviterName: string;
  role: string;
  token: string;
}): MailMessage {
  const url = `${env.appUrl}/invite/${encodeURIComponent(options.token)}`;
  return {
    to: options.email,
    subject: `${options.inviterName} invited you to ${options.workspaceName}`,
    html: layout({
      heading: `Join ${escapeHtml(options.workspaceName)}`,
      body: `${escapeHtml(options.inviterName)} invited you to collaborate on QR codes as <strong>${escapeHtml(options.role)}</strong>.`,
      cta: { label: 'Accept invitation', url },
      footnote: 'If you do not have an account yet, you can create one on the same page.',
    }),
    text: `${options.inviterName} invited you to ${options.workspaceName} as ${options.role}: ${url}`,
  };
}

export function welcomeEmail(email: string): MailMessage {
  return {
    to: email,
    subject: `Welcome to ${env.appName}`,
    html: layout({
      heading: `Your QR codes are ready`,
      body: `Thanks for joining ${escapeHtml(env.appName)}. Dynamic QR codes here never expire — they keep working until you pause or delete them, so you can print once and edit the destination forever.`,
      cta: { label: 'Open your dashboard', url: `${env.appUrl}/dashboard` },
    }),
    text: `Welcome to ${env.appName}. Dashboard: ${env.appUrl}/dashboard`,
  };
}

export function abuseDisabledEmail(email: string, qrName: string, reason: string): MailMessage {
  return {
    to: email,
    subject: `A QR code was disabled · ${env.appName}`,
    html: layout({
      heading: 'One of your QR codes was disabled',
      body: `The code <strong>${escapeHtml(qrName)}</strong> was disabled by a platform administrator.<br><br>Reason: ${escapeHtml(reason)}`,
      cta: { label: 'Review in dashboard', url: `${env.appUrl}/dashboard/codes` },
      footnote: 'If you believe this is a mistake, reply to this email and we will review it.',
    }),
    text: `Your QR code "${qrName}" was disabled. Reason: ${reason}`,
  };
}
