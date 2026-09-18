"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function EngageButtons({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function act(action: "like" | "save") {
    setBusy(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/engage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (action === "like") setLiked(Boolean(data.liked));
      if (action === "save") setSaved(Boolean(data.saved));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant={liked ? "primary" : "outline"} disabled={busy} onClick={() => act("like")}>
        {liked ? "Liked" : "Like"}
      </Button>
      <Button variant={saved ? "secondary" : "outline"} disabled={busy} onClick={() => act("save")}>
        {saved ? "Saved" : "Save"}
      </Button>
    </>
  );
}
