import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BoardView } from "@/features/leaderboard/board-view";
import { getPublicCategoryBySlug } from "@/lib/admin-demo";
import { APP_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = getPublicCategoryBySlug(slug);
  if (!cat || cat.slug === "all") return { title: "Category" };
  return {
    title: `${cat.fullName} ranking`,
    description: `Pay to rank in ${cat.fullName} on ${APP_NAME}. Rank is what you pay.`,
    alternates: { canonical: `/category/${cat.pathSlug || slug}` },
  };
}

export default async function CategoryBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageRaw } = await searchParams;
  const cat = getPublicCategoryBySlug(slug);
  if (!cat || cat.slug === "all") notFound();

  return (
    <BoardView
      board="alltime"
      categorySlug={cat.slug}
      pathSlug={cat.pathSlug || slug}
      categoryId={cat.id}
      categoryFullName={cat.fullName}
      page={Math.max(1, Number(pageRaw) || 1)}
    />
  );
}
