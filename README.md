# viralme.live

Public **pay-to-rank** leaderboard for **India & Asia** (inspired by outbid.lol).

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Prisma / Postgres (optional while `DEMO_AUTH=true`)
- Auth.js (demo credentials for now)
- Payments: **mock** now → wire **Razorpay** for India/Asia

## Deploy on Vercel

See **[docs/vercel-deploy.md](./docs/vercel-deploy.md)** for the exact env vars to paste into the Vercel deploy screen.


## What works now (demo / production UI)

- Full leaderboard UX (categories, All-time/Today, claim #1, logos, pagination, stats)
- Category boards + dedicated **/seo** paid board
- Daily, About, FAQ, Rules, Terms, Privacy, Imprint, Live stats, Search
- Admin category CRUD (add/disable select options) via `/admin/categories`
- Admin **Site content** CMS (About/FAQ/Rules/legal/footer) + claim Settings
- Click tracking via `/api/go/[slug]` + country (Vercel geo) — no fake dashboard numbers
- SEO: sitemap, robots, Open Graph, JSON-LD, en-IN targeting
- **No user dashboard** (same as outbid.lol) — claim from the public board

See **[docs/admin-guide.md](./docs/admin-guide.md)** for how to manage the site securely.
## Left for you

- Real Postgres (`DATABASE_URL` + `prisma db push`)
- Real login / signup (turn `DEMO_AUTH=false`)
- Real payments (`PAYMENT_PROVIDER=razorpay` + keys)

## Payments recommendation (India & Asia)

**Use Razorpay** as primary:

- Best India coverage (UPI, cards, netbanking, wallets)
- Works for many Asian cards via international
- Already scaffolded in this repo (`src/modules/payments/razorpay.ts`)

Optional later: Stripe for US/EU only; Keep Razorpay as default for viralme.live.

## Production checklist

1. Set real `DATABASE_URL`, run `npx prisma db push && npx prisma db seed`
2. Set `DEMO_AUTH=false`
3. Set `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL=https://viralme.live`
4. Add Razorpay keys, set `PAYMENT_PROVIDER=razorpay`
5. Point domain `viralme.live` + TLS
6. Configure SMTP for transactional email

Until steps 1–4 are done, treat the app as **UI-complete demo**, not full production commerce.
