"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function CategoryAdminForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <form
      className="space-y-3 rounded-2xl border border-border bg-card p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create_category", data: { name, description } }),
        });
        setName("");
        setDescription("");
        router.refresh();
      }}
    >
      <h2 className="font-semibold">Create category</h2>
      <div>
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label>Description</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <Button type="submit">Create</Button>
    </form>
  );
}
