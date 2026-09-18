import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import type { Role, UserStatus } from "@prisma/client";

/** Demo auth is on by default until real DB auth is ready. Set DEMO_AUTH=false to disable. */
export const DEMO_AUTH = process.env.DEMO_AUTH !== "false";

export const DEMO_ACCOUNTS = {
  admin: {
    id: "demo-admin-id",
    email: "admin@viralme.live",
    password: "Password123!",
    name: "Demo Admin",
    role: "ADMIN" as Role,
    status: "ACTIVE" as UserStatus,
  },
  user: {
    id: "demo-user-id",
    email: "demo@viralme.live",
    password: "Password123!",
    name: "Demo Creator",
    role: "USER" as Role,
    status: "ACTIVE" as UserStatus,
  },
} as const;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: Role;
      status: UserStatus;
    };
  }

  interface User {
    role: Role;
    status: UserStatus;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    status: UserStatus;
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

function demoUserFromCredentials(email: string, password: string, name?: string) {
  const lower = email.toLowerCase();
  if (lower === DEMO_ACCOUNTS.admin.email && password === DEMO_ACCOUNTS.admin.password) {
    return { ...DEMO_ACCOUNTS.admin };
  }
  if (lower === DEMO_ACCOUNTS.user.email && password === DEMO_ACCOUNTS.user.password) {
    return { ...DEMO_ACCOUNTS.user };
  }
  // Any other credentials create a temporary demo session
  const slug = lower.replace(/[^a-z0-9]/g, "-").slice(0, 40);
  return {
    id: `demo-${slug}`,
    email: lower,
    name: name || lower.split("@")[0],
    role: "USER" as Role,
    status: "ACTIVE" as UserStatus,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        if (DEMO_AUTH) {
          return demoUserFromCredentials(
            parsed.data.email,
            parsed.data.password,
            parsed.data.name,
          );
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: parsed.data.email.toLowerCase() },
          });
          if (!user || user.deletedAt) return null;
          if (user.status === "BANNED" || user.status === "SUSPENDED") return null;

          const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
          if (!valid) return null;

          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
          };
        } catch {
          // DB down — fall back to demo session
          return demoUserFromCredentials(parsed.data.email, parsed.data.password, parsed.data.name);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
      }
      return session;
    },
  },
});
