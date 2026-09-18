import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getLeaderboard } from "@/modules/leaderboard/service";
import { ClaimRankBox } from "@/features/leaderboard/claim-rank-box";
import { RankCard } from "@/components/cards/rank-card";
import { getPublicCategoryBySlug } from "@/lib/admin-demo";
import { SHELL } from "@/lib/shell";
import { APP_CURRENCY, APP_NAME } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = getPublicCategoryBySlug(slug);
  if (!cat) return { title: "Category" };
  return {
    title: `${cat.fullName} ranking`,
    description: `Pay to rank in ${cat.fullName} on ${APP_NAME}. Rank is what you pay.`,
    alternates: { canonical: `/categories/${slug}` },
  };
}

export default async function CategoryBoardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = getPublicCategoryBySlug(slug);
  if (!cat || cat.slug === "all") notFound();

  const board = await getLeaderboard({
    board: "alltime",
    categorySlug: cat.slug === "leaderboards" ? undefined : cat.slug,
    pageSize: 30,
  });
  const currency = board.config.currency || APP_CURRENCY;

  return (
    <div className={`${SHELL} pb-16 pt-6`}>
      <nav className="text-xs text-muted">
        <Link href="/categories" className="hover:text-accent">
          Categories
        </Link>{" "}
        / <span className="text-foreground">{cat.fullName}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">{cat.fullName} ranking</h1>
      <p className="mt-2 text-muted">
        Claim #{1} from {formatCurrency(board.claimPrice, currency)}. Paid placement only.
      </p>

      <div className="mt-8">
        <Suspense fallback={<div className="ob-card h-40 animate-pulse" />}>
          <ClaimRankBox
            claimPrice={board.claimPrice}
            currency={currency}
            defaultCategoryId={cat.id}
            lockedCategoryLabel={cat.fullName}
          />
        </Suspense>
      </div>

      <div className="mt-10 space-y-5">
        {board.items.map((item) => (
          <RankCard
            key={item.id}
            currency={currency}
            claimHrefBase={`/categories/${cat.slug}`}
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
              categoryName: cat.name,
              categorySlug: cat.slug,
              thumbnailUrl: item.thumbnailUrl,
            }}
          />
        ))}
      </div>
    </div>
  );
}
