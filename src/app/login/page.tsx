"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const DEMO_PASSWORD = "Password123!";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@viralme.live");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(nextEmail: string, nextPassword: string) {
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email: nextEmail,
      password: nextPassword,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Could not sign in. Try the demo credentials.");
      return;
    }
    const dest = nextEmail.toLowerCase().includes("admin") ? "/admin" : "/";
    router.push(dest);
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login(email, password);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-4 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
        <p className="font-semibold text-accent">Admin login</p>
        <p className="mt-0.5 text-muted">
          Public site needs no account — claim ranks from the leaderboard.
        </p>
      </div>

      <h1 className="text-3xl font-bold">Sign in</h1>
      <p className="mt-2 text-sm text-muted">Admin only. Categories and settings live here.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Continue"}
        </Button>
      </form>

      <Button
        type="button"
        variant="outline"
        className="mt-3 w-full"
        disabled={loading}
        onClick={() => login("admin@viralme.live", DEMO_PASSWORD)}
      >
        Demo admin
      </Button>

      <p className="mt-6 text-center text-xs text-muted">
        admin@viralme.live / Password123!
      </p>
    </div>
  );
}
