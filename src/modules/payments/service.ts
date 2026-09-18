import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { getPaymentProvider } from "./provider";
import { activatePromotionFromPayment } from "@/modules/promotions/service";
import { activatePlanForUser } from "@/modules/subscriptions/service";
import { fulfillRankClaim } from "@/modules/leaderboard/service";
import { notifyUser } from "@/modules/notifications/service";
import type { Prisma } from "@prisma/client";

export async function createSubscriptionOrder(userId: string, planId: string) {
  const plan = await prisma.plan.findFirst({ where: { id: planId, status: "ACTIVE" } });
  if (!plan) throw new AppError("Plan not found", 404);
  if (Number(plan.price) <= 0) {
    return activatePlanForUser(userId, planId);
  }

  const order = await prisma.order.create({
    data: {
      userId,
      type: "SUBSCRIPTION",
      status: "AWAITING_PAYMENT",
      amount: plan.price,
      currency: plan.currency,
      description: `Upgrade to ${plan.name}`,
      metadata: { planId: plan.id },
    },
  });

  const provider = getPaymentProvider();
  const intent = await provider.createOrder({
    amount: Number(plan.price),
    currency: plan.currency,
    receipt: order.id,
    notes: { orderId: order.id, userId, planId: plan.id },
  });

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      userId,
      provider: provider.name,
      providerOrderId: intent.providerOrderId,
      amount: plan.price,
      currency: plan.currency,
      status: "PENDING",
      rawPayload: intent.raw as Prisma.InputJsonValue,
    },
  });

  return { order, payment, checkout: intent };
}

/**
 * Server-side payment verification. Never activate from client-only success.
 */
export async function verifyAndFulfillPayment(input: {
  providerOrderId: string;
  providerPaymentId: string;
  signature?: string;
}) {
  const payment = await prisma.payment.findFirst({
    where: { providerOrderId: input.providerOrderId },
    include: { order: true },
  });
  if (!payment) throw new AppError("Payment not found", 404);
  if (payment.status === "SUCCEEDED") return { alreadyProcessed: true, orderId: payment.orderId };

  const provider = getPaymentProvider();
  const result = await provider.verifyPayment({
    providerOrderId: input.providerOrderId,
    providerPaymentId: input.providerPaymentId,
    signature: input.signature,
  });

  if (!result.valid || result.status !== "SUCCEEDED") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", rawPayload: result as unknown as Prisma.InputJsonValue },
    });
    await prisma.order.update({ where: { id: payment.orderId }, data: { status: "FAILED" } });
    await notifyUser(payment.userId, {
      type: "PAYMENT_FAILED",
      title: "Payment failed",
      body: "Your payment could not be completed.",
      link: "/dashboard/billing",
    });
    throw new AppError("Payment verification failed", 400, "PAYMENT_INVALID");
  }

  // Verify amount matches
  if (result.amount !== undefined && Math.abs(result.amount - Number(payment.amount)) > 0.01) {
    throw new AppError("Payment amount mismatch", 400, "AMOUNT_MISMATCH");
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "SUCCEEDED",
      providerPaymentId: result.providerPaymentId,
      verifiedAt: new Date(),
    },
  });

  await notifyUser(payment.userId, {
    type: "PAYMENT_SUCCESSFUL",
    title: "Payment successful",
    body: "Your payment was verified successfully.",
    link: "/dashboard/billing",
  });

  if (payment.order.type === "PROMOTION") {
    await activatePromotionFromPayment(payment.orderId);
  } else if (payment.order.type === "RANK_CLAIM") {
    await fulfillRankClaim(payment.orderId);
  } else if (payment.order.type === "SUBSCRIPTION") {
    const meta = payment.order.metadata as { planId?: string };
    if (!meta?.planId) throw new AppError("Missing planId", 400);
    await activatePlanForUser(payment.userId, meta.planId);
    await prisma.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } });
    await prisma.transaction.create({
      data: {
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        type: "SUBSCRIPTION_PURCHASE",
        description: "Plan upgrade",
      },
    });
  }

  return { success: true, orderId: payment.orderId };
}
