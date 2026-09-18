import Link from "next/link";
import { listPlans } from "@/modules/subscriptions/service";
import { listPromotionProducts } from "@/modules/promotions/service";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pricing" };

export default async function PricingPage() {
  let plans: Awaited<ReturnType<typeof listPlans>> = [];
  let promos: Awaited<ReturnType<typeof listPromotionProducts>> = [];
  try {
    [plans, promos] = await Promise.all([listPlans(), listPromotionProducts()]);
  } catch {
    // empty
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Simple pricing</h1>
        <p className="mt-3 text-muted">
          Profile plans control listing limits. Promotions are purchased separately per listing.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-4">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="text-sm font-semibold text-accent">{plan.name}</div>
            <div className="mt-3 text-3xl font-bold">
              {Number(plan.price) === 0 ? "Free" : formatCurrency(Number(plan.price), plan.currency)}
            </div>
            <p className="mt-1 text-xs text-muted">{plan.billingCycle.toLowerCase()}</p>
            <ul className="mt-6 space-y-2 text-sm text-muted">
              <li>{plan.listingLimit} listings</li>
              <li>{plan.analyticsEnabled ? "Analytics included" : "Basic stats"}</li>
              <li>{plan.profileCustomization ? "Profile customization" : "Standard profile"}</li>
              <li>{plan.promotionCredits} promo credits</li>
            </ul>
            <Link href="/register" className="mt-8 block">
              <Button className="w-full" variant={plan.slug === "business" ? "primary" : "outline"}>
                Choose {plan.name}
              </Button>
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold">Boost individual listings</h2>
        <p className="mt-2 text-sm text-muted">
          Time-limited slots. No guarantees on views or sales. Promoted content is labeled Sponsored.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {promos.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm text-muted">{p.description}</p>
              <p className="mt-4 text-lg font-bold">
                {formatCurrency(Number(p.price), p.currency)} · {p.durationHours}h
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
