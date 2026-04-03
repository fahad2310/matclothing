"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";

const categoryData: Record<string, { icon: string; count: string }> = {
  clothing: { icon: "👕", count: "4 Products" },
  watches: { icon: "⌚", count: "3 Products" },
  shoes: { icon: "👟", count: "3 Products" },
};

export function CategoryShowcase() {
  return (
    <section className="relative bg-surface py-24 overflow-hidden">
      {/* Decorative lines */}
      <div className="absolute inset-0 opacity-[0.02]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-[1px] w-full bg-accent"
            style={{ top: `${20 + i * 15}%`, transform: `rotate(${-2 + i * 0.5}deg)` }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <ScrollReveal>
            <p className="text-[10px] tracking-[0.5em] uppercase text-accent mb-3">
              Browse By
            </p>
          </ScrollReveal>
          <TextReveal className="text-4xl font-bold tracking-wider text-foreground md:text-5xl">
            Categories
          </TextReveal>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {CATEGORIES.map((cat, i) => (
            <ScrollReveal key={cat.slug} delay={i * 0.15} direction="up">
              <Link
                href={`/shop?category=${cat.slug}`}
                className="group relative block overflow-hidden"
              >
                {/* Glowing border on hover */}
                <motion.div
                  className="relative flex aspect-[3/2] flex-col items-center justify-center bg-background border border-border/50 p-8 transition-all duration-500"
                  whileHover={{
                    borderColor: "rgba(201,168,76,0.3)",
                    boxShadow: "0 0 40px rgba(201,168,76,0.08)",
                  }}
                >
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 h-6 w-6 border-t border-l border-accent/0 transition-all duration-500 group-hover:border-accent/50 group-hover:h-8 group-hover:w-8" />
                  <div className="absolute top-0 right-0 h-6 w-6 border-t border-r border-accent/0 transition-all duration-500 group-hover:border-accent/50 group-hover:h-8 group-hover:w-8" />
                  <div className="absolute bottom-0 left-0 h-6 w-6 border-b border-l border-accent/0 transition-all duration-500 group-hover:border-accent/50 group-hover:h-8 group-hover:w-8" />
                  <div className="absolute bottom-0 right-0 h-6 w-6 border-b border-r border-accent/0 transition-all duration-500 group-hover:border-accent/50 group-hover:h-8 group-hover:w-8" />

                  <span className="text-5xl mb-4 transition-all duration-500 group-hover:scale-125 opacity-40 group-hover:opacity-70">
                    {categoryData[cat.slug]?.icon}
                  </span>
                  <h3 className="text-lg font-bold tracking-[0.25em] uppercase text-foreground">
                    {cat.label}
                  </h3>
                  <p className="mt-2 text-xs text-muted">{cat.description}</p>
                  <p className="mt-3 text-[10px] tracking-[0.3em] uppercase text-accent/60">
                    {categoryData[cat.slug]?.count}
                  </p>

                  {/* Bottom line animation */}
                  <div className="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent to-transparent transition-all duration-500 group-hover:w-3/4" />
                </motion.div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
