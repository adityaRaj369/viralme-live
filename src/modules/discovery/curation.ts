import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { z } from "zod";

export const trendingPlacementSchema = z.object({
  listingId: z.string(),
  position: z.number().int().min(1).max(100),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
});

export async function listTrendingPlacements() {
  return prisma.trendingPlacement.findMany({
    where: { isActive: true, endAt: { gt: new Date() } },
    orderBy: { position: "asc" },
  });
}

export async function addToTrending(
  actorId: string,
  input: z.infer<typeof trendingPlacementSchema>,
) {
  const data = trendingPlacementSchema.parse(input);
  if (data.endAt <= data.startAt) throw new AppError("endAt must be after startAt", 400);

  const listing = await prisma.listing.findFirst({
    where: { id: data.listingId, status: "PUBLISHED", deletedAt: null },
  });
  if (!listing) throw new AppError("Published listing required", 404);

  const placement = await prisma.trendingPlacement.create({
    data: {
      listingId: data.listingId,
      position: data.position,
      startAt: data.startAt,
      endAt: data.endAt,
      isActive: true,
      createdBy: actorId,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "trending.add",
      entityType: "trending_placement",
      entityId: placement.id,
      metadata: { listingId: data.listingId, position: data.position },
    },
  });

  return placement;
}

export async function removeFromTrending(actorId: string, id: string) {
  const placement = await prisma.trendingPlacement.update({
    where: { id },
    data: { isActive: false },
  });
  await prisma.auditLog.create({
    data: {
      actorId,
      action: "trending.remove",
      entityType: "trending_placement",
      entityId: id,
    },
  });
  return placement;
}
