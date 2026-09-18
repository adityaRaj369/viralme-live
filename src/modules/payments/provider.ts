export type CreateOrderInput = {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
};

export type CreateOrderResult = {
  providerOrderId: string;
  amount: number;
  currency: string;
  checkoutPayload: Record<string, unknown>;
  raw: unknown;
};

export type VerifyPaymentInput = {
  providerOrderId: string;
  providerPaymentId: string;
  signature?: string;
  rawPayload?: unknown;
};

export type VerifyPaymentResult = {
  valid: boolean;
  amount?: number;
  currency?: string;
  status: "SUCCEEDED" | "FAILED" | "PENDING";
  providerPaymentId: string;
};

export interface PaymentProvider {
  name: string;
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
  verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;
  verifyWebhookSignature(payload: string | Buffer, signature: string): boolean;
}

export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER ?? "mock";
  if (provider === "razorpay") {
    // Lazy require to avoid hard dependency when using mock
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { razorpayProvider } = require("./razorpay") as typeof import("./razorpay");
    return razorpayProvider;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { mockPaymentProvider } = require("./mock") as typeof import("./mock");
  return mockPaymentProvider;
}
