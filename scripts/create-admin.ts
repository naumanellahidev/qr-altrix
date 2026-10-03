/**
 * Creates (or promotes) a platform administrator.
 *
 *   npm run admin:create -- --email you@example.com [--password 'secret'] [--name Nauman]
 *
 * With no --password a strong one is generated and printed once. The account is created
 * with its email already confirmed, given its own workspace, and marked as a platform
 * administrator. Running it again for the same email resets that account's password and
 * re-grants admin, which is the intended recovery path if a password is lost.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomInt } from 'node:crypto';

const prisma = new PrismaClient();

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  return value && !value.startsWith('--') ? value : undefined;
}

/**
 * Readable but strong: four distinct words from a 64-word list, a number and a symbol.
 * That is about 2^37 of word entropy alone, and bcrypt at cost 12 does the rest. Easier
 * to type correctly on a phone than a random blob, which matters for a password someone
 * has to use before their password manager knows about it.
 */
function generatePassword(): string {
  const words = [
    'harbor', 'lantern', 'copper', 'meadow', 'cobalt', 'ember', 'quartz', 'willow',
    'summit', 'cascade', 'orchard', 'falcon', 'marble', 'cedar', 'nimbus', 'saffron',
    'juniper', 'onyx', 'pelican', 'thistle', 'velvet', 'zephyr', 'basalt', 'citrine',
    'anchor', 'beacon', 'canyon', 'driftwood', 'estuary', 'fathom', 'granite', 'hollow',
    'indigo', 'jasmine', 'kestrel', 'lagoon', 'mosaic', 'nectar', 'obsidian', 'prairie',
    'quiver', 'rosewood', 'sandstone', 'tundra', 'umber', 'verbena', 'walnut', 'yarrow',
    'alcove', 'bramble', 'cinder', 'dovetail', 'eclipse', 'fennel', 'glacier', 'heather',
    'ivory', 'junction', 'kindling', 'lattice', 'mistral', 'noble', 'opaline', 'plinth',
  ];
  const symbols = '!@#$%&*?';

  // Distinct words: a repeat looks like a mistake and quietly costs entropy.
  const picked: string[] = [];
  while (picked.length < 4) {
    const word = words[randomInt(words.length)];
    if (!picked.includes(word)) picked.push(word);
  }

  return `${picked.join('-')}-${randomInt(100, 1000)}${symbols[randomInt(symbols.length)]}`;
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50) || 'workspace'
  );
}

async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  for (let attempt = 2; attempt < 50; attempt += 1) {
    const clash = await prisma.workspace.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!clash) return candidate;
    candidate = `${root}-${attempt}`;
  }
  return `${root}-${randomInt(1000, 9999)}`;
}

async function main() {
  const email = (arg('email') ?? process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error('✖ Pass a valid address: --email you@example.com');
    process.exitCode = 1;
    return;
  }

  const password = arg('password') ?? process.env.ADMIN_PASSWORD ?? generatePassword();
  const generated = !arg('password') && !process.env.ADMIN_PASSWORD;

  if (password.length < 10) {
    console.error('✖ Use at least 10 characters for an administrator password.');
    process.exitCode = 1;
    return;
  }

  const name = arg('name') ?? email.split('@')[0];
  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        isPlatformAdmin: true,
        isDisabled: false,
        emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
        // Invalidate every existing session for this account.
        sessionVersion: { increment: 1 },
      },
    });

    // Make sure they still have a workspace to land in.
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: existing.id, status: 'ACTIVE' },
      select: { id: true },
    });
    if (!membership) {
      const slug = await uniqueSlug(`${name} workspace`);
      await prisma.workspace.create({
        data: {
          name: `${name}'s workspace`,
          slug,
          ownerId: existing.id,
          members: {
            create: { userId: existing.id, email, role: 'OWNER', status: 'ACTIVE', acceptedAt: new Date() },
          },
        },
      });
    }

    await prisma.securityEvent.create({
      data: {
        type: 'PASSWORD_CHANGED',
        userId: existing.id,
        email,
        meta: { via: 'create-admin script', promoted: true },
      },
    });

    console.log('✔ Existing account updated: password reset, platform admin granted, other sessions signed out.');
  } else {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        emailVerifiedAt: new Date(),
        isPlatformAdmin: true,
      },
    });

    const slug = await uniqueSlug(`${name} workspace`);
    await prisma.workspace.create({
      data: {
        name: `${name}'s workspace`,
        slug,
        ownerId: user.id,
        members: {
          create: { userId: user.id, email, role: 'OWNER', status: 'ACTIVE', acceptedAt: new Date() },
        },
      },
    });

    console.log('✔ Administrator created.');
  }

  console.log('');
  console.log('  email:    ' + email);
  console.log('  password: ' + password);
  console.log('');
  if (generated) {
    console.log('  This password was generated and is shown only now. Store it in your password manager.');
  }
  console.log('  Sign in, then turn on two-factor authentication in Settings → Security.');
}

main()
  .catch((error) => {
    console.error('✖ Failed');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
