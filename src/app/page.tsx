import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import {
  Bot,
  Briefcase,
  Building2,
  ChartColumn,
  Coins,
  Gamepad2,
  Globe2,
  GraduationCap,
  Heart,
  Home,
  ListTodo,
  Megaphone,
  Newspaper,
  PenLine,
  Shield,
  ShoppingCart,
  Sparkles,
  Trophy,
  Users,
  Code2,
  Plane,
  Music,
  User,
} from "lucide-react";
import { getLeaderboard } from "@/modules/leaderboard/service";
import { ClaimRankBox } from "@/features/leaderboard/claim-rank-box";
import { RankCard } from "@/components/cards/rank-card";
import { EmptyState } from "@/components/ui/states";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { demoSiteStats } from "@/lib/demo-store";
import { adminGetContent, getPublicCategories } from "@/lib/admin-demo";
import { PAGE_SIZE, SHELL } from "@/lib/shell";

export const dynamic = "force-dynamic";

const catIcons: Record<string, ReactNode> = {
  all: <Sparkles className="h-3.5 w-3.5" />,
  leaderboards: <Trophy className="h-3.5 w-3.5" />,
  seo: <Sparkles className="h-3.5 w-3.5" />,
  marketing: <Megaphone className="h-3.5 w-3.5" />,
  productivity: <ListTodo className="h-3.5 w-3.5" />,
  agents: <Bot className="h-3.5 w-3.5" />,
  crypto: <Coins className="h-3.5 w-3.5" />,
  developer: <Code2 className="h-3.5 w-3.5" />,
  other: <Sparkles className="h-3.5 w-3.5" />,
  health: <Heart className="h-3.5 w-3.5" />,
  business: <Briefcase className="h-3.5 w-3.5" />,
  games: <Gamepad2 className="h-3.5 w-3.5" />,
  ecommerce: <ShoppingCart className="h-3.5 w-3.5" />,
  travel: <Plane className="h-3.5 w-3.5" />,
  directories: <ListTodo className="h-3.5 w-3.5" />,
  agencies: <Building2 className="h-3.5 w-3.5" />,
  "ai-media": <Sparkles className="h-3.5 w-3.5" />,
  education: <GraduationCap className="h-3.5 w-3.5" />,
  social: <Users className="h-3.5 w-3.5" />,
  people: <User className="h-3.5 w-3.5" />,
  design: <PenLine className="h-3.5 w-3.5" />,
  hiring: <Briefcase className="h-3.5 w-3.5" />,
  domains: <Globe2 className="h-3.5 w-3.5" />,
  security: <Shield className="h-3.5 w-3.5" />,
  sales: <Megaphone className="h-3.5 w-3.5" />,
  news: <Newspaper className="h-3.5 w-3.5" />,
  "real-estate": <Home className="h-3.5 w-3.5" />,
  writing: <PenLine className="h-3.5 w-3.5" />,
  audio: <Music className="h-3.5 w-3.5" />,
  analytics: <ChartColumn className="h-3.5 w-3.5" />,
};

