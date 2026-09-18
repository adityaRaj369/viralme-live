import { auth } from "@/lib/auth";
import { hasMinRole } from "@/lib/roles";
import type { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export { hasMinRole };

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    throw new AuthError("Unauthorized", 401);
  }
  if (session.user.status !== "ACTIVE") {
    throw new AuthError("Account not active", 403);
  }
  return session;
}

export async function requireRole(minRole: Role) {
  const session = await requireSession();
  if (!hasMinRole(session.user.role, minRole)) {
    throw new AuthError("Forbidden", 403);
  }
  return session;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
    this.name = "AuthError";
  }
}

export function jsonError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof Error && error.name === "ZodError") {
    return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
  }
  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export function apiOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}
