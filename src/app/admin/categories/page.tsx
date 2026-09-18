"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type Cat = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  sortOrder: number;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Cat[]>([]);
  const [name, setName] = useState("");
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
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Failed");
      return;
    }
    setName("");
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
        Add, disable, and reorder the category options users see on the leaderboard and claim flows.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form onSubmit={createCategory} className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Create category</h2>
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Fintech" />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paid ranking for fintech products"
            />
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create option"}
          </Button>
        </form>

        <div className="space-y-2">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm"
            >
              <div>
                <div className="font-medium">
                  {c.sortOrder}. {c.name}{" "}
                  <span className="text-muted">({c.slug})</span>
                </div>
                <div className="text-xs text-muted">
                  {c.status}
                  {c.description ? ` · ${c.description}` : null}
                </div>
              </div>
              <Button size="sm" variant="outline" type="button" onClick={() => toggle(c.id, c.status)}>
                {c.status === "ACTIVE" ? "Disable" : "Enable"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
