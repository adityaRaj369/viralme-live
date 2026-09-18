# MakeMeViral — Architecture

## Overview

MakeMeViral is a discovery platform for products, videos, food, deals, creators, and more. The application is a **modular monolith** built with Next.js (App Router), PostgreSQL (Prisma), and Auth.js.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Server Components) |
| Language | TypeScript (strict) |
| Database | PostgreSQL via Prisma ORM |
| Auth | Auth.js (NextAuth v5) — credentials + sessions |
| Styling | Tailwind CSS v4 + design tokens |
| Validation | Zod |
| Payments | Provider adapter interface (Razorpay / mock) |
| Email | Provider adapter interface (console / SMTP) |
| Charts | Recharts |
| Tests | Vitest |

## Brand

**MakeMeViral** — discover what's trending.

## Module Boundaries

```
src/
  app/                 # Routes (public, dashboard, admin, API)
  components/          # Shared UI (design system + cards)
  features/            # Feature-scoped UI compositions
  modules/             # Domain modules (clean boundaries)
    auth/
    users/
    profiles/
    listings/
    categories/
    ranking/
    promotions/
    payments/
    subscriptions/
    analytics/
    notifications/
    moderation/
    admin/
    search/
    media/
  lib/                 # Shared utilities, db, config
  emails/              # Email templates
```

Each module exposes:
- `service.ts` — business logic
- `repository.ts` — data access (optional)
- `types.ts` — domain types
- `validators.ts` — Zod schemas

## Key Design Decisions

1. **Organic vs Paid ranking are separate** — engagement NEVER determines paid placement. Discovery uses paid slots, admin curation, featured flags, and newest.
2. **Listing limits enforced server-side** from plan data in DB.
3. **Payments verified via webhook/signature** — never trust client `paymentSuccess`.
4. **Analytics events** are for reporting only — not placement.
5. **External media** uses adapters (YouTube, Instagram) — embed only, no rehosting.
6. **Feature flags & pricing** stored in DB / site config — not hardcoded.

## Scalability Path

Start monolith → extract workers (analytics, promo expiry) → Redis cache → object storage → search service (Meilisearch/Typesense) → read replicas.

## Security

- Password hashing (bcrypt)
- RBAC: USER | MODERATOR | ADMIN | SUPER_ADMIN
- Input validation (Zod)
- Rate limiting on auth/submit/payment
- Webhook signature verification
- Secrets via environment variables only
