import { prisma } from '@/lib/db';
import { actorCan, resolveActor } from '@/lib/api/actor';
import { fail, ok, readJson, withApi } from '@/lib/api/respond';
import { webhookSchema } from '@/lib/validation';
import { deliverWebhook } from '@/lib/jobs/webhook';
import { developerApiGate } from '@/lib/api/developer';

type Context = { params: Promise<{ id: string }> };

export const PATCH = withApi(async (request: Request, context: Context) => {
  const gate = await developerApiGate();
  if (gate) return gate;
  const { id } = await context.params;
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'webhook.manage')) return fail('This key cannot manage webhooks', 403);

  const hook = await prisma.webhook.findFirst({ where: { id, workspaceId: actor.workspaceId } });
  if (!hook) return fail('Webhook not found', 404);

  const body = await readJson<{ action?: string }>(request);
  if (body.action === 'test') {
    await deliverWebhook({
      webhookId: id,
      event: 'qr.scanned',
      payload: { test: true, message: 'This is a test delivery from QR ALTRIX' },
    });
    const refreshed = await prisma.webhook.findUnique({ where: { id } });
    return ok({ data: { lastStatus: refreshed?.lastStatus ?? null, lastFiredAt: refreshed?.lastFiredAt ?? null } });
  }

  const parsed = webhookSchema.partial().safeParse(body);
  if (!parsed.success) return fail('Check the webhook fields', 400);

  const updated = await prisma.webhook.update({
    where: { id },
    data: {
      url: parsed.data.url ?? hook.url,
      events: parsed.data.events ?? hook.events,
      isActive: parsed.data.isActive ?? hook.isActive,
      // Re-enabling a parked endpoint resets its failure streak.
      failureCount: parsed.data.isActive ? 0 : hook.failureCount,
    },
  });

  return ok({ data: updated });
});

export const DELETE = withApi(async (request: Request, context: Context) => {
  const gate = await developerApiGate();
  if (gate) return gate;
  const { id } = await context.params;
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'webhook.manage')) return fail('This key cannot manage webhooks', 403);

  const hook = await prisma.webhook.findFirst({ where: { id, workspaceId: actor.workspaceId } });
  if (!hook) return fail('Webhook not found', 404);

  await prisma.webhook.delete({ where: { id } });
  return ok({ deleted: true });
});
