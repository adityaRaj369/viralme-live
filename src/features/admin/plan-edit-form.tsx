"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function PlanEditForm({
  planId,
  initial,
}: {
  planId: string;
  initial: { price: number; listingLimit: number; name: string };
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);

  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_plan", planId, data: form }),
        });
        router.refresh();
      }}
    >
      <div>
        <Label>Name</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <Label>Price</Label>
        <Input
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        />
      </div>
      <div>
        <Label>Listing limit</Label>
        <Input
          type="number"
          value={form.listingLimit}
          onChange={(e) => setForm({ ...form, listingLimit: Number(e.target.value) })}
        />
      </div>
      <Button size="sm" type="submit">
        Save
      </Button>
    </form>
  );
}
