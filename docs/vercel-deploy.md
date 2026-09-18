# Deploy viralme.live on Vercel

## 1. Import the repo

- GitHub: `adityaRaj369/viralme-live`
- Framework Preset: **Next.js** (auto)
- Root Directory: `.`
- Build Command: `prisma generate && next build` (or leave default if `package.json` build already has it)
- Output: default (Next.js)

## 2. Environment Variables (add all of these)

| Key | Value (example) | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Later change to `https://viralme.live` |
| `NEXT_PUBLIC_APP_NAME` | `viralme.live` | |
| `NEXT_PUBLIC_APP_DOMAIN` | `viralme.live` | |
| `NEXT_PUBLIC_APP_CURRENCY` | `INR` | India default |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | `hello@viralme.live` | |
| `AUTH_SECRET` | *(long random string)* | `openssl rand -base64 32` |
| `AUTH_URL` | same as `NEXT_PUBLIC_APP_URL` | |
| `NEXTAUTH_URL` | same as `NEXT_PUBLIC_APP_URL` | |
| `DEMO_AUTH` | `true` | Keep `true` until real login + DB |
| `PAYMENT_PROVIDER` | `mock` | Switch to `razorpay` later |
| `DATABASE_URL` | Postgres URL | **Required for real analytics persistence** — use Vercel Postgres / Neon / Supabase |
| `EMAIL_PROVIDER` | `console` | |
| `EMAIL_FROM` | `noreply@viralme.live` | |

### Optional (when you wire payments)

| Key | Value |
|---|---|
| `RAZORPAY_KEY_ID` | from Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | from Razorpay dashboard |
| `RAZORPAY_WEBHOOK_SECRET` | from Razorpay webhooks |

## 3. Country analytics on Vercel

No extra env vars needed for geo. Vercel injects automatically:

- `x-vercel-ip-country`
- `x-vercel-ip-country-region`
- `x-vercel-ip-city`

Visit / View buttons go through `/api/go/[slug]` → record country → redirect.

Dashboard → **Analytics** shows **real** clicks by country only (empty until someone clicks — never fake numbers).

**Persistence:** With only `DEMO_AUTH=true` and no `DATABASE_URL`, counts live in memory and can reset on cold starts. Add `DATABASE_URL` (Neon free tier is fine) before charging users so country click history survives.

## 4. After first deploy

1. Open the site URL Vercel gives you  
2. Update `NEXT_PUBLIC_APP_URL`, `AUTH_URL`, `NEXTAUTH_URL` to that URL and redeploy  
3. When you own `viralme.live`, add the domain in Vercel → Domains and update those three again  

## 5. Production gate (before charging users)

- [ ] Real `DATABASE_URL` + `prisma db push`  
- [ ] `DEMO_AUTH=false`  
- [ ] Real auth  
- [ ] `PAYMENT_PROVIDER=razorpay` + keys  
- [ ] Custom domain + HTTPS  
