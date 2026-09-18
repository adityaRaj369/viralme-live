import {
  ContentType,
  ListingStatus,
  MediaPlatform,
  Prisma,
  type PromotionType,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { slugify } from "@/lib/utils";
import { z } from "zod";
import { getListingLimitForUser } from "@/modules/subscriptions/service";
import { parseExternalUrl } from "@/modules/media/adapters";
import { discoverListings as discoverByPlacement } from "@/modules/discovery/service";
import type { DiscoveryFilter } from "@/modules/discovery/service";

export { discoverListingsCompat as discoverListings };

export const createListingSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(2000).optional(),
  contentType: z.nativeEnum(ContentType),
  originalUrl: z.string().url().optional().or(z.literal("")),
  externalUrl: z.string().url().optional().or(z.literal("")),
  categoryIds: z.array(z.string()).min(1).max(5),
  price: z.number().nonnegative().optional().nullable(),
  currency: z.string().length(3).optional(),
  location: z.string().max(120).optional().nullable(),
  tags: z.array(z.string().max(40)).max(12).optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  creatorHandle: z.string().max(80).optional().nullable(),
  submitForReview: z.boolean().optional(),
});

/** Maps query params to paid/curated discovery — never likes/views ranking */
export async function discoverListingsCompat(filters: {
  contentType?: ContentType | ContentType[];
  categorySlug?: string;
  sort?: string;
  filter?: DiscoveryFilter;
  q?: string;
  page?: number;
  pageSize?: number;
  platform?: MediaPlatform;
}) {
  const legacy = filters.sort;
  let filter: DiscoveryFilter = filters.filter ?? "all";
  if (!filters.filter) {
    if (legacy === "newest" || legacy === "new") filter = "new";
    else if (legacy === "trending") filter = "trending";
    else if (legacy === "featured") filter = "featured";
    else if (legacy === "sponsored") filter = "sponsored";
  }
  return discoverByPlacement({
    contentType: filters.contentType,
    categorySlug: filters.categorySlug,
    filter,
    q: filters.q,
    page: filters.page,
    pageSize: filters.pageSize,
    platform: filters.platform,
  });
}

export async function createListing(userId: string, input: z.infer<typeof createListingSchema>) {
  const data = createListingSchema.parse(input);
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) throw new AppError("Create a profile first", 400);

  const limit = await getListingLimitForUser(userId);
  const activeCount = await prisma.listing.count({
    where: {
      ownerId: userId,
      deletedAt: null,
      status: { notIn: ["ARCHIVED"] },
    },
  });

  if (activeCount >= limit) {
    throw new AppError(
      `You've reached your ${limit} listing limit.`,
      403,
      "LISTING_LIMIT_REACHED",
      { limit, activeCount, upgradeUrl: "/pricing" },
    );
  }

  const url = data.originalUrl || data.externalUrl || "";
  const parsed = url ? parseExternalUrl(url) : null;

  let slug = slugify(data.title);
  const slugExists = await prisma.listing.findUnique({ where: { slug } });
  if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;

  const status: ListingStatus = data.submitForReview ? "PENDING_REVIEW" : "DRAFT";

  const listing = await prisma.$transaction(async (tx) => {
    const created = await tx.listing.create({
      data: {
        ownerId: userId,
        profileId: profile.id,
        title: data.title,
        slug,
        description: data.description,
        contentType: data.contentType,
        status,
        originalUrl: url || null,
        externalUrl: data.externalUrl || url || null,
        platform: parsed?.platform ?? MediaPlatform.NONE,
        externalId: parsed?.externalId,
        thumbnailUrl: data.thumbnailUrl || parsed?.thumbnail || null,
        price: data.price ?? null,
        currency: data.currency ?? "INR",
        location: data.location,
        tags: data.tags ?? [],
        creatorHandle: data.creatorHandle,
        categories: {
          create: data.categoryIds.map((categoryId) => ({ categoryId })),
        },
        media:
          data.thumbnailUrl || parsed?.thumbnail
            ? {
                create: [
                  {
                    url: (data.thumbnailUrl || parsed?.thumbnail)!,
                    type: parsed?.platform !== MediaPlatform.NONE ? "video" : "image",
                    platform: parsed?.platform ?? MediaPlatform.NONE,
                    externalId: parsed?.externalId,
                    thumbnail: parsed?.thumbnail,
                  },
                ],
              }
            : undefined,
      },
      include: {
        categories: { include: { category: true } },
        profile: true,
        media: true,
      },
    });

    await tx.profile.update({
      where: { id: profile.id },
      data: { listingCount: { increment: 1 } },
    });

    if (activeCount + 1 >= limit) {
      await tx.notification.create({
        data: {
          userId,
          type: "PROFILE_LIMIT_REACHED",
          title: "Listing limit reached",
          body: `You've reached your ${limit} listing limit. Upgrade to add more.`,
          link: "/pricing",
        },
      });
    }

    return created;
  });

  return listing;
}

