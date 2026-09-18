import { createHmac, randomUUID } from "crypto";
import type { CreateOrderInput, CreateOrderResult, PaymentProvider, VerifyPaymentInput, VerifyPaymentResult } from "./provider";

/**
 * Development payment provider.
 * Simulates order creation. Activation still requires server-side webhook/verify —
 * never trust client-only success flags.
 */
const store = new Map<string, { amount: number; currency: string; paid: boolean }>();

export const mockPaymentProvider: PaymentProvider = {
  name: "mock",

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const providerOrderId = `mock_order_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    store.set(providerOrderId, { amount: input.amount, currency: input.currency, paid: false });
    return {
      providerOrderId,
      amount: input.amount,
      currency: input.currency,
      checkoutPayload: {
        provider: "mock",
        orderId: providerOrderId,
        amount: input.amount,
        currency: input.currency,
        // Dev-only checkout token — must still hit verify endpoint
        mockCheckoutUrl: `/api/payments/mock-complete?orderId=${providerOrderId}`,
      },
      raw: { notes: input.notes },
    };
  },

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    const order = store.get(input.providerOrderId);
    if (!order) {
      return { valid: false, status: "FAILED", providerPaymentId: input.providerPaymentId };
    }
    order.paid = true;
    return {
      valid: true,
      amount: order.amount,
      currency: order.currency,
      status: "SUCCEEDED",
      providerPaymentId: input.providerPaymentId || `mock_pay_${Date.now()}`,
    };
  },

  verifyWebhookSignature(payload: string | Buffer, signature: string): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "mock_webhook_secret";
    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    return expected === signature || signature === "mock_valid_signature";
  },
};
