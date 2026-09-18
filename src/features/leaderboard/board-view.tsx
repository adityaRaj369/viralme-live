import Link from "next/link";
import { Suspense } from "react";
import { Trophy } from "lucide-react";
import { getLeaderboard } from "@/modules/leaderboard/service";
import { ClaimRankBox } from "@/features/leaderboard/claim-rank-box";
import { LatestActivity } from "@/features/leaderboard/latest-activity";
import { RankCard } from "@/components/cards/rank-card";
import { CategoryChips } from "@/components/layout/category-chips";
import { EmptyState } from "@/components/ui/states";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { demoLatestActivity, demoSiteStats } from "@/lib/demo-store";
import { adminGetContent, getPublicCategories } from "@/lib/admin-demo";
import { categoryBoardHref } from "@/lib/outbid-categories";
import { productHref } from "@/lib/product-path";
import { PAGE_SIZE, SHELL } from "@/lib/shell";

export type BoardViewProps = {
  board: "alltime" | "today";
  /** Internal filter slug: all | seo | marketing | … */
  categorySlug: string;
  /** outbid path slug for /category/… */
  pathSlug?: string;
  categoryId?: string;
  categoryFullName?: string;
  page?: number;
};

function pageHref(board: string, pathSlug: string | undefined, categorySlug: string, page: number) {
  if (categorySlug === "all" || !pathSlug) {
    if (board === "today") return page <= 1 ? "/today" : `/today?page=${page}`;
    return page <= 1 ? "/" : `/?page=${page}`;
  }
  const base =
    board === "today" ? `/category/${pathSlug}/today` : `/category/${pathSlug}`;
  return page <= 1 ? base : `${base}?page=${page}`;
}

