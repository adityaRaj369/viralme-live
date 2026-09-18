import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-muted-bg px-3.5 text-sm text-foreground placeholder:text-muted/70 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-28 w-full rounded-xl border border-border bg-muted-bg px-3.5 py-3 text-sm text-foreground placeholder:text-muted/70 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Label = ({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("mb-1.5 block text-sm font-medium text-foreground", className)} {...props} />
);

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-xl border border-border bg-muted-bg px-3.5 text-sm text-foreground transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
