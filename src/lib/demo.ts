import { DEMO_AUTH } from "@/lib/auth";

export function isDemoUserId(userId: string) {
  return userId.startsWith("demo-");
}

/** Run a DB-backed query; on failure (or demo mode without DB) return fallback. */
export async function safeDb<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export function demoBanner(email?: string | null) {
  if (!DEMO_AUTH) return null;
  return {
    title: "Demo mode",
    body: email
      ? `Signed in as ${email}. Dashboard data is empty until Postgres is connected.`
      : "Dashboard data is empty until Postgres is connected.",
  };
}
