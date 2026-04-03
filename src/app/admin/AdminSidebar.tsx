"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/products/new", label: "Add Product", icon: "➕" },
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
    <aside className="hidden w-56 border-r border-border bg-surface lg:block">
      <div className="flex h-full flex-col p-4">
        <div className="mb-6">
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-accent">
            Admin Panel
          </h2>
        </div>

        <nav className="flex-1 space-y-1">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
                pathname === link.href
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:text-foreground",
              )}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border pt-4 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-sm text-muted hover:text-foreground transition-colors"
          >
            <span>🌐</span>
            View Site
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-muted hover:text-red-500 transition-colors"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
