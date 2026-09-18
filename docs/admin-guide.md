# Admin guide — viralme.live

## Login (secure)

1. Open `/login`
2. Use **only** `admin@viralme.live` / `Password123!` in demo mode
3. You land on `/admin`

Access requires session cookie + **ADMIN** role. APIs reject unauthenticated and non-admin callers (no open write endpoints).

## What you control

| Admin page | Controls public… |
|---|---|
| **Categories** | Select chips on home, category boards, sitemap |
| **Site content** | About, FAQ, Rules, Terms, Privacy, Imprint, footer, home empty text |
| **Settings** | Site name, tagline, support email, **min claim**, **bump**, **currency** |
| **Listings / Users / Payments** | Ops (need Postgres for full power) |
| **Analytics** | Aggregate stats (need Postgres for lasting data) |

## How to add a category

1. `/admin/categories` → enter name → Create  
2. It appears on the public leaderboard immediately  
3. Disable = hides from public (does not delete history)

## How to change claim pricing

1. `/admin/settings`  
2. Edit `rankMinAmount`, `rankBumpAmount`, `rankCurrency`  
3. Save — claim box uses the new numbers

## How to edit FAQ / legal copy

1. `/admin/content`  
2. Pick tab → edit → Save content  
3. Visit `/faq`, `/rules`, etc. to confirm

## Security notes

- `/admin` and `/api/admin/*` are not linked from the public header  
- robots.txt disallows `/admin`  
- Writes require `ADMIN` (or demo admin account) via server-side session check  
- Input lengths are capped in the CMS store  
- **Before production:** set `DEMO_AUTH=false`, real `AUTH_SECRET`, Postgres, and change the admin password  

## Persistence

Without `DATABASE_URL`, admin edits live in **server memory** (can reset on Vercel cold start). Add Postgres and migrate categories/settings/content into `Category` + `SiteSetting` before charging users.
