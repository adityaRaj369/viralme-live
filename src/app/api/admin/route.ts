import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { requireRole } from "@/lib/rbac";
import { getAdminAnalytics } from "@/modules/analytics/service";
import {
  adminListUsers,
  adminUpdateUser,
  adminUpdatePlan,
  getSiteSettings,
  setSiteSetting,
  listFeatureFlags,
  setFeatureFlag,
} from "@/modules/admin/service";
import { moderateListing, listPendingModeration, resolveReport } from "@/modules/moderation/service";
import {
  createCategory,
  updateCategory,
  listCategories,
  categorySchema,
} from "@/modules/categories/service";
import { listPlans } from "@/modules/subscriptions/service";
import { prisma } from "@/lib/db";
import { ModerationActionType, Role, UserStatus } from "@prisma/client";
import { addToTrending, removeFromTrending } from "@/modules/discovery/curation";

export async function GET(req: NextRequest) {
  try {
    await requireRole("MODERATOR");
    const resource = req.nextUrl.searchParams.get("resource") ?? "overview";

    if (resource === "overview") {
      return NextResponse.json(await getAdminAnalytics());
    }
    if (resource === "users") {
      return NextResponse.json(
        await adminListUsers(
          req.nextUrl.searchParams.get("q") ?? undefined,
          Number(req.nextUrl.searchParams.get("page") ?? 1),
        ),
      );
    }
    if (resource === "moderation") {
      return NextResponse.json(await listPendingModeration());
    }
    if (resource === "reports") {
      const reports = await prisma.report.findMany({
        where: { status: { in: ["OPEN", "REVIEWING"] } },
        include: { listing: true, reporter: { select: { email: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return NextResponse.json({ reports });
    }
    if (resource === "categories") {
      return NextResponse.json({ categories: await listCategories(true) });
    }
    if (resource === "plans") {
      return NextResponse.json({ plans: await listPlans() });
    }
    if (resource === "payments") {
      const payments = await prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: { select: { email: true } }, order: true },
      });
      return NextResponse.json({ payments });
    }
    if (resource === "promotions") {
      const promotions = await prisma.promotion.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { listing: { select: { title: true, slug: true } } },
      });
      return NextResponse.json({ promotions });
    }
    if (resource === "settings") {
      return NextResponse.json({
        settings: await getSiteSettings(),
        flags: await listFeatureFlags(),
      });
    }
    if (resource === "audit") {
      const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { actor: { select: { email: true } } },
      });
      return NextResponse.json({ logs });
    }
    if (resource === "listings") {
      const status = req.nextUrl.searchParams.get("status");
      const listings = await prisma.listing.findMany({
        where: status ? { status: status as never } : undefined,
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { profile: true, owner: { select: { email: true } } },
      });
      return NextResponse.json({ listings });
    }
    if (resource === "profiles") {
      const profiles = await prisma.profile.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: { select: { email: true, status: true } } },
      });
      return NextResponse.json({ profiles });
    }

    return NextResponse.json({ error: "Unknown resource" }, { status: 400 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole("MODERATOR");
    const body = await req.json();
    const action = body.action as string;

    if (action === "moderate") {
      await requireRole("MODERATOR");
      const result = await moderateListing({
        moderatorId: session.user.id,
        listingId: body.listingId,
        action: body.moderationAction as Extract<
          ModerationActionType,
          "APPROVE" | "REJECT" | "SUSPEND" | "UNSUSPEND" | "FEATURE" | "UNFEATURE"
        >,
        reason: body.reason,
      });
      return NextResponse.json({ listing: result });
    }

    if (action === "resolve_report") {
      return NextResponse.json(
        await resolveReport(session.user.id, body.reportId, body.status, body.suspendListing),
      );
    }

    if (action === "update_user") {
      await requireRole("ADMIN");
      return NextResponse.json(
        await adminUpdateUser(session.user.id, body.userId, {
          status: body.status as UserStatus | undefined,
          role: body.role as Role | undefined,
          isVerified: body.isVerified,
        }),
      );
    }

    if (action === "create_category") {
      await requireRole("ADMIN");
      return NextResponse.json({ category: await createCategory(categorySchema.parse(body.data)) });
    }

    if (action === "update_category") {
      await requireRole("ADMIN");
      return NextResponse.json({
        category: await updateCategory(body.id, categorySchema.partial().parse(body.data)),
      });
    }

    if (action === "update_plan") {
      await requireRole("ADMIN");
      return NextResponse.json({ plan: await adminUpdatePlan(body.planId, body.data) });
    }

    if (action === "update_promo_product") {
      await requireRole("ADMIN");
      const product = await prisma.promotionProduct.update({
        where: { id: body.id },
        data: {
          price: body.price,
          durationHours: body.durationHours,
          slotLimit: body.slotLimit,
          isActive: body.isActive,
        },
      });
      return NextResponse.json({ product });
    }

    if (action === "add_trending") {
      await requireRole("MODERATOR");
      const placement = await addToTrending(session.user.id, {
        listingId: body.listingId,
        position: Number(body.position),
        startAt: body.startAt,
        endAt: body.endAt,
      });
      return NextResponse.json({ placement });
    }

    if (action === "remove_trending") {
      await requireRole("MODERATOR");
      return NextResponse.json(await removeFromTrending(session.user.id, body.id));
    }

    if (action === "set_setting") {
      await requireRole("ADMIN");
      return NextResponse.json({
        setting: await setSiteSetting(body.key, body.value, session.user.id),
      });
    }

    if (action === "set_flag") {
      await requireRole("ADMIN");
      return NextResponse.json({ flag: await setFeatureFlag(body.key, Boolean(body.enabled)) });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return handleApiError(error);
  }
}
