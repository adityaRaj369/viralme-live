import { auth, DEMO_AUTH, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasMinRole } from "@/lib/roles";
import Link from "next/link";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/analytics", label: "Analytics" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const allowed =
    hasMinRole(session.user.role, "MODERATOR") ||
    (DEMO_AUTH && session.user.email === "admin@viralme.live");
  if (!allowed) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-56 shrink-0 border-r border-border bg-card/80 p-5 lg:block">
          <div className="font-bold tracking-tight">viralme admin</div>
          <nav className="mt-8 space-y-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-muted-bg hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <form
            className="mt-8"
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="text-sm text-muted hover:text-foreground">Sign out</button>
          </form>
        </aside>
        <div className="min-w-0 flex-1 px-4 py-8 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
