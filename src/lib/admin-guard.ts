import { auth, DEMO_AUTH } from "@/lib/auth";
import { hasMinRole } from "@/lib/roles";
import type { Role } from "@prisma/client";

/**
 * Strict admin gate for mutating CMS / category / settings APIs.
 * Never trusts query params or client-supplied role.
 */
export async function requireAdminSession(minRole: Role = "ADMIN") {
  const session = await auth();
  if (!session?.user) {
    return { ok: false as const, status: 401 as const, error: "Unauthorized" };
  }
  if (session.user.status && session.user.status !== "ACTIVE") {
    return { ok: false as const, status: 403 as const, error: "Account not active" };
  }
  const roleOk = hasMinRole(session.user.role, minRole);
  const demoAdmin =
    DEMO_AUTH &&
    session.user.email === "admin@viralme.live" &&
    (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN");
  if (!roleOk && !demoAdmin) {
    return { ok: false as const, status: 403 as const, error: "Forbidden" };
  }
  return { ok: true as const, session };
}
