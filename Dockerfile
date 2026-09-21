# Multi-stage Dockerfile for the user-facing Next.js frontend.
# Built for linux/arm64 (Graviton) in deploy/docker-compose.prod.yml.

FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars are inlined into the client bundle at build time.
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_ENABLE_ANALYTICS=false
ARG NEXT_PUBLIC_ENABLE_PWA=false
ARG NEXT_PUBLIC_SENTRY_DSN=
# Docker builds have no reachable gateway; routes render dynamically at request time.
ARG SKIP_ARTICLE_PRERENDER=1
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
    NEXT_PUBLIC_ENABLE_ANALYTICS=$NEXT_PUBLIC_ENABLE_ANALYTICS \
    NEXT_PUBLIC_ENABLE_PWA=$NEXT_PUBLIC_ENABLE_PWA \
    NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN \
    SKIP_ARTICLE_PRERENDER=$SKIP_ARTICLE_PRERENDER \
    NEXT_TELEMETRY_DISABLED=1
RUN bun run build

FROM node:22-alpine AS runner
WORKDIR /app
# Docker sets HOSTNAME to the container ID; Next standalone would bind to it
# instead of all interfaces. Pin it for predictable binding.
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
