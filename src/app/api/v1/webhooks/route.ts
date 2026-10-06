import { prisma } from '@/lib/db';
import { actorCan, resolveActor } from '@/lib/api/actor';
import { created, fail, ok, readJson, withApi } from '@/lib/api/respond';
import { webhookSchema } from '@/lib/validation';
import { randomToken } from '@/lib/utils';
import { logSecurity } from '@/lib/audit';
import { developerApiGate } from '@/lib/api/developer';

export const GET = withApi(async (request: Request) => {
  const gate = await developerApiGate();
  if (gate) return gate;
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  if (!actorCan(result.actor, 'webhook.manage')) return fail('This key cannot read webhooks', 403);

  const hooks = await prisma.webhook.findMany({
    where: { workspaceId: result.actor.workspaceId },
    orderBy: { createdAt: 'desc' },
  });

  return ok({
    data: hooks.map((hook) => ({
      id: hook.id,
      url: hook.url,
      events: hook.events,
      isActive: hook.isActive,
      lastStatus: hook.lastStatus,
      lastFiredAt: hook.lastFiredAt,
      failureCount: hook.failureCount,
      createdAt: hook.createdAt,
      // The secret is shown so the receiver can verify signatures.
      secret: hook.secret,
    })),
  });
});

export const POST = withApi(async (request: Request) => {
  const gate = await developerApiGate();
  if (gate) return gate;
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'webhook.manage')) return fail('This key cannot manage webhooks', 403);

  const parsed = webhookSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Check the webhook', 400);

  const count = await prisma.webhook.count({ where: { workspaceId: actor.workspaceId } });
  if (count >= 20) return fail('A workspace can have at most 20 webhooks', 400);

  const hook = await prisma.webhook.create({
    data: {
      workspaceId: actor.workspaceId,
      url: parsed.data.url,
      events: parsed.data.events,
      isActive: parsed.data.isActive,
      secret: `whsec_${randomToken(20)}`,
    },
  });

  await logSecurity({
    type: 'WEBHOOK_CREATED',
    userId: actor.userId,
    workspaceId: actor.workspaceId,
    headers: request.headers,
    meta: { url: hook.url, events: hook.events },
  });

  return created({ data: hook });
});
