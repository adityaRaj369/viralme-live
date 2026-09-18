import { createHmac } from "crypto";
import type { CreateOrderInput, CreateOrderResult, PaymentProvider, VerifyPaymentInput, VerifyPaymentResult } from "./provider";

/**
 * Razorpay adapter skeleton.
 * Requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in production.
 */
export const razorpayProvider: PaymentProvider = {
  name: "razorpay",

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const amountPaise = Math.round(input.amount * 100);

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: input.currency,
        receipt: input.receipt,
        notes: input.notes,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Razorpay order failed: ${text}`);
    }

    const data = (await res.json()) as { id: string; amount: number; currency: string };
    return {
      providerOrderId: data.id,
      amount: input.amount,
      currency: input.currency,
      checkoutPayload: {
        provider: "razorpay",
        keyId,
        orderId: data.id,
        amount: amountPaise,
        currency: data.currency,
      },
      raw: data,
    };
  },

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret || !input.signature) {
      return { valid: false, status: "FAILED", providerPaymentId: input.providerPaymentId };
    }
    const body = `${input.providerOrderId}|${input.providerPaymentId}`;
    const expected = createHmac("sha256", secret).update(body).digest("hex");
    const valid = expected === input.signature;
    return {
      valid,
      status: valid ? "SUCCEEDED" : "FAILED",
      providerPaymentId: input.providerPaymentId,
    };
  },

  verifyWebhookSignature(payload: string | Buffer, signature: string): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return false;
    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    return expected === signature;
  },
};
