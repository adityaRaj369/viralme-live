import { auth } from "@/lib/auth";
import {
  countryLabel,
  getOwnerAnalytics,
  getOwnerAnalyticsFromDb,
} from "@/lib/geo-analytics";
import { demoListingsForOwner, useDemoStore } from "@/lib/demo-store";
import { prisma } from "@/lib/db";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const slugById = new Map<string, { slug: string; title: string }>();
  let listingIds: string[] = [];
  let usedDb = false;

  if (useDemoStore()) {
    const owned = demoListingsForOwner(session.user.id);
    listingIds = owned.map((l) => l.id);
    owned.forEach((l) => slugById.set(l.id, { slug: l.slug, title: l.title }));
  }

  try {
    const dbListings = await prisma.listing.findMany({
      where: { ownerId: session.user.id, deletedAt: null },
      select: { id: true, slug: true, title: true },
    });
    if (dbListings.length) {
      listingIds = dbListings.map((l) => l.id);
      dbListings.forEach((l) => slugById.set(l.id, { slug: l.slug, title: l.title }));
      usedDb = true;
    }
  } catch {
    // keep demo ownership
  }

  const analytics = usedDb
    ? await getOwnerAnalyticsFromDb(listingIds)
    : getOwnerAnalytics(listingIds);
  const hasData = analytics.totals.events > 0;

  return (
    <div>
      <h1 className="text-3xl font-bold">Analytics</h1>
      <p className="mt-2 text-sm text-muted">
        Real clicks only — by country. Visit links on your listings are tracked automatically.
        No fake numbers.
      </p>

      {!hasData ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <p className="font-semibold">No tracked traffic yet</p>
          <p className="mt-2 text-sm text-muted">
            When someone clicks <strong>Visit</strong> on your listing, we record their country
            (via Vercel geo headers) and show it here.
          </p>
          <Link href="/" className="mt-4 inline-block text-sm font-semibold text-accent">
            Go to leaderboard →
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-xs uppercase text-muted">Clicks</div>
              <div className="mt-2 text-2xl font-bold">{formatNumber(analytics.totals.clicks)}</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-xs uppercase text-muted">Views</div>
              <div className="mt-2 text-2xl font-bold">{formatNumber(analytics.totals.views)}</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-xs uppercase text-muted">Countries</div>
              <div className="mt-2 text-2xl font-bold">{analytics.byCountry.length}</div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-semibold">Clicks by country</h2>
              <ul className="mt-4 space-y-3">
                {analytics.byCountry.map((row) => (
                  <li key={row.country} className="flex items-center justify-between text-sm">
                    <span>
                      <span className="font-semibold">{row.country}</span>{" "}
                      <span className="text-muted">{countryLabel(row.country)}</span>
                    </span>
                    <span className="tabular-nums text-muted">
                      {formatNumber(row.clicks)} clicks
                      {row.views ? ` · ${formatNumber(row.views)} views` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-semibold">By listing</h2>
              <ul className="mt-4 space-y-3">
                {analytics.byListing.map((row) => {
                  const meta = slugById.get(row.listingId);
                  return (
                    <li key={row.listingId} className="flex justify-between text-sm">
                      <Link href={`/listing/${meta?.slug ?? row.slug}`} className="hover:text-accent">
                        {meta?.title ?? row.slug}
                      </Link>
                      <span className="text-muted">{formatNumber(row.clicks)} clicks</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
