import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { listCategories, searchAll } from "@/modules/categories/service";
import { followProfile, updateProfile, updateProfileSchema } from "@/modules/profiles/service";
import { requireSession } from "@/lib/rbac";
import { listPlans } from "@/modules/subscriptions/service";
import { listNotifications, markNotificationsRead } from "@/modules/notifications/service";
import { reportListing, reportSchema } from "@/modules/moderation/service";
import { trackEvent } from "@/modules/analytics/service";
import { z } from "zod";

export async function GET(req: NextRequest) {
  // Combined lightweight public endpoints via ?resource=
  try {
    const resource = req.nextUrl.searchParams.get("resource");
    if (resource === "categories") {
      return NextResponse.json({ categories: await listCategories() });
    }
    if (resource === "plans") {
      return NextResponse.json({ plans: await listPlans() });
    }
    if (resource === "search") {
      const q = req.nextUrl.searchParams.get("q") ?? "";
      return NextResponse.json(await searchAll(q));
    }
    return NextResponse.json({ error: "Unknown resource" }, { status: 400 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const action = body.action as string;

    if (action === "follow") {
      const username = z.string().parse(body.username);
      return NextResponse.json(await followProfile(session.user.id, username));
    }
    if (action === "update_profile") {
      const data = updateProfileSchema.parse(body.data);
      return NextResponse.json({ profile: await updateProfile(session.user.id, data) });
    }
    if (action === "notifications") {
      return NextResponse.json(await listNotifications(session.user.id));
    }
    if (action === "mark_read") {
      await markNotificationsRead(session.user.id, body.ids);
      return NextResponse.json({ ok: true });
    }
    if (action === "report") {
      const data = reportSchema.parse(body);
      return NextResponse.json({ report: await reportListing(session.user.id, data) });
    }
    if (action === "track") {
      trackEvent({
        type: body.type,
        userId: session.user.id,
        listingId: body.listingId,
        profileId: body.profileId,
      });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return handleApiError(error);
  }
}
