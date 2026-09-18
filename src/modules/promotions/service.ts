/**
 * PromotionRankingService / PaidPromotionService
 * Time-limited promotional slots — separate from organic ranking.
 */
import { PromotionType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { getPaymentProvider } from "@/modules/payments/provider";
import { notifyUser } from "@/modules/notifications/service";

const SLOT_LIMITS: Record<PromotionType, number> = {
  TOP_10: 10,
  TOP_20: 20,
  TOP_50: 50,
  FEATURED: 12,
  HOMEPAGE_FEATURE: 6,
};

export async function listPromotionProducts() {
  return prisma.promotionProduct.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function expirePromotions(now = new Date()) {
  const expired = await prisma.promotion.findMany({
    where: { status: "ACTIVE", endAt: { lte: now } },
  });

  for (const promo of expired) {
    await prisma.$transaction([
      prisma.promotion.update({
        where: { id: promo.id },
        data: { status: "EXPIRED" },
      }),
      prisma.promotionSlot.updateMany({
        where: { promotionId: promo.id },
        data: { isActive: false },
      }),
      prisma.notification.create({
        data: {
          userId: promo.userId,
          type: "PROMOTION_EXPIRED",
          title: "Promotion expired",
          body: `Your ${promo.type.replace(/_/g, " ")} promotion has ended.`,
          link: `/dashboard/promotions`,
        },
      }),
    ]);
  }

  return { expired: expired.length };
}

async function allocateSlot(type: PromotionType, listingId: string, promotionId: string, startAt: Date, endAt: Date) {
  const product = await prisma.promotionProduct.findUnique({ where: { type } });
  const limit = product?.slotLimit ?? SLOT_LIMITS[type];

  const activeSlots = await prisma.promotionSlot.findMany({
    where: { type, isActive: true, endAt: { gt: new Date() } },
    orderBy: { position: "asc" },
  });

  const occupied = new Set(activeSlots.map((s) => s.position));
  let position: number | null = null;
  for (let i = 1; i <= limit; i++) {
    if (!occupied.has(i)) {
      position = i;
      break;
    }
  }

  if (position === null) {
    // Replace the soonest-to-expire slot only if fully booked — queue instead
    throw new AppError("All promotion slots are currently filled. Try again later.", 409, "SLOTS_FULL");
  }

  await prisma.promotionSlot.create({
    data: {
      promotionId,
      type,
      position,
      listingId,
      startAt,
      endAt,
      isActive: true,
    },
  });

  return position;
}

export async function createPromotionOrder(userId: string, listingId: string, type: PromotionType) {
  await expirePromotions();

  const listing = await prisma.listing.findFirst({
    where: { id: listingId, ownerId: userId, status: "PUBLISHED", deletedAt: null },
  });
  if (!listing) throw new AppError("Published listing required", 404);

  const product = await prisma.promotionProduct.findFirst({
    where: { type, isActive: true },
  });
  if (!product) throw new AppError("Promotion product not available", 404);

  const order = await prisma.order.create({
    data: {
      userId,
      type: "PROMOTION",
      status: "AWAITING_PAYMENT",
      amount: product.price,
      currency: product.currency,
      description: `${product.name} for ${listing.title}`,
      metadata: { listingId, promotionType: type, durationHours: product.durationHours },
    },
  });

  const provider = getPaymentProvider();
  const paymentIntent = await provider.createOrder({
    amount: Number(product.price),
    currency: product.currency,
    receipt: order.id,
    notes: { orderId: order.id, userId, listingId, type },
  });

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      userId,
      provider: provider.name,
      providerOrderId: paymentIntent.providerOrderId,
      amount: product.price,
      currency: product.currency,
      status: "PENDING",
      rawPayload: paymentIntent.raw as Prisma.InputJsonValue,
    },
  });

  const promotion = await prisma.promotion.create({
    data: {
      listingId,
      userId,
      type,
      status: "PENDING",
      price: product.price,
      currency: product.currency,
      orderId: order.id,
      paymentId: payment.id,
    },
  });

  return { order, payment, promotion, checkout: paymentIntent };
}

export async function activatePromotionFromPayment(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.type !== "PROMOTION") throw new AppError("Order not found", 404);
  if (order.status === "PAID") return { alreadyActivated: true };

  const meta = order.metadata as { listingId?: string; promotionType?: PromotionType; durationHours?: number };
  if (!meta?.listingId || !meta?.promotionType) throw new AppError("Invalid order metadata", 400);

  const promotion = await prisma.promotion.findFirst({
    where: { orderId, status: "PENDING" },
  });
  if (!promotion) throw new AppError("Promotion not found", 404);

  const product = await prisma.promotionProduct.findUnique({ where: { type: meta.promotionType } });
  const hours = meta.durationHours ?? product?.durationHours ?? 24;
  const startAt = new Date();
  const endAt = new Date(startAt.getTime() + hours * 60 * 60 * 1000);

  const position = await allocateSlot(meta.promotionType, meta.listingId, promotion.id, startAt, endAt);

  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: "PAID" } }),
    prisma.promotion.update({
      where: { id: promotion.id },
      data: { status: "ACTIVE", startAt, endAt, slotPosition: position },
    }),
    prisma.transaction.create({
      data: {
        orderId,
        amount: order.amount,
        currency: order.currency,
        type: "PROMOTION_PURCHASE",
        description: `Activated ${meta.promotionType}`,
      },
    }),
  ]);

  await notifyUser(order.userId, {
    type: "PROMOTION_ACTIVATED",
    title: "Promotion activated",
    body: `Your listing is now in ${meta.promotionType.replace(/_/g, " ")} at #${position}.`,
    link: "/dashboard/promotions",
  });

  return { promotionId: promotion.id, position, endAt };
}

export async function getActivePromotedListings(type?: PromotionType) {
  await expirePromotions();

  const slots = await prisma.promotionSlot.findMany({
    where: {
      isActive: true,
      endAt: { gt: new Date() },
      ...(type ? { type } : {}),
    },
    orderBy: [{ type: "asc" }, { position: "asc" }],
  });

  const listingIds = slots.map((s) => s.listingId);
  if (listingIds.length === 0) return [];

  const listings = await prisma.listing.findMany({
    where: { id: { in: listingIds }, status: "PUBLISHED", deletedAt: null },
    include: {
      profile: { select: { username: true, displayName: true, avatarUrl: true, isVerified: true } },
      categories: { include: { category: { select: { name: true, slug: true } } } },
      promotions: {
        where: { status: "ACTIVE", endAt: { gt: new Date() } },
        select: { type: true, slotPosition: true },
        take: 1,
      },
    },
  });

  const byId = new Map(listings.map((l) => [l.id, l]));
  return slots
    .map((slot) => {
      const listing = byId.get(slot.listingId);
      if (!listing) return null;
      return {
        ...listing,
        promoted: { type: slot.type, position: slot.position, endAt: slot.endAt },
      };
    })
    .filter(Boolean);
}
