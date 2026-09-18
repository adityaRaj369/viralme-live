import { redirect } from "next/navigation";
import { getPublicCategoryBySlug } from "@/lib/admin-demo";
import { categoryBoardHref } from "@/lib/outbid-categories";

export const dynamic = "force-dynamic";

/** Legacy /categories/[slug] → outbid-style /category/[pathSlug] */
export default async function LegacyCategoryRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = getPublicCategoryBySlug(slug);
  if (!cat || cat.slug === "all") redirect("/categories");
  redirect(categoryBoardHref({ slug: cat.slug, pathSlug: cat.pathSlug }));
}
