import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(80).optional(),
  bio: z.string().max(500).optional().nullable(),
  category: z.string().max(80).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal("")),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
  coverUrl: z.string().url().optional().nullable().or(z.literal("")),
  socialLinks: z
    .object({
      instagram: z.string().optional(),
      youtube: z.string().optional(),
      twitter: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
});

export async function getProfileByUsername(username: string) {
  const profile = await prisma.profile.findFirst({
    where: { username: username.toLowerCase(), deletedAt: null },
    include: {
      user: { select: { id: true, status: true } },
      listings: {
        where: { status: "PUBLISHED", deletedAt: null },
        orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
        take: 24,
        include: {
          categories: { include: { category: true } },
          profile: { select: { username: true, displayName: true, avatarUrl: true } },
        },
      },
      _count: { select: { listings: true, followers: true } },
    },
  });
  if (!profile || profile.user.status !== "ACTIVE") {
    throw new AppError("Profile not found", 404, "NOT_FOUND");
  }
  return profile;
}

export async function getProfileForUser(userId: string) {
  return prisma.profile.findUnique({
    where: { userId },
    include: {
      user: { include: { subscription: { include: { plan: true } } } },
    },
  });
}

export async function updateProfile(userId: string, input: z.infer<typeof updateProfileSchema>) {
  const data = updateProfileSchema.parse(input);
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) throw new AppError("Profile not found", 404);

  return prisma.profile.update({
    where: { id: profile.id },
    data: {
      displayName: data.displayName,
      bio: data.bio,
      category: data.category,
      website: data.website || null,
      avatarUrl: data.avatarUrl || null,
      coverUrl: data.coverUrl || null,
      socialLinks: data.socialLinks,
    },
  });
}

export async function followProfile(followerId: string, username: string) {
  const profile = await prisma.profile.findUnique({ where: { username: username.toLowerCase() } });
  if (!profile) throw new AppError("Profile not found", 404);
  if (profile.userId === followerId) throw new AppError("Cannot follow yourself", 400);

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId: profile.id } },
  });
  if (existing) {
    await prisma.$transaction([
      prisma.follow.delete({ where: { id: existing.id } }),
      prisma.profile.update({
        where: { id: profile.id },
        data: { followerCount: { decrement: 1 } },
      }),
    ]);
    return { following: false };
  }

  await prisma.$transaction([
    prisma.follow.create({ data: { followerId, followingId: profile.id } }),
    prisma.profile.update({
      where: { id: profile.id },
      data: { followerCount: { increment: 1 } },
    }),
    prisma.notification.create({
      data: {
        userId: profile.userId,
        type: "NEW_FOLLOWER",
        title: "New follower",
        body: "Someone started following your profile.",
        link: `/profile/${profile.username}`,
      },
    }),
  ]);
  return { following: true };
}

export async function listCreators(page = 1, pageSize = 24) {
  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    prisma.profile.findMany({
      where: { deletedAt: null, user: { status: "ACTIVE" } },
      orderBy: [{ followerCount: "desc" }, { viewCount: "desc" }],
      skip,
      take: pageSize,
      include: {
        _count: { select: { listings: { where: { status: "PUBLISHED" } } } },
      },
    }),
    prisma.profile.count({ where: { deletedAt: null, user: { status: "ACTIVE" } } }),
  ]);
  return { items, total, page, pageSize };
}
