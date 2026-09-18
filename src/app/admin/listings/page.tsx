import { prisma } from "@/lib/db";
import { ModerationActions } from "@/features/admin/moderation-actions";

export const dynamic = "force-dynamic";

export default async function AdminListingsPage() {
  const listings = await prisma.listing.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: { profile: true, owner: { select: { email: true } } },
  });
  return (
    <div>
      <h1 className="text-3xl font-bold">Listings</h1>
      <div className="mt-6 space-y-3">
        {listings.map((l) => (
          <div key={l.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{l.title}</div>
                <div className="text-xs text-muted">
                  {l.status} · @{l.profile.username} · {l.owner.email}
                </div>
              </div>
              <ModerationActions listingId={l.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
