import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";

export async function getListingLimitForUser(userId: string): Promise<number> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });
  if (!subscription || subscription.status !== "ACTIVE") {
    const free = await prisma.plan.findUnique({ where: { slug: "free" } });
    return free?.listingLimit ?? 50;
  }
  return subscription.plan.listingLimit;
}

export async function getActiveSubscription(userId: string) {
  return prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });
}

export async function listPlans() {
  return prisma.plan.findMany({
    where: { status: "ACTIVE" },
    orderBy: { sortOrder: "asc" },
  });
}

export async function activatePlanForUser(userId: string, planId: string) {
  const plan = await prisma.plan.findFirst({ where: { id: planId, status: "ACTIVE" } });
  if (!plan) throw new AppError("Plan not found", 404);

  const periodEnd =
    plan.billingCycle === "YEARLY"
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : plan.billingCycle === "MONTHLY"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : null;

  const subscription = await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planId: plan.id,
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: periodEnd,
    },
    update: {
      planId: plan.id,
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    },
    include: { plan: true },
  });

  await prisma.notification.create({
    data: {
      userId,
      type: "SYSTEM",
      title: "Plan upgraded",
      body: `You're now on the ${plan.name} plan with ${plan.listingLimit} listings.`,
      link: "/dashboard/billing",
    },
  });

  return subscription;
}
