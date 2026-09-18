import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { slugify } from "@/lib/utils";
import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(300).optional(),
  icon: z.string().max(40).optional(),
  image: z.string().url().optional().or(z.literal("")),
  parentCategoryId: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
});

export async function listCategories(includeDisabled = false) {
  return prisma.category.findMany({
    where: includeDisabled ? undefined : { status: "ACTIVE" },
    orderBy: { sortOrder: "asc" },
    include: { children: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { children: true, parent: true },
  });
  if (!category || category.status === "DISABLED") {
    throw new AppError("Category not found", 404);
  }
  return category;
}

export async function createCategory(input: z.infer<typeof categorySchema>) {
  const data = categorySchema.parse(input);
  const slug = slugify(data.name);
  const exists = await prisma.category.findUnique({ where: { slug } });
  if (exists) throw new AppError("Category slug already exists", 409);

  return prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      icon: data.icon,
      image: data.image || null,
      parentCategoryId: data.parentCategoryId,
      sortOrder: data.sortOrder ?? 0,
      status: data.status ?? "ACTIVE",
    },
  });
}

export async function updateCategory(id: string, input: Partial<z.infer<typeof categorySchema>>) {
  const data = categorySchema.partial().parse(input);
  return prisma.category.update({
    where: { id },
    data: {
      ...data,
      image: data.image === "" ? null : data.image,
    },
  });
}

export async function searchAll(q: string, page = 1, pageSize = 20) {
  const query = q.trim();
  if (!query) return { listings: [], profiles: [], categories: [], total: 0 };

  const skip = (page - 1) * pageSize;

  const [listings, profiles, categories] = await Promise.all([
    prisma.listing.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { tags: { has: query.toLowerCase() } },
        ],
      },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
      skip,
      take: pageSize,
      include: {
        profile: { select: { username: true, displayName: true, avatarUrl: true } },
        categories: { include: { category: true } },
        promotions: {
          where: { status: "ACTIVE", endAt: { gt: new Date() } },
          take: 1,
          select: { type: true, slotPosition: true },
        },
      },
    }),
    prisma.profile.findMany({
      where: {
        deletedAt: null,
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { displayName: { contains: query, mode: "insensitive" } },
          { bio: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 8,
    }),
    prisma.category.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 8,
    }),
  ]);

  return {
    listings,
    profiles,
    categories,
    total: listings.length + profiles.length + categories.length,
    page,
    pageSize,
  };
}
