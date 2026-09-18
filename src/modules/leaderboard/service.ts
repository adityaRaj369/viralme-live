/**
 * Outbid-style leaderboard: rank = what you pay. Nothing else.
 */
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { DEMO_AUTH } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { getPaymentProvider } from "@/modules/payments/provider";
import { parseExternalUrl } from "@/modules/media/adapters";
import {
  DEMO_RANK_CONFIG,
  demoCreateClaim,
  demoGetListings,
  useDemoStore,
} from "@/lib/demo-store";
import { z } from "zod";

export function utcDayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export async function getLeaderboardConfig() {
  if (useDemoStore()) return DEMO_RANK_CONFIG;
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: ["rankMinAmount", "rankBumpAmount", "rankCurrency"] } },
    });
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    return {
      minAmount: Number(map.rankMinAmount ?? 10),
      bumpAmount: Number(map.rankBumpAmount ?? 5),
      currency: String(map.rankCurrency ?? "USD"),
    };
  } catch {
    return DEMO_RANK_CONFIG;
  }
}

export async function getLeaderboard(opts: {
  board?: "alltime" | "today";
  categorySlug?: string;
  page?: number;
  pageSize?: number;
}) {
  const board = opts.board ?? "alltime";
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, opts.pageSize ?? 30));

  if (useDemoStore()) {
    return demoGetListings({
      board,
      categorySlug: opts.categorySlug,
      page,
      pageSize,
    });
  }

  try {
    const skip = (page - 1) * pageSize;
    const today = utcDayKey();

    const where: Prisma.ListingWhereInput = {
      status: "PUBLISHED",
      deletedAt: null,
      ...(board === "alltime"
        ? { rankAmount: { gt: 0 } }
        : { todayRankDate: today, todayRankAmount: { gt: 0 } }),
    };

    if (opts.categorySlug && opts.categorySlug !== "all") {
      where.categories = { some: { category: { slug: opts.categorySlug } } };
    }

    const orderBy: Prisma.ListingOrderByWithRelationInput[] =
      board === "alltime"
        ? [{ rankAmount: "desc" }, { updatedAt: "asc" }]
        : [{ todayRankAmount: "desc" }, { updatedAt: "asc" }];

    const [items, total, top] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          profile: { select: { username: true, displayName: true, avatarUrl: true } },
          categories: { include: { category: { select: { name: true, slug: true } } } },
        },
      }),
      prisma.listing.count({ where }),
      prisma.listing.findFirst({
        where,
        orderBy,
        select: { rankAmount: true, todayRankAmount: true },
      }),
    ]);

    const config = await getLeaderboardConfig();
    const currentTop =
      board === "alltime" ? Number(top?.rankAmount ?? 0) : Number(top?.todayRankAmount ?? 0);
    const claimPrice = Math.max(config.minAmount, currentTop + config.bumpAmount);

    return {
      items: items.map((item, i) => ({
        ...item,
        rank: skip + i + 1,
        displayAmount: board === "alltime" ? Number(item.rankAmount) : Number(item.todayRankAmount),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      claimPrice,
      currentTop,
      board,
      config,
    };
  } catch {
    return demoGetListings({
      board,
      categorySlug: opts.categorySlug,
      page,
      pageSize,
    });
  }
}

export const claimRankSchema = z.object({
  urlOrHandle: z.string().min(2).max(500),
  title: z.string().min(2).max(120).optional(),
  description: z.string().max(500).optional(),
  categoryId: z.string().optional(),
  amount: z.number().int().positive(),
});

function normalizeTarget(input: string) {
  const raw = input.trim();
  if (raw.startsWith("@")) {
    return { kind: "handle" as const, value: raw.toLowerCase(), url: `https://x.com/${raw.slice(1)}` };
  }
  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    u.search = "";
    u.hash = "";
    return { kind: "url" as const, value: u.toString().replace(/\/$/, ""), url: u.toString() };
  } catch {
    throw new AppError("Enter a valid product URL or @handle", 400);
  }
}

