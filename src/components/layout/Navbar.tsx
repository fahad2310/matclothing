"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { Wordmark } from "@/components/ui/Wordmark";
import { MobileMenu } from "./MobileMenu";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-12">
        <Link
          href="/"
          className="text-xl text-foreground transition-colors duration-300 hover:text-accent"
        >
          <Wordmark />
        </Link>

        <ul className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "spec-label transition-colors duration-300 hover:text-foreground",
                  pathname === link.href && "text-foreground",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-5">
          <Link
            href="/cart"
            className="group relative flex items-center gap-2 text-foreground"
            aria-label={`Cart, ${totalItems} ${totalItems === 1 ? "item" : "items"}`}
          >
            <span className="spec-label transition-colors duration-300 group-hover:text-foreground">
              Cart
            </span>
            <span className="spec-label tabular-nums text-foreground">
              ({totalItems})
            </span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex flex-col gap-1.5 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span
              className={cn(
                "h-px w-6 bg-foreground transition-all duration-300",
                mobileMenuOpen && "translate-y-[6.5px] rotate-45",
              )}
            />
            <span
              className={cn(
                "h-px w-6 bg-foreground transition-all duration-300",
                mobileMenuOpen && "opacity-0",
              )}
            />
            <span
              className={cn(
                "h-px w-6 bg-foreground transition-all duration-300",
                mobileMenuOpen && "-translate-y-[6.5px] -rotate-45",
              )}
            />
          </button>
        </div>
      </nav>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </header>
  );
}
