import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { auth, DEMO_AUTH } from "@/lib/auth";
import {
  claimRankSchema,
  createRankClaimOrder,
  getLeaderboard,
} from "@/modules/leaderboard/service";
import { listCategories } from "@/modules/categories/service";
import { DEMO_CATEGORIES, DEMO_GUEST_USER_ID, useDemoStore } from "@/lib/demo-store";
import { safeDb } from "@/lib/demo";

export async function GET(req: NextRequest) {
  try {
    const board = (req.nextUrl.searchParams.get("board") as "alltime" | "today") || "alltime";
    const category = req.nextUrl.searchParams.get("category") ?? undefined;
    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const categories = useDemoStore()
      ? DEMO_CATEGORIES.filter((c) => c.slug !== "all")
      : await safeDb(
          () => listCategories(),
          DEMO_CATEGORIES.filter((c) => c.slug !== "all") as never,
        );
    const leaderboard = await getLeaderboard({ board, categorySlug: category, page });
    return NextResponse.json({ leaderboard, categories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = claimRankSchema.parse(await req.json());

    // Demo: claim works without login
    const userId = session?.user?.id ?? (DEMO_AUTH ? DEMO_GUEST_USER_ID : "");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await createRankClaimOrder(userId, body, {
      name: session?.user?.name ?? "Guest",
      email: session?.user?.email ?? "guest@makemeviral.app",
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
