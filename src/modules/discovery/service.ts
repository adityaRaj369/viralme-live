/**
 * Discovery ordering is PAID / CURATED / NEW only.
 * Analytics (views, clicks) are informational and MUST NOT affect placement.
 */
import { ContentType, MediaPlatform, Prisma, PromotionType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/constants";
import { expirePromotions } from "@/modules/promotions/service";

export type DiscoveryFilter =
  | "featured"
  | "sponsored"
  | "new"
  | "trending"
  | "all";

type DiscoveryInput = {
  contentType?: ContentType | ContentType[];
  categorySlug?: string;
  filter?: DiscoveryFilter;
  q?: string;
  page?: number;
  pageSize?: number;
  platform?: MediaPlatform;
};

const listingInclude = {
  profile: { select: { username: true, displayName: true, avatarUrl: true, isVerified: true } },
  categories: { include: { category: { select: { name: true, slug: true } } } },
  promotions: {
    where: { status: "ACTIVE" as const, endAt: { gt: new Date() } },
    select: { type: true, slotPosition: true },
    take: 1,
  },
} satisfies Prisma.ListingInclude;

export async function discoverListings(input: DiscoveryInput = {}) {
  await expirePromotions().catch(() => undefined);

  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, input.pageSize ?? DEFAULT_PAGE_SIZE));
  const skip = (page - 1) * pageSize;
  const filter = input.filter ?? "all";

  const baseWhere: Prisma.ListingWhereInput = {
    status: "PUBLISHED",
    deletedAt: null,
  };

  if (input.contentType) {
    baseWhere.contentType = Array.isArray(input.contentType)
      ? { in: input.contentType }
      : input.contentType;
  }
  if (input.platform) baseWhere.platform = input.platform;
  if (input.categorySlug) {
    baseWhere.categories = { some: { category: { slug: input.categorySlug } } };
  }
  if (input.q) {
    baseWhere.OR = [
      { title: { contains: input.q, mode: "insensitive" } },
      { description: { contains: input.q, mode: "insensitive" } },
      { tags: { has: input.q.toLowerCase() } },
    ];
  }

  if (filter === "featured") {
    baseWhere.OR = [
      { isFeatured: true },
      {
        promotions: {
          some: {
            status: "ACTIVE",
            endAt: { gt: new Date() },
            type: { in: ["FEATURED", "HOMEPAGE_FEATURE"] },
          },
        },
      },
    ];
  }

  if (filter === "sponsored") {
    baseWhere.promotions = {
      some: { status: "ACTIVE", endAt: { gt: new Date() } },
    };
  }

  if (filter === "trending") {
    // Paid placements + admin curation + featured — never engagement score
    const [curatedIds, promotedIds] = await Promise.all([
      prisma.trendingPlacement.findMany({
        where: { isActive: true, startAt: { lte: new Date() }, endAt: { gt: new Date() } },
        orderBy: { position: "asc" },
        select: { listingId: true, position: true },
      }),
      prisma.promotionSlot.findMany({
        where: { isActive: true, endAt: { gt: new Date() } },
        orderBy: [{ type: "asc" }, { position: "asc" }],
        select: { listingId: true, position: true, type: true },
      }),
    ]);

    const orderedIds: string[] = [];
    const seen = new Set<string>();
    for (const c of curatedIds) {
      if (!seen.has(c.listingId)) {
        orderedIds.push(c.listingId);
        seen.add(c.listingId);
      }
    }
    for (const p of promotedIds) {
      if (!seen.has(p.listingId)) {
        orderedIds.push(p.listingId);
        seen.add(p.listingId);
      }
    }

    if (orderedIds.length === 0) {
      // Fallback: featured + newest published (still not engagement-ranked)
      baseWhere.OR = [{ isFeatured: true }, { publishedAt: { not: null } }];
    } else {
      baseWhere.id = { in: orderedIds };
    }

    const [raw, total] = await Promise.all([
      prisma.listing.findMany({
        where: baseWhere,
        include: listingInclude,
        take: 500,
      }),
      prisma.listing.count({ where: baseWhere }),
    ]);

    const byId = new Map(raw.map((l) => [l.id, l]));
    let items: typeof raw =
      orderedIds.length > 0
        ? (orderedIds.map((id) => byId.get(id)).filter((l): l is (typeof raw)[number] => Boolean(l)))
        : [...raw].sort((a, b) => {
            if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
            return (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0);
          });

    const pageItems = items.slice(skip, skip + pageSize);
    return { items: pageItems, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  // all / new — newest first; featured boosted to top within page query via sort
  const orderBy: Prisma.ListingOrderByWithRelationInput[] =
    filter === "new"
      ? [{ publishedAt: "desc" }]
      : [{ isFeatured: "desc" }, { publishedAt: "desc" }];

  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where: baseWhere,
      orderBy,
      skip,
      take: pageSize,
      include: listingInclude,
    }),
    prisma.listing.count({ where: baseWhere }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getTrendingFeed(page = 1, pageSize = 24) {
  return discoverListings({ filter: "trending", page, pageSize });
}

/** @deprecated Engagement ranking removed — kept name for clarity in audits */
export { assertNoEngagementPlacement } from "@/modules/discovery/policy";

export type { PromotionType };
