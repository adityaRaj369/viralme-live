import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listPromotionProducts } from "@/modules/promotions/service";
import { formatCurrency } from "@/lib/utils";
import { safeDb } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  const session = await auth();
  const [promotions, products] = await Promise.all([
    safeDb(
      () =>
        prisma.promotion.findMany({
          where: { userId: session!.user.id },
          orderBy: { createdAt: "desc" },
          include: { listing: { select: { title: true, slug: true } } },
        }),
      [],
    ),
    safeDb(() => listPromotionProducts(), []),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Promotions</h1>
      <p className="mt-2 text-sm text-muted">Time-limited paid placements. Expired slots free up automatically.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {products.length ? (
          products.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm text-muted">{p.description}</p>
              <p className="mt-3 font-bold">
                {formatCurrency(Number(p.price))} · {p.durationHours}h
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-border bg-card p-5 text-sm text-muted">
            Promotion products load from the database once Postgres is connected.
          </div>
        )}
      </div>

      <div className="mt-10 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-muted-bg/60 text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Listing</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Slot</th>
              <th className="px-4 py-3 text-left">Ends</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((p) => (
              <tr key={p.id} className="border-b border-border">
                <td className="px-4 py-3">{p.listing.title}</td>
                <td className="px-4 py-3">{p.type}</td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3">{p.slotPosition ?? "—"}</td>
                <td className="px-4 py-3">{p.endAt ? p.endAt.toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {promotions.length === 0 ? <p className="p-8 text-center text-muted">No promotions yet.</p> : null}
      </div>
    </div>
  );
}
