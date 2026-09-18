import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
};

const variants = {
  primary:
    "bg-accent text-white hover:bg-accent-hover shadow-[0_8px_24px_rgba(240,122,92,0.28)]",
  secondary: "bg-foreground text-background hover:opacity-90",
  ghost: "bg-transparent hover:bg-muted-bg text-foreground",
  outline: "border border-border bg-transparent hover:bg-muted-bg",
  danger: "bg-danger text-white hover:opacity-90",
};

const sizes = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-10 px-4 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-xl",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
