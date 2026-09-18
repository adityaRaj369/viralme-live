import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { AddToTrendingForm } from "@/features/admin/add-to-trending";

export const dynamic = "force-dynamic";

export default async function AdminPromotionSlotsPage() {
  const [slots, products, trending] = await Promise.all([
    prisma.promotionSlot.findMany({
      where: { isActive: true, endAt: { gt: new Date() } },
      orderBy: [{ type: "asc" }, { position: "asc" }],
    }),
    prisma.promotionProduct.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.trendingPlacement.findMany({
      where: { isActive: true, endAt: { gt: new Date() } },
      orderBy: { position: "asc" },
    }),
  ]);

  const listingIds = [...new Set([...slots.map((s) => s.listingId), ...trending.map((t) => t.listingId)])];
  const listings = await prisma.listing.findMany({
    where: { id: { in: listingIds } },
    select: { id: true, title: true, slug: true },
  });
  const byId = new Map(listings.map((l) => [l.id, l]));

  return (
    <div>
      <h1 className="text-3xl font-bold">Promotion Slots</h1>
      <p className="mt-2 text-sm text-muted">
        Paid placement slots and admin-curated Trending. Positions are not based on likes or views.
      </p>

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {products.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-4 text-sm">
            <div className="font-semibold">{p.name}</div>
            <div className="mt-1 text-muted">
              {formatCurrency(Number(p.price))} · {p.durationHours}h · {p.slotLimit} slots
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-semibold">Active paid slots</h2>
      <div className="mt-4 space-y-2">
        {slots.map((s) => (
          <div key={s.id} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
            {s.type} #{s.position} · {byId.get(s.listingId)?.title ?? s.listingId} · ends{" "}
            {s.endAt.toLocaleString()}
          </div>
        ))}
        {slots.length === 0 ? <p className="text-muted">No active paid slots.</p> : null}
      </div>

      <h2 className="mt-10 text-xl font-semibold">Admin Trending curation</h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <AddToTrendingForm />
        <div className="space-y-2">
          {trending.map((t) => (
            <div key={t.id} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
              #{t.position} · {byId.get(t.listingId)?.title ?? t.listingId} · until{" "}
              {t.endAt.toLocaleString()}
            </div>
          ))}
          {trending.length === 0 ? <p className="text-muted">No curated trending items.</p> : null}
        </div>
      </div>
    </div>
  );
}
