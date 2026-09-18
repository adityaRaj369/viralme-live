import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { slugify } from "@/lib/utils";
import { z } from "zod";
import { emailService } from "@/modules/notifications/email";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(80),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/i, "Username can only contain letters, numbers, and underscores"),
});

export async function registerUser(input: z.infer<typeof registerSchema>) {
  const data = registerSchema.parse(input);
  const email = data.email.toLowerCase();
  const username = data.username.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("Email already registered", 409, "EMAIL_TAKEN");

  const usernameTaken = await prisma.profile.findUnique({ where: { username } });
  if (usernameTaken) throw new AppError("Username taken", 409, "USERNAME_TAKEN");

  const freePlan = await prisma.plan.findUnique({ where: { slug: "free" } });
  if (!freePlan) throw new AppError("Free plan not configured", 500);

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        passwordHash,
        name: data.name,
        profile: {
          create: {
            username,
            displayName: data.name,
          },
        },
        subscription: {
          create: {
            planId: freePlan.id,
            status: "ACTIVE",
          },
        },
      },
      include: { profile: true },
    });
    return created;
  });

  await emailService.send({
    to: email,
    template: "welcome",
    data: { name: data.name },
  });

  return { id: user.id, email: user.email, profile: user.profile };
}

export function suggestUsername(name: string) {
  return slugify(name).replace(/-/g, "_").slice(0, 24) || "creator";
}
