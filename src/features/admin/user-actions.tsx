"use client";

import { useRouter } from "next/navigation";

export function AdminUserActions({ userId }: { userId: string }) {
  const router = useRouter();

  async function act(data: Record<string, unknown>) {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_user", userId, ...data }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <button type="button" onClick={() => act({ status: "SUSPENDED" })} className="text-warning">
        Suspend
      </button>
      <button type="button" onClick={() => act({ status: "ACTIVE" })} className="text-success">
        Unsuspend
      </button>
      <button type="button" onClick={() => act({ status: "BANNED" })} className="text-danger">
        Ban
      </button>
      <button type="button" onClick={() => act({ isVerified: true })} className="text-accent">
        Verify
      </button>
      <button type="button" onClick={() => act({ role: "MODERATOR" })} className="text-muted">
        Make Mod
      </button>
    </div>
  );
}
