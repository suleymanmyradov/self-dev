# self-dev — Evolella Web

Consumer web app for **Evolella** — an AI accountability coach that turns goals into daily habits and adapts them when life gets messy. Live at [app.evolella.com](https://app.evolella.com).

Next.js 16 (App Router, React Server Components) application talking to the Evolella gateway API (`/api/v1`). Covers onboarding, daily check-ins, habits & goals, AI coach chat with streaming responses, article library, weekly reviews, progress, billing, and settings.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + Radix UI primitives |
| Server state | TanStack Query |
| AI streaming | Vercel AI SDK (`ai`, `@ai-sdk/openai`) |
| Billing | Paddle.js |
| Observability | Sentry |
| Tests | Vitest (unit), Playwright (e2e) |
| Package manager | Bun |

## Getting started

```bash
bun install
bun dev          # http://localhost:3000
```

## Quality gates

```bash
bun run typecheck   # tsc --noEmit
bun run lint        # eslint
bun run test        # vitest run
bun run test:e2e    # playwright
bun run format      # prettier --write
```

## Deployment

Ships via its own CI pipeline alongside the backend: image builds publish to GHCR and the production VM recreates the container. Marketing/landing site (`evolella.com`) is a separate Cloudflare Pages project.
