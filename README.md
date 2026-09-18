# viralme.live

Public **pay-to-rank** leaderboard for **India & Asia** (inspired by outbid.lol).

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Prisma / Postgres (optional while `DEMO_AUTH=true`)
- Auth.js (demo credentials for now)
- Payments: **mock** now → wire **Razorpay** for India/Asia

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

Demo admin: `admin@makemeviral.app` / `Password123!`  
Demo user: `demo@makemeviral.app` / `Password123!`

## What works now (demo / production UI)

- Full leaderboard UX (categories, All-time/Today, claim #1, logos, pagination, stats)
- Category boards + dedicated **/seo** paid board
- Daily, About, FAQ, Rules, Terms, Privacy, Imprint, Live stats, Search
- Admin category CRUD (add/disable select options) via `/admin/categories`
- SEO: sitemap, robots, Open Graph, JSON-LD, en-IN targeting

## Left for you

- Real login / signup (turn `DEMO_AUTH=false` + Postgres)
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
