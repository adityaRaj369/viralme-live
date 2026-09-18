import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">404</p>
      <h1 className="mt-3 text-3xl font-bold">Looks like this page doesn&apos;t exist.</h1>
      <p className="mt-3 text-muted">The listing or page may have been moved or removed.</p>
      <Link href="/trending" className="mt-8">
        <Button>Explore Trending</Button>
      </Link>
    </div>
  );
}
