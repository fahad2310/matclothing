import Link from "next/link";
import {
  SITE_NAME,
  NAV_LINKS,
  SOCIAL_LINKS,
  ORIGIN,
  FOUNDED_YEAR,
} from "@/lib/constants";
import { Wordmark } from "@/components/ui/Wordmark";

export function Footer() {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-12 lg:py-20">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Wordmark className="text-2xl text-foreground" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              Small-batch clothing, watches and shoes. {ORIGIN} since{" "}
              {FOUNDED_YEAR}.
            </p>
          </div>

          <div>
            <p className="spec-label">Pages</p>
            <ul className="mt-5 space-y-3">
              {[...NAV_LINKS, { label: "Cart", href: "/cart" }].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground transition-colors duration-300 hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="spec-label">Elsewhere</p>
            <ul className="mt-5 space-y-3">
              {Object.entries(SOCIAL_LINKS).map(([name, href]) => (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm capitalize text-foreground transition-colors duration-300 hover:text-accent"
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="spec-label">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="spec-label">{ORIGIN}</p>
        </div>
      </div>
    </footer>
  );
}
