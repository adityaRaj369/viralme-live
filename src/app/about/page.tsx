import Link from "next/link";
import { demoSiteStats } from "@/lib/demo-store";
import { adminGetContent, adminGetSettings } from "@/lib/admin-demo";
import { SHELL } from "@/lib/shell";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const metadata = { title: "About" };
export const dynamic = "force-dynamic";

export default function AboutPage() {
  const stats = demoSiteStats();
  const content = adminGetContent();
  const siteName = String(adminGetSettings().siteName ?? "viralme.live");

  return (
    <div className={`${SHELL} pb-16 pt-6`}>
      <Link href="/stats" className="ob-pill mb-6 inline-flex items-center gap-2 px-3 py-1.5 text-[12px] text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        {stats.online} online · {stats.visitorsToday.toLocaleString()} visitors today · stats→
      </Link>

      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">About</h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">{content.aboutIntro}</p>

      <h2 className="mt-12 text-2xl font-bold tracking-tight">Then it went live</h2>
      <p className="mt-3 text-muted">A few crazy things that happened since then:</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { value: formatNumber(stats.visitors), label: "visitors" },
          { value: formatCurrency(stats.revenue), label: "revenue" },
          {
            value: stats.highest ? formatCurrency(stats.highest.amount) : "$0",
            label: stats.highest
              ? `highest rank (so far) · ${stats.highest.title}`
              : "highest rank",
          },
          { value: String(stats.products), label: "listed products" },
          { value: String(stats.productsToday), label: "products added today" },
          { value: formatCurrency(stats.revenueToday), label: "revenue today" },
        ].map((s) => (
          <div key={s.label} className="ob-card p-5">
            <div className="text-2xl font-extrabold text-accent">{s.value}</div>
            <div className="mt-1 text-sm text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-2xl font-bold tracking-tight">From the people who took #1</h2>
      <p className="mt-3 max-w-2xl text-muted">{content.aboutAfterLive}</p>

      <div className="mt-8 grid gap-4">
        {content.testimonials.map((t) => (
          <blockquote key={t.handle || t.name} className="ob-card p-5">
            <div className="font-semibold">{t.name}</div>
            <div className="text-xs text-muted">{t.handle}</div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{t.body}</p>
          </blockquote>
        ))}
      </div>

      <Link href="/" className="mt-10 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white">
        Back to {siteName}
      </Link>
    </div>
  );
}
