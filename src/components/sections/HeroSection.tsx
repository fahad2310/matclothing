"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MagneticButton } from "@/components/animations/MagneticButton";
import type { Product } from "@/types/product";
import { HeroShowcase } from "./HeroShowcase";
import { SpecEyebrow } from "@/components/ui/SpecLabel";
import { Wordmark } from "@/components/ui/Wordmark";
import { SITE_TAGLINE, SEASON, FOUNDED_YEAR } from "@/lib/constants";

/**
 * Asymmetric editorial hero: the wordmark holds the left column, real
 * stock cycles in the right. Deliberately not a centred stack over a
 * full-bleed canvas — on paper, the margin is the luxury.
 */
export function HeroSection({ products }: { products: Product[] }) {
  const reduceMotion = useReducedMotion();

  // One orchestrated entrance rather than scattered per-element effects.
  const rise = (delay: number) => ({
    initial: reduceMotion ? undefined : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Structural grid — faint column rules, the way a lookbook is set out */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mx-auto hidden max-w-[1400px] px-6 lg:block lg:px-12"
      >
        <div className="grid h-full grid-cols-12">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-l border-border/45 last:border-r" />
          ))}
        </div>
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1400px] grid-cols-1 items-center gap-8 px-6 py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-12 lg:py-0">
        {/* Left — the wordmark column */}
        <div className="order-2 lg:order-1">
          <motion.div {...rise(0.1)}>
            <SpecEyebrow>
              {SEASON} — Clothing, Watches, Shoes — Since {FOUNDED_YEAR}
            </SpecEyebrow>
          </motion.div>

          {/*
           * The wordmark scales with scroll and the two halves part
           * slightly — the serif/sans collision is the identity, so the
           * page opens by pulling it apart and letting it close.
           */}
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8"
          >
            <motion.div
              initial={reduceMotion ? undefined : { letterSpacing: "0.08em" }}
              animate={{ letterSpacing: "0em" }}
              transition={{ duration: 1.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <Wordmark
                as="h1"
                className="text-[clamp(2.75rem,9.5vw,7.5rem)] text-foreground"
              />
            </motion.div>
          </motion.div>

          <motion.p
            {...rise(0.35)}
            className="font-display mt-5 text-2xl italic text-accent md:text-3xl"
          >
            {SITE_TAGLINE}
          </motion.p>

          <motion.div {...rise(0.45)} className="mt-8 flex items-start gap-6">
            <span aria-hidden className="mt-3 h-px w-12 shrink-0 bg-accent-soft" />
            <p className="max-w-sm text-[15px] leading-relaxed text-muted">
              Small-batch clothing, watches and shoes out of Mumbai. Order any
              piece over WhatsApp — we confirm your size before anything ships.
            </p>
          </motion.div>

          <motion.div
            {...rise(0.6)}
            className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
          >
            <MagneticButton strength={0.12}>
              <Link
                href="/shop"
                className="group inline-flex items-center gap-3 bg-foreground px-9 py-4 text-xs uppercase tracking-[0.18em] text-background transition-colors duration-300 hover:bg-accent-hover"
              >
                See the collection
                <svg
                  aria-hidden
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </MagneticButton>

            <MagneticButton strength={0.12}>
              <Link
                href="/contact"
                className="inline-flex items-center border border-border px-9 py-4 text-xs uppercase tracking-[0.18em] text-foreground transition-colors duration-300 hover:border-foreground"
              >
                Talk to us
              </Link>
            </MagneticButton>
          </motion.div>
        </div>

        {/* Right — real stock, framed like a lookbook plate */}
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative order-1 aspect-[4/5] w-full border border-border bg-surface lg:order-2 lg:aspect-auto lg:h-[78vh]"
        >
          <HeroShowcase products={products} />

          {/* Corner registration marks — printer's crop, not decoration */}
          {(
            [
              "left-0 top-0 border-l border-t",
              "right-0 top-0 border-r border-t",
              "left-0 bottom-0 border-l border-b",
              "right-0 bottom-0 border-r border-b",
            ] as const
          ).map((pos) => (
            <span
              key={pos}
              aria-hidden
              className={`absolute h-5 w-5 border-foreground/45 ${pos}`}
            />
          ))}
        </motion.div>
      </div>

      {/* Scroll cue — a rule that grows, not a bouncing mouse */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="pointer-events-none absolute bottom-6 left-6 hidden items-center gap-3 lg:left-12 lg:flex"
      >
        <span className="spec-label">Scroll</span>
        <motion.span
          aria-hidden
          className="block h-px bg-accent-soft"
          animate={reduceMotion ? undefined : { width: [16, 44, 16] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 16 }}
        />
      </motion.div>
    </section>
  );
}
