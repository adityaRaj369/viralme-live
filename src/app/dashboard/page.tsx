import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserListings } from "@/modules/listings/service";
import { getUserAnalyticsSummary } from "@/modules/analytics/service";
import { getActiveSubscription, getListingLimitForUser } from "@/modules/subscriptions/service";
import { listNotifications } from "@/modules/notifications/service";
import { prisma } from "@/lib/db";
import { formatNumber } from "@/lib/utils";
import { demoBanner, safeDb } from "@/lib/demo";

export const dynamic = "force-dynamic";

const emptyListings = { items: [] as Awaited<ReturnType<typeof getUserListings>>["items"], total: 0, page: 1, pageSize: 24 };
const emptyAnalytics = {
  totals: { listings: 0, views: 0, clicks: 0, likes: 0, saves: 0 },
  topListings: [] as { id: string; title: string; viewCount: number }[],
  categoryPerformance: [] as { category: string; views: number }[],
  recentEventCount: 0,
};
const emptyNotes = { items: [] as Awaited<ReturnType<typeof listNotifications>>["items"], unread: 0, total: 0, page: 1, pageSize: 5 };

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const banner = demoBanner(session!.user.email);

  const [listings, analytics, sub, limit, notifications, activePromos, profile] = await Promise.all([
    safeDb(() => getUserListings(userId), emptyListings),
    safeDb(() => getUserAnalyticsSummary(userId), emptyAnalytics),
    safeDb(() => getActiveSubscription(userId), null),
    safeDb(() => getListingLimitForUser(userId), 50),
    safeDb(() => listNotifications(userId, 1, 5), emptyNotes),
    safeDb(() => prisma.promotion.count({ where: { userId, status: "ACTIVE" } }), 0),
    safeDb(() => prisma.profile.findUnique({ where: { userId } }), null),
  ]);

  const cards = [
    { label: "Total Listings", value: analytics.totals.listings },
    { label: "Views", value: analytics.totals.views },
    { label: "Clicks", value: analytics.totals.clicks },
    { label: "Likes", value: analytics.totals.likes },
    { label: "Saves", value: analytics.totals.saves },
    { label: "Followers", value: profile?.followerCount ?? 0 },
    { label: "Profile Views", value: profile?.viewCount ?? 0 },
    { label: "Active Promotions", value: activePromos },
  ];

  return (
    <div>
      {banner ? (
        <div className="mb-6 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
          <p className="font-semibold text-accent">{banner.title}</p>
          <p className="mt-0.5 text-muted">{banner.body}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <p className="mt-1 text-sm text-muted">
            Plan: {sub?.plan.name ?? "Free"} · {listings.total}/{limit} listings used
          </p>
        </div>
        <Link href="/" className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white">
          Claim a rank
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted">{c.label}</div>
            <div className="mt-2 text-2xl font-bold">{formatNumber(c.value)}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Top listings</h2>
          <ul className="mt-4 space-y-3">
            {analytics.topListings.map((l) => (
              <li key={l.id} className="flex justify-between text-sm">
                <span className="truncate pr-4">{l.title}</span>
                <span className="text-muted">{formatNumber(l.viewCount)} views</span>
              </li>
            ))}
            {analytics.topListings.length === 0 ? (
              <li className="text-sm text-muted">No listing data yet.</li>
            ) : null}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Recent notifications</h2>
          <ul className="mt-4 space-y-3">
            {notifications.items.map((n) => (
              <li key={n.id} className="text-sm">
                <div className="font-medium">{n.title}</div>
                <div className="text-muted">{n.body}</div>
              </li>
            ))}
            {notifications.items.length === 0 ? (
              <li className="text-sm text-muted">No notifications yet.</li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
