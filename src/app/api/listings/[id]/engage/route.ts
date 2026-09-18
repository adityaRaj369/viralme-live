import { NextRequest, NextResponse } from "next/server";
import { toggleLike, toggleSave } from "@/modules/listings/service";
import { handleApiError } from "@/lib/errors";
import { requireSession } from "@/lib/rbac";
import { trackEvent } from "@/modules/analytics/service";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await ctx.params;
    const { action } = await req.json();

    if (action === "like") {
      const result = await toggleLike(session.user.id, id);
      trackEvent({ type: result.liked ? "LIKE" : "UNLIKE", userId: session.user.id, listingId: id });
      return NextResponse.json(result);
    }
    if (action === "save") {
      const result = await toggleSave(session.user.id, id);
      trackEvent({ type: result.saved ? "SAVE" : "UNSAVE", userId: session.user.id, listingId: id });
      return NextResponse.json(result);
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return handleApiError(error);
  }
}
