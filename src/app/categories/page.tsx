import type { Metadata } from "next";
import Link from "next/link";
import { demoGetListings, demoSiteStats } from "@/lib/demo-store";
import { getPublicCategories } from "@/lib/admin-demo";
import { logoUrlFromHref } from "@/lib/favicon";
import { SHELL } from "@/lib/shell";
import { cn, formatCurrency } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categories",
  description: `Every category on ${APP_NAME} has its own paid ranking.`,
  alternates: { canonical: "/categories" },
};

function timeAgo(date: Date | null) {
  if (!date) return "—";
  const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
  if (hours < 1) return "just now";
  if (hours === 1) return "1 hour ago";
  if (hours < 48) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

export default function CategoriesPage() {
  const stats = demoSiteStats();
  const boards = getPublicCategories()
    .filter((c) => c.slug !== "all" && c.slug !== "leaderboards")
    .map((cat) => {
      const board = demoGetListings({
        board: "alltime",
        categorySlug: cat.slug,
        page: 1,
        pageSize: 3,
      });
      const latest = board.items[0]?.updatedAt ?? null;
      return { cat, board, latest, claims: board.total };
    });

  const hottest = [...boards]
    .filter((b) => b.claims > 0)
    .sort((a, b) => {
      if (b.claims !== a.claims) return b.claims - a.claims;
      return (b.latest?.getTime() ?? 0) - (a.latest?.getTime() ?? 0);
    })
    .slice(0, 3);

  return (
    <div className={`${SHELL} pb-16 pt-6`}>
      <Link
        href="/stats"
        className="ob-pill mb-6 inline-flex items-center gap-2 px-3 py-1.5 text-[12px] text-muted"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        {stats.online} online · {stats.visitorsToday.toLocaleString()} visitors today · stats→
      </Link>

      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Categories</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Every category has its own ranking. Pick one to see who leads it.
      </p>

      <section className="mt-10 rounded-[28px] bg-muted-bg/70 p-5 sm:p-7">
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Most active categories
        </h2>
        <p className="mt-1 text-sm text-muted">
          Where ranks are getting claimed right now — and who is holding the top spot.
        </p>

        {hottest.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No claims yet — be the first on any board.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {hottest.map((h, i) => {
              const leader = h.board.items[0];
              const href = h.cat.slug === "seo" ? "/seo" : `/categories/${h.cat.slug}`;
              const logo = leader
                ? leader.thumbnailUrl || logoUrlFromHref(leader.externalUrl)
                : null;
              return (
                <Link
                  key={h.cat.slug}
                  href={href}
                  className={cn(
                    "ob-card flex flex-col gap-3 p-4 transition hover:border-accent/40 sm:p-5",
                    i === 0 && "border-accent/35",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wide text-accent">
                        #{i + 1}
                        {i === 0 ? " hottest" : ""}
                      </div>
                      <div className="mt-1 text-lg font-extrabold tracking-tight">
                        {h.cat.fullName}
                      </div>
                      <div className="mt-1 text-sm text-muted">
                        {h.claims} claim{h.claims === 1 ? "" : "s"}
                      </div>
                    </div>
                    <div className="shrink-0 text-sm text-muted">{timeAgo(h.latest)}</div>
                  </div>
                  {leader ? (
                    <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="h-8 w-8 overflow-hidden rounded-full border border-border bg-muted-bg">
                          {logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logo} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <span className="truncate text-sm">
                          Leading <strong>{leader.title}</strong>
                          {leader.tagline ? ` · ${leader.tagline}` : ""}
                        </span>
                      </div>
                      <span className="shrink-0 font-bold text-accent">
                        {formatCurrency(leader.displayAmount, h.board.config.currency)}
                      </span>
                    </div>
                  ) : null}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-12 space-y-8">
        {boards.map(({ cat, board }) => (
          <div key={cat.slug}>
            <div className="mb-3 flex items-end justify-between gap-3">
              <h2 className="text-lg font-bold">
                <Link
                  href={cat.slug === "seo" ? "/seo" : `/categories/${cat.slug}`}
                  className="hover:text-accent"
                >
                  {cat.fullName}
                </Link>
              </h2>
              <Link
                href={cat.slug === "seo" ? "/seo" : `/?category=${cat.slug}`}
                className="text-sm font-semibold text-accent"
              >
                Open board →
              </Link>
            </div>
            <div className="ob-card divide-y divide-border overflow-hidden">
              {board.items.length ? (
                board.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/listing/${item.slug}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-muted-bg/50"
                  >
                    <span className="min-w-0 truncate">
                      <span className="font-bold text-accent">#{item.rank}</span> {item.title}
                      {item.tagline ? (
                        <span className="text-muted"> · {item.tagline}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 font-bold text-accent">
                      {formatCurrency(item.displayAmount, board.config.currency)}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="px-4 py-3 text-sm text-muted">No claims yet — be first.</p>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
