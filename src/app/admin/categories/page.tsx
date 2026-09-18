"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type Cat = {
  id: string;
  name: string;
  shortName?: string;
  slug: string;
  description: string;
  status: string;
  sortOrder: number;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Cat[]>([]);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/demo-categories");
    const data = await res.json();
    setCategories(data.categories ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/demo-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, shortName: shortName || undefined, description }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Failed");
      return;
    }
    setName("");
    setShortName("");
    setDescription("");
    await load();
  }

  async function toggle(id: string, status: string) {
    await fetch("/api/admin/demo-categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status: status === "ACTIVE" ? "DISABLED" : "ACTIVE",
      }),
    });
    await load();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Categories & select options</h1>
      <p className="mt-2 text-sm text-muted">
        Same catalog as outbid: full board title + short chip label. Disable hides from the public
        site.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form onSubmit={createCategory} className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Create category</h2>
          <div>
            <Label>Full name (categories page)</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="AI Agents & Infrastructure"
            />
          </div>
          <div>
            <Label>Short name (home chip)</Label>
            <Input
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="Agents"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button disabled={loading}>{loading ? "Creating…" : "Create"}</Button>
        </form>

        <div className="space-y-2">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate font-semibold">{c.name}</div>
                <div className="text-xs text-muted">
                  chip: {c.shortName || c.name} · /{c.slug} · {c.status}
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void toggle(c.id, c.status)}
              >
                {c.status === "ACTIVE" ? "Disable" : "Enable"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
