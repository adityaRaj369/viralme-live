import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getLeaderboard } from "@/modules/leaderboard/service";
import { ClaimRankBox } from "@/features/leaderboard/claim-rank-box";
import { RankCard } from "@/components/cards/rank-card";
import { SHELL } from "@/lib/shell";
import { APP_CURRENCY, APP_NAME, APP_REGION } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SEO Leaderboard — Pay to Rank",
  description: `Claim the #1 SEO spot on ${APP_NAME}. Built for founders in ${APP_REGION}. Rank is what you pay — nothing else.`,
  alternates: { canonical: "/seo" },
  openGraph: {
    title: `SEO Leaderboard · ${APP_NAME}`,
    description: "Pay to rank in SEO. No votes. No likes. Just your bid.",
  },
};

export default async function SeoCategoryPage() {
  const board = await getLeaderboard({
    board: "alltime",
    categorySlug: "seo",
    pageSize: 30,
  });
  const currency = board.config.currency || APP_CURRENCY;

  return (
    <div className={`${SHELL} pb-16 pt-6`}>
      <nav className="text-xs text-muted">
        <Link href="/" className="hover:text-accent">
          Leaderboard
        </Link>{" "}
        /{" "}
        <Link href="/categories" className="hover:text-accent">
          Categories
        </Link>{" "}
        / <span className="text-foreground">SEO</span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">SEO ranking</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
        The SEO board is a paid placement channel for India & Asia. Paste your product URL, set a bid
        in {currency}, and claim a rank. Higher bid = higher rank. Clicks are tracked — they never
        change your position.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="ob-card p-4">
          <div className="text-xs uppercase text-muted">Claim #1 from</div>
          <div className="mt-1 text-xl font-extrabold text-accent">
            {formatCurrency(board.claimPrice, currency)}
          </div>
        </div>
        <div className="ob-card p-4">
          <div className="text-xs uppercase text-muted">Listings on SEO</div>
          <div className="mt-1 text-xl font-extrabold">{board.total}</div>
        </div>
        <div className="ob-card p-4">
          <div className="text-xs uppercase text-muted">How it works</div>
          <div className="mt-1 text-sm font-semibold">Pay difference to raise · mock checkout in demo</div>
        </div>
      </div>

      <div className="mt-8">
        <Suspense fallback={<div className="ob-card h-48 animate-pulse" />}>
          <ClaimRankBox
            claimPrice={board.claimPrice}
            currency={currency}
            defaultCategoryId="cat-seo"
            lockedCategoryLabel="SEO"
          />
        </Suspense>
        <p className="mt-3 text-center text-xs text-muted">
          Claims on this page target the <strong className="text-foreground">SEO</strong> category.
          Payment & login wiring comes later — demo checkout is mock.
        </p>
      </div>

      <div className="mt-10 space-y-5">
        {board.items.map((item) => (
          <RankCard
            key={item.id}
            currency={currency}
            claimForAmount={item.rank === 1 ? board.claimPrice : item.displayAmount + 1}
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
              categoryName: "SEO",
              categorySlug: "seo",
              thumbnailUrl: item.thumbnailUrl,
            }}
          />
        ))}
        {board.items.length === 0 ? (
          <p className="text-sm text-muted">No SEO ranks yet — be the first.</p>
        ) : null}
      </div>
    </div>
  );
}
