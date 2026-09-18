import Link from "next/link";
import { demoSiteStats } from "@/lib/demo-store";
import { SHELL } from "@/lib/shell";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const metadata = { title: "Live stats" };

export default function StatsPage() {
  const s = demoSiteStats();
  return (
    <div className={`${SHELL} pb-16 pt-6`}>
      <h1 className="text-3xl font-extrabold tracking-tight">Live stats</h1>
      <p className="mt-2 text-muted">Realtime-ish counters for this demo board.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { v: s.online, l: "online now" },
          { v: formatNumber(s.visitorsToday), l: "visitors today" },
          { v: formatNumber(s.visitors), l: "visitors total" },
          { v: formatCurrency(s.revenue), l: "revenue" },
          { v: formatCurrency(s.revenueToday), l: "revenue today" },
          { v: s.products, l: "products listed" },
          { v: s.productsToday, l: "added today" },
          {
            v: s.highest ? formatCurrency(s.highest.amount) : "$0",
            l: s.highest ? `highest · ${s.highest.title}` : "highest rank",
          },
        ].map((x) => (
          <div key={x.l} className="ob-card p-5">
            <div className="text-2xl font-extrabold text-accent">{x.v}</div>
            <div className="mt-1 text-sm text-muted">{x.l}</div>
          </div>
        ))}
      </div>
      <Link href="/" className="mt-8 inline-block text-sm font-semibold text-accent">
        ← Leaderboard
      </Link>
    </div>
  );
}
