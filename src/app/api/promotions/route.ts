import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { createPromotionOrder, listPromotionProducts, expirePromotions } from "@/modules/promotions/service";
import { requireSession } from "@/lib/rbac";
import { PromotionType } from "@prisma/client";
import { z } from "zod";

export async function GET() {
  try {
    await expirePromotions();
    const products = await listPromotionProducts();
    return NextResponse.json({ products });
  } catch (error) {
    return handleApiError(error);
  }
}

const schema = z.object({
  listingId: z.string(),
  type: z.nativeEnum(PromotionType),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = schema.parse(await req.json());
    const result = await createPromotionOrder(session.user.id, body.listingId, body.type);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
