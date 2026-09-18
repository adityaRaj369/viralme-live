"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "Demo Creator",
    username: "democreator",
    email: "demo@viralme.live",
    password: "Password123!",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Demo signup: skip DB registration, mint a session immediately
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok && !data.demo) {
      setLoading(false);
      setError(data.error ?? "Registration failed");
      return;
    }

    const sign = await signIn("credentials", {
      email: form.email,
      password: form.password,
      name: form.name,
      redirect: false,
    });
    setLoading(false);
    if (sign?.error) {
      setError("Could not create demo session.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-4 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
        <p className="font-semibold text-accent">Demo mode</p>
        <p className="mt-0.5 text-muted">Signup creates a temporary session — no database required.</p>
      </div>

      <h1 className="text-3xl font-bold">Create your account</h1>
      <p className="mt-2 text-sm text-muted">Prefilled for demo — change fields or just hit Create.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            required
            pattern="[a-zA-Z0-9_]+"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Create demo account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-accent">
          Log in
        </Link>
      </p>
    </div>
  );
}
