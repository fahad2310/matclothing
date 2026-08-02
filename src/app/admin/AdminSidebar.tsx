"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Numbered rather than iconed. Emoji read as clip-art against the
 * editorial type, and these three are a genuine sequence — look at the
 * catalogue, open a piece, add a new one — so the numerals carry meaning.
 */
const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Catalogue" },
  { href: "/admin/products/new", label: "Add a piece" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="hidden w-60 border-r border-border bg-surface lg:block">
      <div className="flex h-full flex-col p-6">
        <p className="spec-label mb-8">Admin</p>

        <nav className="flex-1 space-y-0.5">
          {adminLinks.map((link, i) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-baseline gap-3 border-l-2 py-2.5 pl-4 text-sm transition-colors",
                  active
                    ? "border-l-foreground text-foreground"
                    : "border-l-transparent text-muted hover:border-l-border hover:text-foreground",
                )}
              >
                <span className="spec-label tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-0.5 border-t border-border pt-5">
          <Link
            href="/"
            className="block py-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            View the shop
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full py-2 text-left text-sm text-muted transition-colors hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
