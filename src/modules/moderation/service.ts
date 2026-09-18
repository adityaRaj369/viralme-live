import { ListingStatus, ModerationActionType, ReportReason, ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { notifyUser } from "@/modules/notifications/service";
import { emailService } from "@/modules/notifications/email";
import { z } from "zod";

export const reportSchema = z.object({
  listingId: z.string(),
  reason: z.nativeEnum(ReportReason),
  details: z.string().max(1000).optional(),
});

export async function reportListing(reporterId: string, input: z.infer<typeof reportSchema>) {
  const data = reportSchema.parse(input);
  const listing = await prisma.listing.findFirst({
    where: { id: data.listingId, deletedAt: null },
  });
  if (!listing) throw new AppError("Listing not found", 404);

  return prisma.report.create({
    data: {
      listingId: data.listingId,
      reporterId,
      reason: data.reason,
      details: data.details,
    },
  });
}

export async function moderateListing(input: {
  moderatorId: string;
  listingId: string;
  action: Extract<ModerationActionType, "APPROVE" | "REJECT" | "SUSPEND" | "UNSUSPEND" | "FEATURE" | "UNFEATURE">;
  reason?: string;
}) {
  const listing = await prisma.listing.findUnique({ where: { id: input.listingId } });
  if (!listing) throw new AppError("Listing not found", 404);

  let status: ListingStatus | undefined;
  const data: {
    status?: ListingStatus;
    rejectionReason?: string | null;
    isFeatured?: boolean;
    publishedAt?: Date | null;
  } = {};

  switch (input.action) {
    case "APPROVE":
      status = "PUBLISHED";
      data.status = status;
      data.rejectionReason = null;
      data.publishedAt = listing.publishedAt ?? new Date();
      break;
    case "REJECT":
      if (!input.reason) throw new AppError("Rejection requires a reason", 400);
      status = "REJECTED";
      data.status = status;
      data.rejectionReason = input.reason;
      break;
    case "SUSPEND":
      status = "SUSPENDED";
      data.status = status;
      data.rejectionReason = input.reason ?? "Suspended by moderator";
      break;
    case "UNSUSPEND":
      status = "PUBLISHED";
      data.status = status;
      data.rejectionReason = null;
      break;
    case "FEATURE":
      data.isFeatured = true;
      break;
    case "UNFEATURE":
      data.isFeatured = false;
      break;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.listing.update({
      where: { id: input.listingId },
      data,
    });
    await tx.moderationAction.create({
      data: {
        listingId: input.listingId,
        moderatorId: input.moderatorId,
        action: input.action,
        reason: input.reason,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: input.moderatorId,
        action: `listing.${input.action.toLowerCase()}`,
        entityType: "listing",
        entityId: input.listingId,
        metadata: { reason: input.reason },
      },
    });
    return result;
  });

  if (input.action === "APPROVE") {
    await notifyUser(listing.ownerId, {
      type: "LISTING_APPROVED",
      title: "Listing approved",
      body: `"${listing.title}" is now live.`,
      link: `/listing/${listing.slug}`,
    });
    await emailService.send({
      to: (await prisma.user.findUnique({ where: { id: listing.ownerId } }))!.email,
      template: "listing_approved",
      data: { title: listing.title },
    });
  }
  if (input.action === "REJECT") {
    await notifyUser(listing.ownerId, {
      type: "LISTING_REJECTED",
      title: "Listing rejected",
      body: `"${listing.title}" was not approved. ${input.reason}`,
      link: `/dashboard/listings`,
    });
  }

  return updated;
}

export async function resolveReport(
  moderatorId: string,
  reportId: string,
  status: Extract<ReportStatus, "RESOLVED" | "DISMISSED">,
  suspendListing = false,
) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new AppError("Report not found", 404);

  await prisma.report.update({
    where: { id: reportId },
    data: { status, resolvedAt: new Date() },
  });

  if (suspendListing) {
    await moderateListing({
      moderatorId,
      listingId: report.listingId,
      action: "SUSPEND",
      reason: "Suspended due to report",
    });
  }

  return { ok: true };
}

export async function listPendingModeration(page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "PENDING_REVIEW", deletedAt: null },
      orderBy: { createdAt: "asc" },
      skip,
      take: pageSize,
      include: {
        profile: true,
        categories: { include: { category: true } },
        owner: { select: { email: true, id: true } },
      },
    }),
    prisma.listing.count({ where: { status: "PENDING_REVIEW", deletedAt: null } }),
  ]);
  return { items, total, page, pageSize };
}
