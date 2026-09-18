import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bot,
  Briefcase,
  Building2,
  ChartColumn,
  Coins,
  Gamepad2,
  Globe2,
  GraduationCap,
  Heart,
  Home,
  ListTodo,
  Megaphone,
  Newspaper,
  PenLine,
  Shield,
  ShoppingCart,
  Sparkles,
  Trophy,
  Users,
  Code2,
  Plane,
  Music,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getPublicCategories } from "@/lib/admin-demo";
import { categoryBoardHref } from "@/lib/outbid-categories";

const catIcons: Record<string, ReactNode> = {
  all: <Sparkles className="h-3.5 w-3.5" />,
  leaderboards: <Trophy className="h-3.5 w-3.5" />,
  seo: <Sparkles className="h-3.5 w-3.5" />,
  marketing: <Megaphone className="h-3.5 w-3.5" />,
  productivity: <ListTodo className="h-3.5 w-3.5" />,
  agents: <Bot className="h-3.5 w-3.5" />,
  crypto: <Coins className="h-3.5 w-3.5" />,
  developer: <Code2 className="h-3.5 w-3.5" />,
  other: <Sparkles className="h-3.5 w-3.5" />,
  health: <Heart className="h-3.5 w-3.5" />,
  business: <Briefcase className="h-3.5 w-3.5" />,
  games: <Gamepad2 className="h-3.5 w-3.5" />,
  ecommerce: <ShoppingCart className="h-3.5 w-3.5" />,
  travel: <Plane className="h-3.5 w-3.5" />,
  directories: <ListTodo className="h-3.5 w-3.5" />,
  agencies: <Building2 className="h-3.5 w-3.5" />,
  "ai-media": <Sparkles className="h-3.5 w-3.5" />,
  education: <GraduationCap className="h-3.5 w-3.5" />,
  social: <Users className="h-3.5 w-3.5" />,
  people: <User className="h-3.5 w-3.5" />,
  design: <PenLine className="h-3.5 w-3.5" />,
  hiring: <Briefcase className="h-3.5 w-3.5" />,
  domains: <Globe2 className="h-3.5 w-3.5" />,
  security: <Shield className="h-3.5 w-3.5" />,
  sales: <Megaphone className="h-3.5 w-3.5" />,
  news: <Newspaper className="h-3.5 w-3.5" />,
  "real-estate": <Home className="h-3.5 w-3.5" />,
  writing: <PenLine className="h-3.5 w-3.5" />,
  audio: <Music className="h-3.5 w-3.5" />,
  analytics: <ChartColumn className="h-3.5 w-3.5" />,
};

/** Persistent outbid-style category pill bar */
export function CategoryChips({ activeSlug = "all" }: { activeSlug?: string }) {
  const categories = getPublicCategories();

  return (
    <nav className="ob-pill mb-5 flex gap-1 overflow-x-auto p-1.5 no-scrollbar" aria-label="Ranking categories">
      {categories.map((p) => {
        const active = activeSlug === p.slug;
        const href =
          p.slug === "all"
            ? "/"
            : categoryBoardHref({ slug: p.slug, pathSlug: p.pathSlug });
        const label = active && p.slug !== "all" ? p.fullName : p.name;
        return (
          <Link
            key={p.slug}
            href={href}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold transition",
              active
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:bg-muted-bg hover:text-foreground",
            )}
          >
            {catIcons[p.slug] ?? <Sparkles className="h-3.5 w-3.5" />}
            {label}
          </Link>
        );
      })}
      <Link
        href="/categories"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold text-accent hover:bg-muted-bg"
      >
        <Globe2 className="h-3.5 w-3.5" />
        Explore
      </Link>
    </nav>
  );
}
