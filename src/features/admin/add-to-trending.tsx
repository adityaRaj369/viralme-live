"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function AddToTrendingForm() {
  const router = useRouter();
  const [listingId, setListingId] = useState("");
  const [position, setPosition] = useState(1);
  const [hours, setHours] = useState(72);
  const [msg, setMsg] = useState("");

  return (
    <form
      className="space-y-3 rounded-2xl border border-border bg-card p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const startAt = new Date();
        const endAt = new Date(Date.now() + hours * 60 * 60 * 1000);
        const res = await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add_trending",
            listingId,
            position,
            startAt: startAt.toISOString(),
            endAt: endAt.toISOString(),
          }),
        });
        const data = await res.json();
        setMsg(res.ok ? "Added to Trending" : data.error ?? "Failed");
        if (res.ok) {
          setListingId("");
          router.refresh();
        }
      }}
    >
      <h3 className="font-semibold">Add to Trending</h3>
      <p className="text-xs text-muted">Manual curation — independent of engagement.</p>
      <div>
        <Label>Listing ID</Label>
        <Input value={listingId} onChange={(e) => setListingId(e.target.value)} required />
      </div>
      <div>
        <Label>Position</Label>
        <Input
          type="number"
          min={1}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
        />
      </div>
      <div>
        <Label>Duration (hours)</Label>
        <Input type="number" min={1} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
      </div>
      <Button type="submit" size="sm">
        Add to Trending
      </Button>
      {msg ? <p className="text-sm text-muted">{msg}</p> : null}
    </form>
  );
}
