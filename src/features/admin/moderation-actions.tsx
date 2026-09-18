"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ModerationActions({ listingId }: { listingId: string }) {
  const router = useRouter();

  async function moderate(moderationAction: string, reason?: string) {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "moderate", listingId, moderationAction, reason }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? "Failed");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" onClick={() => moderate("APPROVE")}>
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          const reason = prompt("Rejection reason");
          if (reason) moderate("REJECT", reason);
        }}
      >
        Reject
      </Button>
      <Button size="sm" variant="danger" onClick={() => moderate("SUSPEND", "Suspended by moderator")}>
        Suspend
      </Button>
    </div>
  );
}
