import Link from "next/link";
import { demoSiteStats } from "@/lib/demo-store";
import { adminListCategories, adminGetSettings } from "@/lib/admin-demo";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function AdminOverviewPage() {
  const stats = demoSiteStats();
  const cats = adminListCategories();
  const settings = adminGetSettings();

  return (
    <div>
      <h1 className="text-3xl font-bold">Admin overview</h1>
      <p className="mt-2 text-sm text-muted">
        Control board settings, categories, and monitor claims. Demo data until Postgres is live.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Visitors", v: formatNumber(stats.visitors) },
          { l: "Revenue (demo)", v: formatCurrency(stats.revenue, String(settings.rankCurrency)) },
          { l: "Products", v: stats.products },
          { l: "Categories", v: cats.filter((c) => c.status === "ACTIVE").length },
        ].map((c) => (
          <div key={c.l} className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xs uppercase text-muted">{c.l}</div>
            <div className="mt-2 text-2xl font-bold">{c.v}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/categories" className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white">
          Manage categories
        </Link>
        <Link href="/seo" className="rounded-full border border-border px-4 py-2 text-sm font-semibold">
          View SEO board
        </Link>
        <Link href="/" className="rounded-full border border-border px-4 py-2 text-sm font-semibold">
          Public site
        </Link>
      </div>
    </div>
  );
}
