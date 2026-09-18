import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOwnerAnalytics } from "@/lib/geo-analytics";
import { demoGetListings, useDemoStore } from "@/lib/demo-store";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let listingIds: string[] = [];
    const slugById = new Map<string, string>();

    if (useDemoStore()) {
      const board = demoGetListings({ board: "alltime", page: 1, pageSize: 200 });
      const mine = board.items.filter(
        (i) => i.ownerId === session.user.id || i.ownerId === "demo-guest-id",
      );
      // Only listings the user actually claimed in this session (ownerId match)
      const owned = board.items.filter((i) => i.ownerId === session.user.id);
      listingIds = owned.map((i) => i.id);
      owned.forEach((i) => slugById.set(i.id, i.slug));
      void mine;
    }

    try {
      const dbListings = await prisma.listing.findMany({
        where: { ownerId: session.user.id, deletedAt: null },
        select: { id: true, slug: true, title: true },
      });
      if (dbListings.length) {
        listingIds = dbListings.map((l) => l.id);
        dbListings.forEach((l) => slugById.set(l.id, l.slug));
      }
    } catch {
      // keep demo ids
    }

    const analytics = getOwnerAnalytics(listingIds);
    const byListing = analytics.byListing.map((row) => ({
      ...row,
      slug: slugById.get(row.listingId) ?? row.slug,
    }));

    return NextResponse.json({
      ...analytics,
      byListing,
      listingIds,
      note:
        analytics.totals.events === 0
          ? "No tracked clicks yet. Share your listing — Visit links record country automatically."
          : null,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
