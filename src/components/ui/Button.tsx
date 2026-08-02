"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

/**
 * Primary is ink-filled, not accent-filled. On paper the strongest thing
 * available is the darkest thing, and reserving black for the single action
 * that matters is what makes the page feel decisive rather than busy.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center uppercase tracking-[0.18em] transition-colors duration-300 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-foreground text-background hover:bg-accent-hover":
              variant === "primary",
            "border border-border text-foreground hover:border-foreground":
              variant === "outline",
            "text-foreground underline-offset-4 hover:text-accent hover:underline":
              variant === "ghost",
          },
          {
            "px-4 py-2.5 text-[11px]": size === "sm",
            "px-7 py-3.5 text-xs": size === "md",
            "px-10 py-4 text-xs": size === "lg",
          },
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
