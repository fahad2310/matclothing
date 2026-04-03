import Link from "next/link";
import { SITE_NAME, NAV_LINKS, SOCIAL_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold tracking-[0.3em] text-foreground">
              {SITE_NAME.toUpperCase().replace(" CLOTHING", "")}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Premium clothing, watches, and shoes crafted for the modern
              individual. Elevate your style.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-medium tracking-[0.2em] uppercase text-muted">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/70 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/cart"
                  className="text-sm text-foreground/70 transition-colors hover:text-accent"
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="text-xs font-medium tracking-[0.2em] uppercase text-muted">
              Follow Us
            </h4>
            <div className="mt-4 flex gap-4">
              {Object.entries(SOCIAL_LINKS).map(([name, href]) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm capitalize text-foreground/70 transition-colors hover:text-accent"
                >
                  {name}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border/50 pt-8 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
