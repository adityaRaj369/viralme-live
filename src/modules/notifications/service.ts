import { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function notifyUser(
  userId: string,
  input: {
    type: NotificationType;
    title: string;
    body: string;
    link?: string;
    metadata?: Prisma.InputJsonValue;
  },
) {
  return prisma.notification.create({
    data: {
      userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
      metadata: input.metadata,
    },
  });
}

export async function listNotifications(userId: string, page = 1, pageSize = 30) {
  const skip = (page - 1) * pageSize;
  const [items, total, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  return { items, total, unread, page, pageSize };
}

export async function markNotificationsRead(userId: string, ids?: string[]) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
      ...(ids?.length ? { id: { in: ids } } : {}),
    },
    data: { isRead: true },
  });
}
