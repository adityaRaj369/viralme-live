import type { MetadataRoute } from "next";
import { useDemoStore, demoGetListings } from "@/lib/demo-store";
import { getPublicCategories } from "@/lib/admin-demo";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes = [
    "",
    "/daily",
    "/categories",
    "/about",
    "/search",
    "/seo",
    "/faq",
    "/rules",
    "/terms",
    "/privacy",
    "/imprint",
    "/stats",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : path === "/seo" ? 0.95 : 0.8,
  }));

  const categoryRoutes = getPublicCategories()
    .filter((c) => c.slug !== "all")
    .map((c) => ({
      url: `${base}/categories/${c.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.85,
    }));

  let listingRoutes: MetadataRoute.Sitemap = [];
  if (useDemoStore()) {
    const board = demoGetListings({ board: "alltime", page: 1, pageSize: 200 });
    listingRoutes = board.items.map((l) => ({
      url: `${base}/listing/${l.slug}`,
      lastModified: l.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  }

  return [...staticRoutes, ...categoryRoutes, ...listingRoutes];
}
