"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export function ProfileEditForm({
  initial,
}: {
  initial: {
    displayName: string;
    bio: string;
    category: string;
    website: string;
    avatarUrl: string;
    coverUrl: string;
  };
}) {
  const [form, setForm] = useState(initial);
  const [msg, setMsg] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_profile", data: form }),
    });
    setMsg(res.ok ? "Saved" : "Failed to save");
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-2xl border border-border bg-card p-6">
      {(
        [
          ["displayName", "Display name"],
          ["category", "Category"],
          ["website", "Website"],
          ["avatarUrl", "Avatar URL"],
          ["coverUrl", "Cover URL"],
        ] as const
      ).map(([key, label]) => (
        <div key={key}>
          <Label>{label}</Label>
          <Input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
        </div>
      ))}
      <div>
        <Label>Bio</Label>
        <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
      </div>
      <Button type="submit">Save profile</Button>
      {msg ? <p className="text-sm text-muted">{msg}</p> : null}
    </form>
  );
}
