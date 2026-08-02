import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "sale" | "new";
  className?: string;
}

/**
 * Badges are stamps, not stickers — hairline outlines on label stock rather
 * than filled chips. The one exception is "sale", which stays solid ink so
 * the single commercially loud state is actually loud.
 */
export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "spec-label inline-block border px-2 py-1",
        {
          "border-border bg-background text-muted": variant === "default",
          "border-foreground bg-foreground text-background": variant === "sale",
          "border-foreground bg-background text-foreground": variant === "new",
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
