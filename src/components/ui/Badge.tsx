import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "sale" | "new";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        {
          "bg-surface-2 text-muted": variant === "default",
          "bg-red-600 text-white": variant === "sale",
          "bg-accent text-background": variant === "new",
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
