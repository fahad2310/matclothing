"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium tracking-wider uppercase transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-accent text-background hover:bg-accent-hover":
              variant === "primary",
            "border border-accent text-accent hover:bg-accent hover:text-background":
              variant === "outline",
            "text-foreground hover:text-accent": variant === "ghost",
          },
          {
            "px-4 py-2 text-xs": size === "sm",
            "px-6 py-3 text-sm": size === "md",
            "px-10 py-4 text-sm": size === "lg",
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
