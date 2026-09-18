"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Moon, Search, Sun, X } from "lucide-react";
import { SHELL } from "@/lib/shell";
import { APP_NAME } from "@/lib/constants";

const nav = [
  { href: "/daily", label: "Daily" },
  { href: "/categories", label: "Categories" },
  { href: "/seo", label: "SEO" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  function toggleTheme() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("mmv-theme", next ? "dark" : "light");
    setDark(next);
  }

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    setSearchOpen(false);
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  }

  return (
    <header className="sticky top-0 z-50 w-full surface-glass">
      <div className={`${SHELL} flex h-14 items-center gap-2 sm:h-16 sm:gap-3`}>
        <Link href="/" className="flex min-w-0 items-center gap-2.5 font-bold tracking-tight">
          <span className="flex h-7 w-7 shrink-0 flex-col justify-center gap-[3px] px-1" aria-hidden>
            <span className="h-[3px] w-full rounded-full bg-accent" />
            <span className="h-[3px] w-[78%] rounded-full bg-foreground" />
            <span className="h-[3px] w-[52%] rounded-full bg-foreground" />
          </span>
          <span className="truncate text-[15px] sm:text-base">
            viralme<span className="text-muted">.live</span>
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-0.5">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hidden rounded-lg px-2.5 py-2 text-[13px] font-medium text-muted transition hover:text-foreground sm:inline-flex sm:px-3"
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="rounded-lg p-2 text-muted transition hover:text-foreground"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-muted transition hover:text-foreground"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </nav>
      </div>

      {/* Mobile nav row */}
      <div className={`${SHELL} flex gap-1 pb-2 sm:hidden`}>
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full bg-muted-bg px-3 py-1.5 text-xs font-semibold text-muted"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {searchOpen ? (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm">
          <div className={`${SHELL} pt-6`}>
            <form onSubmit={onSearch} className="ob-card flex items-center gap-2 p-3">
              <Search className="ml-2 h-4 w-4 shrink-0 text-muted" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products…"
                className="h-11 min-w-0 flex-1 bg-transparent text-[15px] outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-lg p-2 text-muted hover:text-foreground"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          </div>
          <button
            type="button"
            className="absolute inset-0 -z-10"
            aria-label="Dismiss"
            onClick={() => setSearchOpen(false)}
          />
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  const links = [
    { href: "/rules", label: "Rules" },
    { href: "/faq", label: "FAQ" },
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
    { href: "/imprint", label: "Imprint" },
    { href: "/stats", label: "Live stats" },
  ];

  return (
    <footer className="mt-auto w-full border-t border-border/70">
      <div className={`${SHELL} flex flex-col gap-6 py-12`}>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <p className="text-sm text-muted">
              <strong className="text-foreground">{APP_NAME}</strong> — a public pay-to-rank
              leaderboard. Rank is what you pay — nothing else.
            </p>
            <p className="mt-3 text-xs text-muted">
              Built as a simple side project. No ads. No engagement ranking.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-muted" aria-label="Footer">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap gap-4 text-[13px] text-muted">
          <Link href="/" className="hover:text-foreground">
            Leaderboard
          </Link>
          <Link href="/daily" className="hover:text-foreground">
            Daily
          </Link>
          <Link href="/categories" className="hover:text-foreground">
            Categories
          </Link>
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
        </div>
        <p className="text-xs text-muted">© {new Date().getFullYear()} {APP_NAME}</p>
      </div>
    </footer>
  );
}

export function MobileBottomNav() {
  return null;
}
