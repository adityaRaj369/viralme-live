import { auth } from "@/lib/auth";
import { getUserAnalyticsSummary } from "@/modules/analytics/service";
import { formatNumber } from "@/lib/utils";
import { safeDb } from "@/lib/demo";

export const dynamic = "force-dynamic";

const emptyAnalytics = {
  totals: { listings: 0, views: 0, clicks: 0, likes: 0, saves: 0 },
  topListings: [] as { id: string; title: string; viewCount: number }[],
  categoryPerformance: [] as { category: string; views: number }[],
  recentEventCount: 0,
};

export default async function AnalyticsPage() {
  const session = await auth();
  const analytics = await safeDb(() => getUserAnalyticsSummary(session!.user.id), emptyAnalytics);

  return (
    <div>
      <h1 className="text-3xl font-bold">Analytics</h1>
      <p className="mt-2 text-sm text-muted">Views, clicks, and engagement across your listings.</p>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Object.entries(analytics.totals).map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xs uppercase text-muted">{k}</div>
            <div className="mt-2 text-2xl font-bold">{formatNumber(v)}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Top listings</h2>
          <ul className="mt-4 space-y-3">
            {analytics.topListings.map((l) => (
              <li key={l.id} className="flex justify-between text-sm">
                <span>{l.title}</span>
                <span className="text-muted">{formatNumber(l.viewCount)}</span>
              </li>
            ))}
            {analytics.topListings.length === 0 ? (
              <li className="text-sm text-muted">No listing data yet.</li>
            ) : null}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Top performing category</h2>
          <ul className="mt-4 space-y-3">
            {analytics.categoryPerformance.map((c) => (
              <li key={c.category} className="flex justify-between text-sm">
                <span>{c.category}</span>
                <span className="text-muted">{formatNumber(c.views)} views</span>
              </li>
            ))}
            {analytics.categoryPerformance.length === 0 ? (
              <li className="text-sm text-muted">Not enough data yet.</li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
