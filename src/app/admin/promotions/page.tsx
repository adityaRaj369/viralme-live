import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const [promotions, products] = await Promise.all([
    prisma.promotion.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { listing: { select: { title: true } } },
    }),
    prisma.promotionProduct.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <div>
      <h1 className="text-3xl font-bold">Promotions</h1>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {products.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-4 text-sm">
            <div className="font-semibold">{p.name}</div>
            <div className="mt-1 text-muted">
              {formatCurrency(Number(p.price))} · {p.durationHours}h · slots {p.slotLimit}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 space-y-2">
        {promotions.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
            {p.listing.title} · {p.type} · {p.status} · #{p.slotPosition ?? "—"}
          </div>
        ))}
      </div>
    </div>
  );
}
