import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/80 px-6 py-16 text-center",
        className,
      )}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again in a moment.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-danger/25 bg-danger/10 px-6 py-10 text-center">
      <h3 className="text-lg font-semibold text-danger">{title}</h3>
      <p className="mt-2 text-sm text-danger/80">{description}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
      </div>
    </div>
  );
}
