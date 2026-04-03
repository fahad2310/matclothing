"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-16 bottom-0 z-40 bg-background/95 backdrop-blur-xl transition-all duration-500 md:hidden",
        isOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      )}
    >
      <nav className="flex flex-col items-center justify-center gap-8 pt-20">
        {NAV_LINKS.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={cn(
              "text-2xl font-light tracking-[0.2em] uppercase transition-all duration-500",
              isOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0",
              pathname === link.href ? "text-accent" : "text-foreground",
            )}
            style={{ transitionDelay: isOpen ? `${i * 100}ms` : "0ms" }}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/cart"
          onClick={onClose}
          className={cn(
            "text-2xl font-light tracking-[0.2em] uppercase transition-all duration-500",
            isOpen
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0",
            pathname === "/cart" ? "text-accent" : "text-foreground",
          )}
          style={{
            transitionDelay: isOpen ? `${NAV_LINKS.length * 100}ms` : "0ms",
          }}
        >
          Cart
        </Link>
      </nav>
    </div>
  );
}
