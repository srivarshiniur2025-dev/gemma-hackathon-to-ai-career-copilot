import { cn } from "@/lib/utils";

function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "secondary" | "outline" | "accent" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        variant === "default" && "bg-background-secondary text-foreground-heading",
        variant === "accent" && "bg-accent/10 text-accent",
        variant === "secondary" && "bg-background-secondary text-muted",
        variant === "outline" && "border border-border text-muted-secondary",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