export async function getListingBySlug(slug: string) {
  const listing = await prisma.listing.findFirst({
    where: { slug, deletedAt: null },
    include: {
      profile: true,
      categories: { include: { category: true } },
      media: { orderBy: { sortOrder: "asc" } },
      promotions: {
        where: { status: "ACTIVE", endAt: { gt: new Date() } },
        take: 1,
      },
    },
  });
  if (!listing) throw new AppError("Listing not found", 404);
  if (listing.status !== "PUBLISHED") {
    // allow owner/admin via caller checks
  }
  return listing;
}

export async function getUserListings(
  userId: string,
  status?: ListingStatus,
  page = 1,
  pageSize = 20,
) {
  const where: Prisma.ListingWhereInput = {
    ownerId: userId,
    deletedAt: null,
    ...(status ? { status } : {}),
  };
  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
      include: {
        categories: { include: { category: true } },
        promotions: { where: { status: "ACTIVE" }, take: 1 },
      },
    }),
    prisma.listing.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function toggleLike(userId: string, listingId: string) {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, status: "PUBLISHED", deletedAt: null },
  });
  if (!listing) throw new AppError("Listing not found", 404);

  const existing = await prisma.like.findUnique({
    where: { userId_listingId: { userId, listingId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.like.delete({ where: { id: existing.id } }),
      prisma.listing.update({
        where: { id: listingId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
    return { liked: false };
  }

  await prisma.$transaction([
    prisma.like.create({ data: { userId, listingId } }),
    prisma.listing.update({
      where: { id: listingId },
      data: { likeCount: { increment: 1 } },
    }),
  ]);
  return { liked: true };
}

export async function toggleSave(userId: string, listingId: string) {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, status: "PUBLISHED", deletedAt: null },
  });
  if (!listing) throw new AppError("Listing not found", 404);

  const existing = await prisma.save.findUnique({
    where: { userId_listingId: { userId, listingId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.save.delete({ where: { id: existing.id } }),
      prisma.listing.update({
        where: { id: listingId },
        data: { saveCount: { decrement: 1 } },
      }),
    ]);
    return { saved: false };
  }

  await prisma.$transaction([
    prisma.save.create({ data: { userId, listingId } }),
    prisma.listing.update({
      where: { id: listingId },
      data: { saveCount: { increment: 1 } },
    }),
  ]);
  return { saved: true };
}

export async function archiveListing(userId: string, listingId: string) {
  const listing = await prisma.listing.findFirst({ where: { id: listingId, ownerId: userId } });
  if (!listing) throw new AppError("Listing not found", 404);
  return prisma.listing.update({
    where: { id: listingId },
    data: { status: "ARCHIVED" },
  });
}

export async function duplicateListing(userId: string, listingId: string) {
  const source = await prisma.listing.findFirst({
    where: { id: listingId, ownerId: userId },
    include: { categories: true, media: true },
  });
  if (!source) throw new AppError("Listing not found", 404);

  return createListing(userId, {
    title: `${source.title} (Copy)`,
    description: source.description ?? undefined,
    contentType: source.contentType,
    originalUrl: source.originalUrl ?? "",
    externalUrl: source.externalUrl ?? "",
    categoryIds: source.categories.map((c) => c.categoryId),
    price: source.price ? Number(source.price) : null,
    currency: source.currency ?? "INR",
    location: source.location,
    tags: source.tags,
    thumbnailUrl: source.thumbnailUrl ?? "",
    creatorHandle: source.creatorHandle,
    submitForReview: false,
  });
}

export type PromotedBadge = { type: PromotionType; position?: number | null };
