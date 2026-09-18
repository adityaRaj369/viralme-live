import { Role, UserStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { listPlans } from "@/modules/subscriptions/service";

export async function adminListUsers(q?: string, page = 1, pageSize = 20) {
  const where = {
    deletedAt: null as Date | null,
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" as const } },
            { name: { contains: q, mode: "insensitive" as const } },
            { profile: { username: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };
  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        profile: true,
        subscription: { include: { plan: true } },
        _count: { select: { listings: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function adminUpdateUser(
  actorId: string,
  userId: string,
  data: { status?: UserStatus; role?: Role; isVerified?: boolean },
) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
  if (!user) throw new AppError("User not found", 404);

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.user.update({
      where: { id: userId },
      data: {
        status: data.status,
        role: data.role,
      },
    });
    if (typeof data.isVerified === "boolean" && user.profile) {
      await tx.profile.update({
        where: { id: user.profile.id },
        data: { isVerified: data.isVerified },
      });
    }
    await tx.auditLog.create({
      data: {
        actorId,
        action: "user.update",
        entityType: "user",
        entityId: userId,
        metadata: data,
      },
    });
    return u;
  });
  return updated;
}

export async function getSiteSettings() {
  const rows = await prisma.siteSetting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function setSiteSetting(key: string, value: unknown, actorId?: string) {
  const jsonValue = value as Prisma.InputJsonValue;
  const setting = await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: jsonValue },
    update: { value: jsonValue },
  });
  if (actorId) {
    await prisma.auditLog.create({
      data: {
        actorId,
        action: "settings.update",
        entityType: "site_setting",
        entityId: key,
        metadata: { value: jsonValue },
      },
    });
  }
  return setting;
}

export async function listFeatureFlags() {
  return prisma.featureFlag.findMany({ orderBy: { key: "asc" } });
}

export async function setFeatureFlag(key: string, enabled: boolean) {
  return prisma.featureFlag.upsert({
    where: { key },
    create: { key, enabled },
    update: { enabled },
  });
}

export async function adminUpdatePlan(
  planId: string,
  data: {
    price?: number;
    listingLimit?: number;
    name?: string;
    features?: unknown;
    status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
    promotionCredits?: number;
    analyticsEnabled?: boolean;
    profileCustomization?: boolean;
    featuredListingLimit?: number;
  },
) {
  return prisma.plan.update({
    where: { id: planId },
    data: {
      price: data.price,
      listingLimit: data.listingLimit,
      name: data.name,
      features: data.features as never,
      status: data.status,
      promotionCredits: data.promotionCredits,
      analyticsEnabled: data.analyticsEnabled,
      profileCustomization: data.profileCustomization,
      featuredListingLimit: data.featuredListingLimit,
    },
  });
}

export { listPlans };
