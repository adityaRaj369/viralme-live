import { AnalyticsEventType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

type TrackInput = {
  type: AnalyticsEventType;
  userId?: string | null;
  listingId?: string | null;
  profileId?: string | null;
  sessionId?: string | null;
  metadata?: Prisma.InputJsonValue;
};

/**
 * Fire-and-forget analytics. Does not block the request path.
 */
export function trackEvent(input: TrackInput) {
  void persistEvent(input).catch((err) => console.error("[analytics]", err));
}

async function persistEvent(input: TrackInput) {
  await prisma.analyticsEvent.create({
    data: {
      type: input.type,
      userId: input.userId ?? undefined,
      listingId: input.listingId ?? undefined,
      profileId: input.profileId ?? undefined,
      sessionId: input.sessionId ?? undefined,
      metadata: input.metadata,
    },
  });

  // Lightweight counter updates
  if (input.listingId) {
    if (input.type === "LISTING_VIEW") {
      await prisma.listing.update({
        where: { id: input.listingId },
        data: { viewCount: { increment: 1 }, uniqueViewCount: { increment: 1 } },
      });
    }
    if (input.type === "LISTING_CLICK" || input.type === "EXTERNAL_CLICK") {
      await prisma.listing.update({
        where: { id: input.listingId },
        data: { clickCount: { increment: 1 } },
      });
    }
    if (input.type === "SHARE") {
      await prisma.listing.update({
        where: { id: input.listingId },
        data: { shareCount: { increment: 1 } },
      });
    }
  }
  if (input.profileId && input.type === "PROFILE_VIEW") {
    await prisma.profile.update({
      where: { id: input.profileId },
      data: { viewCount: { increment: 1 } },
    });
  }
}

export async function getUserAnalyticsSummary(userId: string, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const listings = await prisma.listing.findMany({
    where: { ownerId: userId, deletedAt: null },
    select: {
      id: true,
      title: true,
      viewCount: true,
      clickCount: true,
      likeCount: true,
      saveCount: true,
      contentType: true,
    },
  });

  const listingIds = listings.map((l) => l.id);
  const events = listingIds.length
    ? await prisma.analyticsEvent.groupBy({
        by: ["type", "createdAt"],
        where: { listingId: { in: listingIds }, createdAt: { gte: since } },
        _count: true,
      })
    : [];

  const totals = listings.reduce(
    (acc, l) => {
      acc.views += l.viewCount;
      acc.clicks += l.clickCount;
      acc.likes += l.likeCount;
      acc.saves += l.saveCount;
      return acc;
    },
    { views: 0, clicks: 0, likes: 0, saves: 0 },
  );

  const topListings = [...listings].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);

  const byCategory = new Map<string, number>();
  for (const l of listings) {
    byCategory.set(l.contentType, (byCategory.get(l.contentType) ?? 0) + l.viewCount);
  }

  return {
    totals: { ...totals, listings: listings.length },
    topListings,
    categoryPerformance: Array.from(byCategory.entries()).map(([category, views]) => ({
      category,
      views,
    })),
    recentEventCount: events.length,
  };
}

export async function getAdminAnalytics() {
  const [users, profiles, listings, revenue, activePromos, pending] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.profile.count({ where: { deletedAt: null } }),
    prisma.listing.count({ where: { deletedAt: null } }),
    prisma.transaction.aggregate({ _sum: { amount: true } }),
    prisma.promotion.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "PENDING_REVIEW" } }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const listingsToday = await prisma.listing.count({ where: { createdAt: { gte: today } } });
  const activeUsers = await prisma.user.count({
    where: { lastLoginAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
  });

  return {
    totalUsers: users,
    activeUsers,
    profiles,
    listings,
    listingsToday,
    revenue: Number(revenue._sum.amount ?? 0),
    activePromotions: activePromos,
    pendingModeration: pending,
  };
}
