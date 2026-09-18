import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { createSubscriptionOrder, verifyAndFulfillPayment } from "@/modules/payments/service";
import { requireSession } from "@/lib/rbac";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = z
      .object({
        planId: z.string().optional(),
        action: z.enum(["create_subscription", "verify"]).default("create_subscription"),
        providerOrderId: z.string().optional(),
        providerPaymentId: z.string().optional(),
        signature: z.string().optional(),
      })
      .parse(await req.json());

    if (body.action === "verify") {
      if (!body.providerOrderId || !body.providerPaymentId) {
        return NextResponse.json({ error: "Missing payment identifiers" }, { status: 400 });
      }
      const result = await verifyAndFulfillPayment({
        providerOrderId: body.providerOrderId,
        providerPaymentId: body.providerPaymentId,
        signature: body.signature,
      });
      return NextResponse.json(result);
    }

    if (!body.planId) return NextResponse.json({ error: "planId required" }, { status: 400 });
    const result = await createSubscriptionOrder(session.user.id, body.planId);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
