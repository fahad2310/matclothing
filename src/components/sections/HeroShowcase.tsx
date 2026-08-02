"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";

/**
 * The hero's right-hand panel.
 *
 * This replaced an abstract 3D still-life. Floating primitives looked
 * considered but told a first-time visitor nothing — not what is sold, not
 * what it costs, not whether it is any good. A shop's opening image should
 * be the thing it sells.
 *
 * So: real stock, cycling slowly, each frame captioned with its name and
 * price and linked straight to the product. The first glimpse now answers
 * "what is this and can I buy it".
 */

const DWELL_MS = 4200;

export function HeroShowcase({ products }: { products: Product[] }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  const slides = products
    .map((p) => ({
      product: p,
      image: p.variants.find((v) => v.images.length)?.images[0],
    }))
    .filter((s): s is { product: Product; image: string } => Boolean(s.image))
    /*
     * Order: featured first, then real photography, then the rest.
     *
     * Featured leads so the shop owner controls the opening image from the
     * admin rather than it falling out of insertion order — this is the
     * one picture most visitors will ever see. Within that, uploaded
     * photos (absolute Blob URLs) outrank generated placeholder plates
     * (local .svg).
     */
    .sort((a, b) => {
      const rank = (s: { product: Product; image: string }) =>
        (s.product.featured ? 0 : 2) + (s.image.startsWith("http") ? 0 : 1);
      return rank(a) - rank(b);
    })
    .slice(0, 6);

  useEffect(() => {
    if (slides.length <= 1 || reduceMotion) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), DWELL_MS);
    return () => clearInterval(t);
  }, [slides.length, reduceMotion]);

  if (slides.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface">
        <span className="spec-label">Collection coming</span>
      </div>
    );
  }

  const current = slides[index];

  return (
    <div className="relative h-full w-full overflow-hidden bg-surface">
      <AnimatePresence mode="sync">
        <motion.div
          key={current.product.id}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1.1, ease: "easeInOut" },
            // The slow push keeps a still photograph from feeling static.
            scale: { duration: DWELL_MS / 1000 + 1.2, ease: "linear" },
          }}
          className="absolute inset-0"
        >
          <Image
            src={current.image}
            alt={current.product.name}
            fill
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Caption sits over a scrim so it stays legible on any photograph */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/70 to-transparent pt-16">
        <Link
          href={`/shop/${current.product.slug}`}
          className="group block border-t border-border px-5 py-4"
        >
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="spec-label">{current.product.category}</p>
              <p className="font-display mt-1 truncate text-xl text-foreground transition-colors group-hover:text-accent">
                {current.product.name}
              </p>
            </div>
            <p className="shrink-0 text-sm tabular-nums text-foreground">
              {formatPrice(current.product.price, current.product.currency)}
            </p>
          </div>
        </Link>
      </div>

      {/* Progress ticks — how many pieces, and where you are */}
      <div className="absolute right-4 top-4 flex flex-col gap-1.5">
        {slides.map((s, i) => (
          <button
            key={s.product.id}
            onClick={() => setIndex(i)}
            aria-label={`Show ${s.product.name}`}
            className={`h-6 w-px transition-colors duration-500 ${
              i === index ? "bg-foreground" : "bg-foreground/25 hover:bg-foreground/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
