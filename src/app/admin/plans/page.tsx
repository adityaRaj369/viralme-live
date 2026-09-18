import { listPlans } from "@/modules/subscriptions/service";
import { PlanEditForm } from "@/features/admin/plan-edit-form";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  const plans = await listPlans();
  return (
    <div>
      <h1 className="text-3xl font-bold">Plans</h1>
      <p className="mt-2 text-sm text-muted">Listing limits and prices are database-driven.</p>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="font-semibold">{plan.name}</div>
            <div className="mt-1 text-sm text-muted">
              {formatCurrency(Number(plan.price))} · {plan.listingLimit} listings
            </div>
            <PlanEditForm
              planId={plan.id}
              initial={{
                price: Number(plan.price),
                listingLimit: plan.listingLimit,
                name: plan.name,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
