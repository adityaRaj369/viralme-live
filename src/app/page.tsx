import { BoardView } from "@/features/leaderboard/board-view";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ board?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const board = params.board === "today" ? "today" : "alltime";
  const page = Math.max(1, Number(params.page) || 1);

  // Legacy ?category=seo → still works but chips use /category/…
  if (params.category && params.category !== "all") {
    const { getPublicCategoryBySlug } = await import("@/lib/admin-demo");
    const cat = getPublicCategoryBySlug(params.category);
    if (cat && cat.slug !== "all") {
      return (
        <BoardView
          board={board}
          categorySlug={cat.slug}
          pathSlug={cat.pathSlug}
          categoryId={cat.id}
          categoryFullName={cat.fullName}
          page={page}
        />
      );
    }
  }

  return <BoardView board={board} categorySlug="all" page={page} />;
}
