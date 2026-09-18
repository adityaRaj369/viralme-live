import Link from "next/link";
import { getLeaderboard } from "@/modules/leaderboard/service";
import { RankCard } from "@/components/cards/rank-card";
import { demoSiteStats } from "@/lib/demo-store";
import { SHELL } from "@/lib/shell";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Daily" };

function daysAgoKey(n: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export default async function DailyPage() {
  const today = await getLeaderboard({ board: "today", pageSize: 30 });
  const stats = demoSiteStats();
  const archives = [0, 1, 2, 3, 4, 5, 6].map((n) => ({
    key: daysAgoKey(n),
    label: n === 0 ? "Today" : n === 1 ? "Yesterday" : `${n} days ago`,
  }));

  return (
    <div className={`${SHELL} pb-16 pt-6`}>
      <Link
        href="/stats"
        className="ob-pill mb-6 inline-flex items-center gap-2 px-3 py-1.5 text-[12px] text-muted"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        {stats.online} online · {stats.visitorsToday.toLocaleString()} visitors today · stats→
      </Link>

      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Daily</h1>
      <p className="mt-2 text-muted">UTC day boards. Today resets at midnight UTC.</p>

      <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar">
        {archives.map((a) => (
          <span
            key={a.key}
            className={`ob-pill shrink-0 px-3 py-1.5 text-xs font-semibold ${
              a.key === daysAgoKey(0) ? "bg-accent text-white" : "text-muted"
            }`}
          >
            {a.label}
          </span>
        ))}
      </div>

      <div className="mt-8 space-y-5">
        {today.items.map((item) => (
          <RankCard
            key={item.id}
            claimForAmount={item.displayAmount + 1}
            item={{
              id: item.id,
              slug: item.slug,
              title: item.title,
              tagline: "tagline" in item ? (item as { tagline?: string | null }).tagline : null,
              description: item.description,
              rank: item.rank,
              displayAmount: item.displayAmount,
              externalUrl: item.externalUrl,
              clickCount: item.clickCount,
              createdAt: item.createdAt,
              categoryName: item.categories[0]?.category.name,
              categorySlug: item.categories[0]?.category.slug,
              thumbnailUrl: item.thumbnailUrl,
            }}
          />
        ))}
      </div>

      {today.items[0] ? (
        <p className="mt-8 text-sm text-muted">
          Today&apos;s #1:{" "}
          <strong className="text-foreground">{today.items[0].title}</strong> at{" "}
          {formatCurrency(today.items[0].displayAmount)}
        </p>
      ) : null}
    </div>
  );
}
