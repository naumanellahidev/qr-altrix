# syntax=docker/dockerfile:1

############################################
# QR ALTRIX — production image
#
# One image serves both roles:
#   web    → npm start        (Next.js server)
#   worker → npm run worker   (BullMQ background jobs)
#
# The image keeps the TypeScript sources because the worker runs them directly with
# Node's type stripping, which avoids maintaining a second build pipeline.
############################################

FROM node:22-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# openssl is required by Prisma; the fonts let sharp/librsvg render the frame text in
# exported PNG, JPEG and WebP files.
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
     openssl ca-certificates fonts-liberation fontconfig curl \
  && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------- dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma
# postinstall runs `prisma generate`, so the schema has to be present first.
RUN npm ci --no-audit --no-fund

# ---------------------------------------------------------------------- build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# A placeholder URL is enough for `next build`; the real value arrives at runtime.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
ENV AUTH_SECRET="build-only-secret-not-used-at-runtime"
RUN npx prisma generate && npm run build

# --------------------------------------------------------------------- runner
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs qraltrix

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY package.json next.config.mjs tsconfig.json ./
COPY prisma ./prisma
COPY scripts ./scripts
COPY src ./src

# Uploads live here when STORAGE_DRIVER=local; the Compose file mounts a volume over it.
RUN mkdir -p /app/storage && chown -R qraltrix:nodejs /app/storage /app/.next

USER qraltrix
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/api/health || exit 1

CMD ["npm", "start"]