export async function BoardView({
  board,
  categorySlug,
  pathSlug,
  categoryId,
  categoryFullName,
  page = 1,
}: BoardViewProps) {
  const safePage = Math.max(1, page);
  const filterSlug = categorySlug === "all" ? undefined : categorySlug;

  const [alltimeTop, leaderboard, todayBoard] = await Promise.all([
    getLeaderboard({ board: "alltime", categorySlug: filterSlug, pageSize: 1 }),
    getLeaderboard({
      board,
      categorySlug: filterSlug,
      page: safePage,
      pageSize: PAGE_SIZE,
    }),
    getLeaderboard({
      board: "today",
      categorySlug: filterSlug,
      pageSize: 10,
    }),
  ]);

  const claimPrice = alltimeTop.claimPrice;
  const currency = alltimeTop.config.currency;
  const stats = demoSiteStats();
  const categories = getPublicCategories();
  const claimCategories = categories
    .filter((c) => c.slug !== "all")
    .map((c) => ({ id: c.id, name: c.name, fullName: c.fullName, slug: c.slug }));
  const { homeEmpty } = adminGetContent();
  const start = (leaderboard.page - 1) * leaderboard.pageSize + 1;
  const end = Math.min(leaderboard.page * leaderboard.pageSize, leaderboard.total);

  const pageButtons = Array.from({ length: leaderboard.totalPages }, (_, i) => i + 1).filter((p) => {
    if (leaderboard.totalPages <= 7) return true;
    return p === 1 || p === leaderboard.totalPages || Math.abs(p - safePage) <= 1;
  });

  const activityRaw = demoLatestActivity(40).filter((l) =>
    filterSlug ? l.categorySlug === filterSlug : true,
  );
  const activityRanked = await getLeaderboard({
    board: "alltime",
    categorySlug: filterSlug,
    page: 1,
    pageSize: 500,
  });
  const rankById = new Map(activityRanked.items.map((i) => [i.id, i.rank]));
  const activityItems = activityRaw.map((l) => ({
    id: l.id,
    slug: l.slug,
    title: l.title,
    tagline: l.tagline,
    rank: rankById.get(l.id) ?? 0,
    displayAmount: l.rankAmount,
    currency,
    updatedAt: l.updatedAt,
    externalUrl: l.externalUrl,
  }));

  const alltimeTabHref =
    categorySlug === "all" || !pathSlug
      ? "/"
      : categoryBoardHref({ slug: categorySlug, pathSlug });
  const todayTabHref =
    categorySlug === "all" || !pathSlug ? "/today" : `/category/${pathSlug}/today`;

  const claimBase =
    categorySlug === "all" || !pathSlug
      ? board === "today"
        ? "/today"
        : "/"
      : board === "today"
        ? `/category/${pathSlug}/today`
        : `/category/${pathSlug}`;

  return (
    <div className={`${SHELL} w-full pb-16 pt-4 sm:pt-6`}>
      <CategoryChips activeSlug={categorySlug} />

      {categoryFullName && categorySlug !== "all" ? (
        <h1 className="mb-4 text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
          {categoryFullName} ranking
        </h1>
      ) : null}

      <div className="mb-5 flex flex-col items-center gap-3">
        <Link
          href="/stats"
          className="ob-pill inline-flex max-w-full items-center gap-2 px-3 py-1.5 text-[12px] text-muted hover:text-foreground"
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
          <span className="truncate">
            {stats.online} online · {stats.visitorsToday.toLocaleString()} visitors today ·{" "}
            {stats.products} on board · stats→
          </span>
        </Link>

        <div className="ob-pill inline-flex p-1 text-[13px] font-semibold" role="tablist">
          <Link
            href={alltimeTabHref}
            role="tab"
            aria-selected={board === "alltime"}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition",
              board === "alltime" ? "bg-accent text-white" : "text-muted hover:text-foreground",
            )}
          >
            <Trophy className="h-3.5 w-3.5" />
            All-time
          </Link>
          <Link
            href={todayTabHref}
            role="tab"
            aria-selected={board === "today"}
            className={cn(
              "rounded-full px-4 py-2 transition",
              board === "today" ? "bg-accent text-white" : "text-muted hover:text-foreground",
            )}
          >
            Today
          </Link>
        </div>
      </div>

      <Suspense fallback={<div className="ob-card h-48 animate-pulse" />}>
        <ClaimRankBox
          claimPrice={claimPrice}
          currency={currency}
          categories={claimCategories}
          defaultCategoryId={categoryId}
          lockedCategoryLabel={categorySlug !== "all" ? categoryFullName : undefined}
        />
      </Suspense>

      <div className="mt-8 space-y-5">
        {leaderboard.items.length ? (
          leaderboard.items.map((item) => (
            <RankCard
              key={item.id}
              currency={currency}
              claimHrefBase={claimBase}
              claimForAmount={item.rank === 1 && safePage === 1 ? claimPrice : item.displayAmount + 1}
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
          ))
        ) : (
          <EmptyState title="No ranks claimed yet." description={homeEmpty} />
        )}
      </div>

      {leaderboard.total > 0 ? (
        <nav className="mt-10 flex flex-col items-center gap-3" aria-label="Ranking pages">
          <p className="text-sm text-muted">
            {start} – {end} of {leaderboard.total.toLocaleString()}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <Link
              href={pageHref(board, pathSlug, categorySlug, Math.max(1, safePage - 1))}
              className={cn(
                "ob-pill px-3 py-2 text-xs font-semibold",
                safePage <= 1 && "pointer-events-none opacity-40",
              )}
            >
              Prev
            </Link>
            {pageButtons.map((p, idx) => {
              const prev = pageButtons[idx - 1];
              const showEllipsis = prev != null && p - prev > 1;
              return (
                <span key={p} className="contents">
                  {showEllipsis ? <span className="px-1 text-muted">…</span> : null}
                  <Link
                    href={pageHref(board, pathSlug, categorySlug, p)}
                    className={cn(
                      "ob-pill min-w-9 px-3 py-2 text-center text-xs font-semibold",
                      p === safePage ? "bg-accent text-white" : "text-muted hover:text-foreground",
                    )}
                    aria-current={p === safePage ? "page" : undefined}
                  >
                    {p}
                  </Link>
                </span>
              );
            })}
            <Link
              href={pageHref(
                board,
                pathSlug,
                categorySlug,
                Math.min(leaderboard.totalPages, safePage + 1),
              )}
              className={cn(
                "ob-pill px-3 py-2 text-xs font-semibold",
                safePage >= leaderboard.totalPages && "pointer-events-none opacity-40",
              )}
            >
              Next
            </Link>
          </div>
        </nav>
      ) : null}

      {board === "alltime" && todayBoard.items.length > 0 ? (
        <section className="mt-14">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">Today&apos;s ranking</h2>
            <Link href={todayTabHref} className="text-sm font-semibold text-accent hover:text-accent-hover">
              See all →
            </Link>
          </div>
          <div className="ob-card divide-y divide-border overflow-hidden p-0">
            {todayBoard.items.slice(0, 8).map((item) => (
              <Link
                key={`today-${item.id}`}
                href={productHref({ slug: item.slug, externalUrl: item.externalUrl })}
                className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-muted-bg/50 sm:px-5"
              >
                <span className="min-w-0 truncate text-sm font-semibold">
                  <span className="text-accent">#{item.rank}</span> {item.title}
                </span>
                <span className="shrink-0 text-sm font-bold text-accent">
                  {formatCurrency(item.displayAmount, currency)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <LatestActivity items={activityItems.filter((a) => a.rank > 0)} />

      <section className="mt-14 rounded-3xl border border-border bg-card/70 p-6 sm:p-8">
        <p className="text-sm text-muted">
          Some stats about this simple side project since its launch {stats.launchedDaysAgo} days ago
        </p>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <div className="text-3xl font-extrabold tracking-tight">{formatNumber(stats.visitors)}</div>
            <div className="mt-1 text-sm text-muted">visitors</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-accent">
              {formatCurrency(stats.revenue, currency)}
            </div>
            <div className="mt-1 text-sm text-muted">revenue</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight">{formatNumber(stats.products)}</div>
            <div className="mt-1 text-sm text-muted">products added</div>
          </div>
        </div>
      </section>
    </div>
  );
}