export async function createRankClaimOrder(
  userId: string,
  input: z.infer<typeof claimRankSchema>,
  sessionMeta?: { name?: string | null; email?: string },
) {
  const data = claimRankSchema.parse(input);
  const config = await getLeaderboardConfig();
  if (data.amount < config.minAmount) {
    throw new AppError(`Minimum claim is ${config.minAmount} ${config.currency}`, 400);
  }

  const target = normalizeTarget(data.urlOrHandle);
  const title =
    data.title ||
    (target.kind === "handle" ? target.value : target.value.replace(/^https?:\/\//, "").slice(0, 80));

  if (useDemoStore() || DEMO_AUTH) {
    try {
      return demoCreateClaim({
        userId,
        userName: sessionMeta?.name,
        userEmail: sessionMeta?.email,
        title,
        description: data.description,
        targetValue: target.value,
        targetUrl: target.url,
        kind: target.kind,
        amount: data.amount,
        categoryId: data.categoryId,
      });
    } catch (e) {
      throw new AppError(e instanceof Error ? e.message : "Claim failed", 400);
    }
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) throw new AppError("Create a profile first", 400);

  let listing = await prisma.listing.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { originalUrl: target.value },
        { externalUrl: target.value },
        ...(target.kind === "handle" ? [{ creatorHandle: target.value }] : []),
      ],
    },
  });

  const board = await getLeaderboard({ board: "alltime", pageSize: 1 });
  const currentAmount = listing ? Number(listing.rankAmount) : 0;

  if (!listing && data.amount < board.claimPrice) {
    throw new AppError(`Claim #1 requires at least ${board.claimPrice} ${config.currency}`, 400);
  }
  if (listing && data.amount <= currentAmount) {
    throw new AppError(`Raise must be above your current rank amount (${currentAmount})`, 400);
  }

  const chargeAmount = listing ? data.amount - currentAmount : data.amount;
  if (chargeAmount < 1) throw new AppError("Invalid raise amount", 400);

  const parsed = parseExternalUrl(target.url);

  if (!listing) {
    let slug = slugify(title);
    if (await prisma.listing.findUnique({ where: { slug } })) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    listing = await prisma.listing.create({
      data: {
        ownerId: userId,
        profileId: profile.id,
        title,
        slug,
        description: data.description ?? null,
        contentType: "OTHER",
        status: "DRAFT",
        originalUrl: target.value,
        externalUrl: target.url,
        platform: parsed?.platform ?? "EXTERNAL",
        externalId: parsed?.externalId,
        thumbnailUrl: parsed?.thumbnail,
        creatorHandle: target.kind === "handle" ? target.value : null,
        categories: data.categoryId ? { create: [{ categoryId: data.categoryId }] } : undefined,
      },
    });
  }

  const order = await prisma.order.create({
    data: {
      userId,
      type: "RANK_CLAIM",
      status: "AWAITING_PAYMENT",
      amount: chargeAmount,
      currency: config.currency,
      description: `Claim rank for ${title} at ${data.amount}`,
      metadata: {
        listingId: listing.id,
        targetAmount: data.amount,
        chargeAmount,
        board: "alltime",
      },
    },
  });

  const provider = getPaymentProvider();
  const intent = await provider.createOrder({
    amount: chargeAmount,
    currency: config.currency,
    receipt: order.id,
    notes: { orderId: order.id, listingId: listing.id, userId },
  });

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      userId,
      provider: provider.name,
      providerOrderId: intent.providerOrderId,
      amount: chargeAmount,
      currency: config.currency,
      status: "PENDING",
      rawPayload: intent.raw as Prisma.InputJsonValue,
    },
  });

  return { order, payment, checkout: intent, listing, chargeAmount, targetAmount: data.amount };
}

export async function fulfillRankClaim(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.type !== "RANK_CLAIM") throw new AppError("Order not found", 404);
  if (order.status === "PAID") return { alreadyActivated: true };

  const meta = order.metadata as { listingId?: string; targetAmount?: number };
  if (!meta?.listingId || meta.targetAmount == null) throw new AppError("Invalid order metadata", 400);

  const today = utcDayKey();
  const listing = await prisma.listing.findUnique({ where: { id: meta.listingId } });
  if (!listing) throw new AppError("Listing not found", 404);

  const previousToday =
    listing.todayRankDate === today ? Number(listing.todayRankAmount) : 0;
  const addToday = Number(order.amount);

  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: "PAID" } }),
    prisma.listing.update({
      where: { id: listing.id },
      data: {
        rankAmount: meta.targetAmount,
        todayRankAmount: previousToday + addToday,
        todayRankDate: today,
        status: "PUBLISHED",
        publishedAt: listing.publishedAt ?? new Date(),
      },
    }),
    prisma.transaction.create({
      data: {
        orderId,
        amount: order.amount,
        currency: order.currency,
        type: "RANK_CLAIM",
        description: `Rank claim to ${meta.targetAmount}`,
      },
    }),
    prisma.notification.create({
      data: {
        userId: order.userId,
        type: "PAYMENT_SUCCESSFUL",
        title: "Rank claimed",
        body: `Your listing is live on the leaderboard.`,
        link: `/listing/${listing.slug}`,
      },
    }),
  ]);

  return { listingId: listing.id, targetAmount: meta.targetAmount };
}
