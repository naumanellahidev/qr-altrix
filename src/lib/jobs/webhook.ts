import 'server-only';
import { createHmac } from 'node:crypto';
import { prisma } from '../db';
import { logger } from '../logger';
import { enqueue } from '../queue';
import { isDeveloperApiEnabled } from '../settings';

/** Outgoing webhooks are signed so receivers can verify the payload came from here. */

export function signWebhookPayload(secret: string, body: string, timestamp: number): string {
  return createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
}

export async function deliverWebhookEvent(
  workspaceId: string,
  event: string,
  payload: Record<string, unknown>,
): Promise<void> {
  // Webhooks belong to the developer API: nothing is sent while an admin has it off.
  if (!(await isDeveloperApiEnabled())) return;
  const hooks = await prisma.webhook.findMany({
    where: { workspaceId, isActive: true, events: { has: event } },
    select: { id: true },
  });
  for (const hook of hooks) {
    await enqueue('webhook.deliver', { webhookId: hook.id, event, payload });
  }
}

export async function deliverWebhook(input: {
  webhookId: string;
  event: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  if (!(await isDeveloperApiEnabled())) return;
  const hook = await prisma.webhook.findUnique({ where: { id: input.webhookId } });
  if (!hook || !hook.isActive) return;

  const timestamp = Math.floor(Date.now() / 1000);
  const body = JSON.stringify({
    event: input.event,
    createdAt: new Date().toISOString(),
    data: input.payload,
  });
  const signature = signWebhookPayload(hook.secret, body, timestamp);

  try {
    const response = await fetch(hook.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'QR-ALTRIX-Webhook/1.0',
        'x-qraltrix-event': input.event,
        'x-qraltrix-timestamp': String(timestamp),
        'x-qraltrix-signature': `sha256=${signature}`,
      },
      body,
      signal: AbortSignal.timeout(10_000),
    });

    await prisma.webhook.update({
      where: { id: hook.id },
      data: {
        lastStatus: response.status,
        lastFiredAt: new Date(),
        failureCount: response.ok ? 0 : { increment: 1 },
        // A consistently failing endpoint is parked rather than retried forever.
        isActive: !response.ok && hook.failureCount >= 24 ? false : hook.isActive,
      },
    });
  } catch (error) {
    logger.warn('webhook delivery failed', { webhookId: hook.id, error: (error as Error).message });
    await prisma.webhook.update({
      where: { id: hook.id },
      data: { lastFiredAt: new Date(), lastStatus: 0, failureCount: { increment: 1 } },
    });
  }
}
