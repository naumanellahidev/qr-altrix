import { prisma } from '@/lib/db';
import { actorCan, resolveActor } from '@/lib/api/actor';
import { created, fail, ok, readJson, withApi } from '@/lib/api/respond';
import { templateSchema } from '@/lib/validation';
import { logActivity } from '@/lib/audit';

type Context = { params: Promise<{ id: string }> };

export const PATCH = withApi(async (request: Request, context: Context) => {
  const { id } = await context.params;
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'template.manage')) return fail('This key cannot manage templates', 403);

  const parsed = templateSchema.partial().safeParse(await readJson(request));
  if (!parsed.success) return fail('Check the template fields', 400);

  const template = await prisma.qRTemplate.findFirst({ where: { id, workspaceId: actor.workspaceId } });
  if (!template) return fail('Template not found', 404);

  if (parsed.data.isDefault) {
    await prisma.qRTemplate.updateMany({
      where: { workspaceId: actor.workspaceId, id: { not: id } },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.qRTemplate.update({
    where: { id },
    data: {
      name: parsed.data.name ?? template.name,
      design: (parsed.data.design ?? (template.design as object)) as object,
      isDefault: parsed.data.isDefault ?? template.isDefault,
    },
  });

  await logActivity({
    workspaceId: actor.workspaceId,
    userId: actor.userId,
    action: 'template.updated',
    entityType: 'QRTemplate',
    entityId: id,
    meta: { name: updated.name },
  });

  return ok({ data: updated });
});

export const DELETE = withApi(async (request: Request, context: Context) => {
  const { id } = await context.params;
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'template.manage')) return fail('This key cannot manage templates', 403);

  const template = await prisma.qRTemplate.findFirst({ where: { id, workspaceId: actor.workspaceId } });
  if (!template) return fail('Template not found', 404);

  await prisma.qRTemplate.delete({ where: { id } });
  await logActivity({
    workspaceId: actor.workspaceId,
    userId: actor.userId,
    action: 'template.deleted',
    entityType: 'QRTemplate',
    entityId: id,
    meta: { name: template.name },
  });

  return ok({ deleted: true });
});

/** POST duplicates the template, which is how "Duplicate" works in the UI. */
export const POST = withApi(async (request: Request, context: Context) => {
  const { id } = await context.params;
  const result = await resolveActor(request);
  if (!result.ok) return fail(result.error, result.status, { headers: result.headers });
  const { actor } = result;
  if (!actorCan(actor, 'template.manage')) return fail('This key cannot manage templates', 403);

  const template = await prisma.qRTemplate.findFirst({ where: { id, workspaceId: actor.workspaceId } });
  if (!template) return fail('Template not found', 404);

  let name = `${template.name} (copy)`;
  let attempt = 2;
  while (
    await prisma.qRTemplate.findFirst({
      where: { workspaceId: actor.workspaceId, name: { equals: name, mode: 'insensitive' } },
      select: { id: true },
    })
  ) {
    name = `${template.name} (copy ${attempt})`;
    attempt += 1;
    if (attempt > 25) break;
  }

  const copy = await prisma.qRTemplate.create({
    data: { workspaceId: actor.workspaceId, name, design: template.design as object, isDefault: false },
  });

  return created({ data: copy });
});
