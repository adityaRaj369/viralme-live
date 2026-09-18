"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function FollowButton({ username }: { username: string }) {
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch("/api/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "follow", username }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setFollowing(Boolean(data.following));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant={following ? "outline" : "primary"} disabled={busy} onClick={toggle}>
      {following ? "Following" : "Follow"}
    </Button>
  );
}
