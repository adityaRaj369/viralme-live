import { NextRequest, NextResponse } from "next/server";
import { discoverListings, createListing, createListingSchema } from "@/modules/listings/service";
import { ContentType } from "@prisma/client";
import { handleApiError } from "@/lib/errors";
import { requireSession } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const contentType = searchParams.get("type") as ContentType | null;
    const result = await discoverListings({
      contentType: contentType ?? undefined,
      categorySlug: searchParams.get("category") ?? undefined,
      filter: (searchParams.get("filter") as never) ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      q: searchParams.get("q") ?? undefined,
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 24),
    });
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const data = createListingSchema.parse(body);
    const listing = await createListing(session.user.id, data);
    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
