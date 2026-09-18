import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/listings", label: "My Listings" },
  { href: "/submit", label: "Create Listing" },
  { href: "/dashboard/profile", label: "My Profile" },
  { href: "/dashboard/promotions", label: "Promotions" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/notifications", label: "Notifications" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl gap-0 lg:gap-8">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-border bg-card/80 p-5 lg:block">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm text-white shadow-[0_0_20px_rgba(255,106,77,0.35)]">
              M
            </span>
            Dashboard
          </Link>
          <nav className="mt-8 space-y-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-muted-bg hover:text-foreground"
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
            <button className="text-sm font-medium text-muted hover:text-foreground">Sign out</button>
          </form>
        </aside>
        <div className="min-w-0 flex-1 px-4 py-8 sm:px-6">
          <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="whitespace-nowrap rounded-full bg-muted-bg px-3 py-1.5 text-xs font-semibold">
                {l.label}
              </Link>
            ))}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
