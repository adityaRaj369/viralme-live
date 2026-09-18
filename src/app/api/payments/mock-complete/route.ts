import { NextRequest, NextResponse } from "next/server";
import { handleApiError, AppError } from "@/lib/errors";
import { verifyAndFulfillPayment } from "@/modules/payments/service";
import { prisma } from "@/lib/db";
import { auth, DEMO_AUTH } from "@/lib/auth";
import { demoFulfillByProviderOrderId, useDemoStore } from "@/lib/demo-store";

export async function POST(req: NextRequest) {
  try {
    if ((process.env.PAYMENT_PROVIDER ?? "mock") !== "mock") {
      throw new AppError("Mock payments disabled", 403);
    }
    const session = await auth();
    const { providerOrderId } = await req.json();
    if (!providerOrderId) throw new AppError("providerOrderId required", 400);

    if (useDemoStore() || DEMO_AUTH || String(providerOrderId).startsWith("mock_demo-order")) {
      const demo = demoFulfillByProviderOrderId(providerOrderId, session?.user?.id);
      if (demo) return NextResponse.json(demo);
    }

    if (!session?.user) throw new AppError("Unauthorized", 401);

    try {
      const payment = await prisma.payment.findFirst({
        where: { providerOrderId, userId: session.user.id },
      });
      if (!payment) throw new AppError("Payment not found", 404);

      const result = await verifyAndFulfillPayment({
        providerOrderId,
        providerPaymentId: `mock_pay_${Date.now()}`,
        signature: "mock_valid_signature",
      });
      return NextResponse.json(result);
    } catch (e) {
      const demo = demoFulfillByProviderOrderId(providerOrderId, session.user.id);
      if (demo) return NextResponse.json(demo);
      throw e;
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  const providerOrderId = req.nextUrl.searchParams.get("orderId");
  if (!providerOrderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }
  return NextResponse.redirect(
    new URL(`/dashboard/billing?mockOrder=${providerOrderId}`, req.nextUrl.origin),
  );
}
