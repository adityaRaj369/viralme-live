import { BoardView } from "@/features/leaderboard/board-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Today", alternates: { canonical: "/today" } };

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  return (
    <BoardView board="today" categorySlug="all" page={Math.max(1, Number(page) || 1)} />
  );
}
