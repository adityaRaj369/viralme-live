import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "accent" | "success" | "warning" | "sponsored" | "outline";
  className?: string;
}) {
  const styles = {
    default: "bg-muted-bg text-foreground/90",
    accent: "bg-accent-soft text-accent",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    sponsored: "bg-foreground text-background",
    outline: "border border-border bg-transparent text-muted",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
