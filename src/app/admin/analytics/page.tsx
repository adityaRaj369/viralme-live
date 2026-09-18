import { getAdminAnalytics } from "@/modules/analytics/service";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const stats = await getAdminAnalytics();
  return (
    <div>
      <h1 className="text-3xl font-bold">Analytics</h1>
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
        {Object.entries(stats).map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xs uppercase text-muted">{k}</div>
            <div className="mt-2 text-2xl font-bold">
              {k === "revenue" ? formatCurrency(Number(v)) : formatNumber(Number(v))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
