import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { getPaymentProvider } from "@/modules/payments/provider";
import { verifyAndFulfillPayment } from "@/modules/payments/service";

/**
 * Payment provider webhook. Signature must be verified before fulfillment.
 */
export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    const signature =
      req.headers.get("x-razorpay-signature") ??
      req.headers.get("x-webhook-signature") ??
      "";

    const provider = getPaymentProvider();
    if (!provider.verifyWebhookSignature(raw, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(raw) as {
      event?: string;
      payload?: {
        payment?: {
          entity?: {
            id?: string;
            order_id?: string;
          };
        };
      };
      providerOrderId?: string;
      providerPaymentId?: string;
    };

    const providerOrderId =
      payload.providerOrderId ?? payload.payload?.payment?.entity?.order_id;
    const providerPaymentId =
      payload.providerPaymentId ?? payload.payload?.payment?.entity?.id;

    if (!providerOrderId || !providerPaymentId) {
      return NextResponse.json({ error: "Missing identifiers" }, { status: 400 });
    }

    const result = await verifyAndFulfillPayment({
      providerOrderId,
      providerPaymentId,
      signature: "webhook_verified",
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
