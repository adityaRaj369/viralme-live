# MakeMeViral — Database Schema

PostgreSQL via Prisma. UUIDs for primary keys. Soft deletes where noted.

## Core Tables

| Table | Purpose |
|-------|---------|
| users | Accounts, roles, status |
| profiles | Public identity / storefront |
| plans | Subscription plan catalog |
| subscriptions | User ↔ plan |
| categories | Hierarchical categories |
| listings | Discovery content |
| listing_categories | M:N listing ↔ category |
| listing_media | Images / embed metadata |
| promotions | Paid placement purchases |
| promotion_slots | Active slot occupancy |
| promotion_products | Admin-priced promo SKUs |
| orders | Checkout orders |
| payments | Payment attempts |
| transactions | Ledger entries |
| refunds | Refund records |
| likes | User likes listing |
| saves | User bookmarks listing |
| follows | User follows profile |
| reports | User reports |
| moderation_actions | Audit of mod decisions |
| analytics_events | Event stream |
| notifications | In-app notifications |
| audit_logs | Admin/system audit trail |
| site_settings | Key/value platform config |
| feature_flags | Feature toggles |

## Indexes

- listings: status, contentType, publishedAt, organicScore, slug
- profiles: username (unique), userId
- promotions: status, type, endAt
- analytics_events: type, entityId, createdAt
- full-text search on listing title/description (tsvector / Prisma search)

See `prisma/schema.prisma` for the source of truth.
