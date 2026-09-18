import type { Metadata } from "next";
import Link from "next/link";
import { DEMO_CATEGORIES, demoGetListings, demoSiteStats } from "@/lib/demo-store";
import { SHELL } from "@/lib/shell";
import { formatCurrency } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categories",
  description: `Every category on ${APP_NAME} has its own paid ranking. See who leads SEO, Marketing, Agents, and more.`,
  alternates: { canonical: "/categories" },
};

export default function CategoriesPage() {
  const stats = demoSiteStats();
  const boards = DEMO_CATEGORIES.filter((c) => c.slug !== "all" && c.slug !== "leaderboards").map(
    (cat) => {
      const board = demoGetListings({
        board: "alltime",
        categorySlug: cat.slug,
        page: 1,
        pageSize: 3,
      });
      return { cat, board };
    },
  );

  const hottest = [...boards]
    .filter((b) => b.board.total > 0)
    .sort((a, b) => b.board.currentTop - a.board.currentTop)
    .slice(0, 3);

  return (
    <div className={`${SHELL} pb-16 pt-6`}>
      <Link href="/stats" className="ob-pill mb-6 inline-flex items-center gap-2 px-3 py-1.5 text-[12px] text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        {stats.online} online · {stats.visitorsToday.toLocaleString()} visitors today · stats→
      </Link>

      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Categories</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Every category has its own ranking. Pick one to see who leads it — then claim a spot.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">Most active categories</h2>
        <p className="mt-1 text-sm text-muted">
          Where ranks are getting claimed — and who is holding the top spot.
        </p>
        <ol className="mt-5 space-y-3">
          {hottest.map((h, i) => (
            <li key={h.cat.slug}>
              <Link
                href={h.cat.slug === "seo" ? "/seo" : `/categories/${h.cat.slug}`}
                className="ob-card flex flex-col gap-1 p-4 transition hover:border-accent/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span className="font-bold text-accent">#{i + 1}</span>{" "}
                  <span className="font-semibold">{h.cat.name}</span>
                  <span className="ml-2 text-xs text-muted">{h.board.total} listings</span>
                </div>
                <div className="text-sm text-muted">
                  Leading{" "}
                  <strong className="text-foreground">{h.board.items[0]?.title ?? "—"}</strong>{" "}
                  <span className="font-bold text-accent">
                    {formatCurrency(h.board.currentTop, h.board.config.currency)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
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
                  {cat.name}
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
