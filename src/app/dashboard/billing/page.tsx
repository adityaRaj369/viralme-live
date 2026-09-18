import { auth } from "@/lib/auth";
import { getActiveSubscription, listPlans } from "@/modules/subscriptions/service";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { BillingActions } from "@/features/dashboard/billing-actions";
import { safeDb } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ mockOrder?: string }>;
}) {
  const session = await auth();
  const { mockOrder } = await searchParams;
  const [sub, plans, payments] = await Promise.all([
    safeDb(() => getActiveSubscription(session!.user.id), null),
    safeDb(() => listPlans(), []),
    safeDb(
      () =>
        prisma.payment.findMany({
          where: { userId: session!.user.id },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
      [],
    ),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Billing</h1>
      <p className="mt-2 text-sm text-muted">
        Current plan: <strong>{sub?.plan.name ?? "Free"}</strong>
        {sub?.plan ? ` · ${sub.plan.listingLimit} listings` : " · 50 listings (demo)"}
      </p>
      {mockOrder ? (
        <p className="mt-4 rounded-xl bg-accent-soft p-3 text-sm">
          Mock checkout started for {mockOrder}. Complete verification from the plan upgrade buttons below.
        </p>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {plans.length ? (
          plans.map((plan) => (
            <div key={plan.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="font-semibold">{plan.name}</div>
              <div className="mt-2 text-2xl font-bold">
                {Number(plan.price) === 0 ? "Free" : formatCurrency(Number(plan.price))}
              </div>
              <p className="mt-2 text-sm text-muted">{plan.listingLimit} listings</p>
              <BillingActions planId={plan.id} price={Number(plan.price)} current={sub?.planId === plan.id} />
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-border bg-card p-5 text-sm text-muted">
            Plans load from the database. Demo mode shows Free until Postgres is connected.
          </div>
        )}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Payment history</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {payments.map((p) => (
            <li key={p.id} className="flex justify-between border-b border-border py-2">
              <span>
                {p.provider} · {p.status}
              </span>
              <span>{formatCurrency(Number(p.amount), p.currency)}</span>
            </li>
          ))}
          {payments.length === 0 ? <li className="text-muted">No payments yet.</li> : null}
        </ul>
      </div>
    </div>
  );
}