function pageHref(board: string, category: string, page: number) {
  const q = new URLSearchParams({ board, category, page: String(page) });
  return `/?${q.toString()}`;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ board?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const board = params.board === "today" ? "today" : "alltime";
  const category = params.category || "all";
  const page = Math.max(1, Number(params.page) || 1);

  const [alltimeTop, leaderboard, todayBoard] = await Promise.all([
    getLeaderboard({ board: "alltime", pageSize: 1 }),
    getLeaderboard({
      board,
      categorySlug: category === "all" || category === "leaderboards" ? undefined : category,
      page,
      pageSize: PAGE_SIZE,
    }),
    getLeaderboard({
      board: "today",
      categorySlug: category === "all" || category === "leaderboards" ? undefined : category,
      pageSize: 10,
    }),
  ]);

  const claimPrice = alltimeTop.claimPrice;
  const currency = alltimeTop.config.currency;
  const stats = demoSiteStats();
  const categories = getPublicCategories();
  const { homeEmpty } = adminGetContent();
  const start = (leaderboard.page - 1) * leaderboard.pageSize + 1;
  const end = Math.min(leaderboard.page * leaderboard.pageSize, leaderboard.total);

  const pageButtons = Array.from({ length: leaderboard.totalPages }, (_, i) => i + 1).filter((p) => {
    if (leaderboard.totalPages <= 7) return true;
    return p === 1 || p === leaderboard.totalPages || Math.abs(p - page) <= 1;
  });

  return (
    <div className={`${SHELL} w-full pb-16 pt-4 sm:pt-6`}>
      {/* Categories */}
      <nav className="ob-pill mb-5 flex gap-1 overflow-x-auto p-1.5 no-scrollbar" aria-label="Ranking categories">
        {categories.map((p) => (
          <Link
            key={p.slug}
            href={`/?board=${board}&category=${p.slug}`}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold transition",
              category === p.slug
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:bg-muted-bg hover:text-foreground",
            )}
          >
            {catIcons[p.slug] ?? <Sparkles className="h-3.5 w-3.5" />}
            {p.name}
          </Link>
        ))}
        <Link
          href="/categories"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold text-muted hover:bg-muted-bg hover:text-foreground"
        >
          Explore
        </Link>
      </nav>

      <div className="mb-5 flex flex-col items-center gap-3">
        <Link
          href="/stats"
          className="ob-pill inline-flex max-w-full items-center gap-2 px-3 py-1.5 text-[12px] text-muted hover:text-foreground"
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
          <span className="truncate">
            {stats.online} online · {stats.visitorsToday.toLocaleString()} visitors today · stats→
          </span>
        </Link>

        <div className="ob-pill inline-flex p-1 text-[13px] font-semibold" role="tablist">
          <Link
            href={`/?board=alltime&category=${category}`}
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
            href={`/?board=today&category=${category}`}
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
        <ClaimRankBox claimPrice={claimPrice} currency={currency} />
      </Suspense>

      <div className="mt-8 space-y-5">
        {leaderboard.items.length ? (
          leaderboard.items.map((item) => (
            <RankCard
              key={item.id}
              currency={currency}
              claimForAmount={item.rank === 1 && page === 1 ? claimPrice : item.displayAmount + 1}
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
          <EmptyState
            title="No ranks claimed yet."
            description={homeEmpty}
          />
        )}
      </div>

      {/* Pagination */}
      {leaderboard.total > 0 ? (
        <nav className="mt-10 flex flex-col items-center gap-3" aria-label="Ranking pages">
          <p className="text-sm text-muted">
            {start} – {end} of {leaderboard.total.toLocaleString()}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <Link
              href={pageHref(board, category, Math.max(1, page - 1))}
              className={cn(
                "ob-pill px-3 py-2 text-xs font-semibold",
                page <= 1 && "pointer-events-none opacity-40",
              )}
              aria-disabled={page <= 1}
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
                    href={pageHref(board, category, p)}
                    className={cn(
                      "ob-pill min-w-9 px-3 py-2 text-center text-xs font-semibold",
                      p === page ? "bg-accent text-white" : "text-muted hover:text-foreground",
                    )}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </Link>
                </span>
              );
            })}
            <Link
              href={pageHref(board, category, Math.min(leaderboard.totalPages, page + 1))}
              className={cn(
                "ob-pill px-3 py-2 text-xs font-semibold",
                page >= leaderboard.totalPages && "pointer-events-none opacity-40",
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
            <Link
              href={`/?board=today&category=${category}`}
              className="text-sm font-semibold text-accent hover:text-accent-hover"
            >
              See all →
            </Link>
          </div>
          <div className="ob-card divide-y divide-border overflow-hidden p-0">
            {todayBoard.items.slice(0, 8).map((item) => (
              <Link
                key={`today-${item.id}`}
                href={`/listing/${item.slug}`}
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

      {/* Bottom site stats */}
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
