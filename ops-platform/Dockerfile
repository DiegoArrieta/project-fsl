# =============================================================================
# Forestal Santa Lucía — ops-platform (Next.js) + Chromium para Puppeteer/PDF
# =============================================================================
# Build (desde la raíz del repo): docker build -f ops-platform/Dockerfile -t fsl-ops ops-platform
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

RUN apk add --no-cache openssl

ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.js ./

RUN npm ci

RUN npx prisma generate

# -----------------------------------------------------------------------------
# Stage 2: Builder
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY --from=deps /app/prisma.config.js ./prisma.config.js

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# -----------------------------------------------------------------------------
# Stage 3: Production Runtime
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Chromium + fuentes para PDF (Puppeteer); dumb-init + OpenSSL (Prisma)
RUN apk add --no-cache \
    dumb-init \
    openssl \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.js ./prisma.config.js
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

RUN mkdir -p ./node_modules ./node_modules/.bin ./node_modules/@prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/.bin ./node_modules/.bin
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/dotenv ./node_modules/dotenv
# Prisma CLI (@prisma/dev, @prisma/config) resuelve muchas dependencias en la raíz de node_modules;
# sin ellas: "Cannot find module 'valibot'" al ejecutar prisma generate / migrate en runtime.
RUN --mount=from=deps,source=/app/node_modules,target=/deps_nm \
    set -eu && \
    for name in \
      valibot hono pathe remeda foreground-child get-port-please http-status-codes \
      proper-lockfile std-env zeptomatch mysql2 postgres c12 deepmerge-ts effect empathic; \
    do \
      if [ -e "/deps_nm/$name" ]; then cp -a "/deps_nm/$name" ./node_modules/; fi; \
    done && \
    if [ -d /deps_nm/@electric-sql ]; then cp -a /deps_nm/@electric-sql ./node_modules/; fi && \
    if [ -d /deps_nm/@hono ]; then cp -a /deps_nm/@hono ./node_modules/; fi && \
    if [ -d /deps_nm/@mrleebo ]; then cp -a /deps_nm/@mrleebo ./node_modules/; fi && \
    chown -R nextjs:nodejs ./node_modules
RUN chmod +x ./node_modules/.bin/* 2>/dev/null || true

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
