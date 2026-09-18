import Link from "next/link";
import { getLeaderboard } from "@/modules/leaderboard/service";
import { RankCard } from "@/components/cards/rank-card";
import { SHELL } from "@/lib/shell";

export const dynamic = "force-dynamic";
export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();
  const board = await getLeaderboard({ board: "alltime", pageSize: 100 });
  const items = query
    ? board.items.filter(
        (i) =>
          i.title.toLowerCase().includes(query) ||
          (i.description ?? "").toLowerCase().includes(query) ||
          (i.externalUrl ?? "").toLowerCase().includes(query),
      )
    : board.items;

  return (
    <div className={`${SHELL} pb-16 pt-6`}>
      <h1 className="text-3xl font-extrabold tracking-tight">Search</h1>
      <form className="mt-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search products…"
          className="h-12 w-full rounded-full border border-border bg-card px-5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </form>
      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <RankCard
            key={item.id}
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
        {items.length === 0 ? <p className="text-sm text-muted">No results.</p> : null}
      </div>
      <Link href="/" className="mt-8 inline-block text-sm font-semibold text-accent">
        ← Leaderboard
      </Link>
    </div>
  );
}
