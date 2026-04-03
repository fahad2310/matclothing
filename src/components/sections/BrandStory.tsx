"use client";

import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { CountUp } from "@/components/animations/CountUp";

export function BrandStory() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 text-[20rem] font-bold text-accent/[0.02] leading-none select-none pointer-events-none">
        MAT
      </div>

      <div className="relative grid gap-16 md:grid-cols-2 items-center">
        {/* Text */}
        <div>
          <ScrollReveal>
            <p className="text-[10px] tracking-[0.5em] uppercase text-accent mb-3">
              Our Story
            </p>
          </ScrollReveal>

          <TextReveal className="text-4xl font-bold tracking-wider text-foreground md:text-5xl leading-tight">
            Crafted for the Modern Individual
          </TextReveal>

          <ScrollReveal delay={0.2}>
            <p className="mt-8 text-sm leading-relaxed text-muted">
              MAT Clothing was born from a simple belief: premium quality shouldn&apos;t
              come with a premium price tag. We curate the finest materials and
              timeless designs to bring you clothing, watches, and shoes that
              elevate your everyday style.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Every piece in our collection is carefully selected to ensure it
              meets our standards of quality, comfort, and style.
            </p>
          </ScrollReveal>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8">
            {[
              { value: 500, suffix: "+", label: "Products" },
              { value: 10, suffix: "K+", label: "Happy Customers" },
              { value: 3, suffix: "", label: "Categories" },
            ].map((stat, i) => (
              <ScrollReveal key={stat.label} direction="up" delay={0.1 * i}>
                <motion.div
                  className="border-l border-accent/20 pl-4"
                  whileHover={{ borderColor: "rgba(201,168,76,0.6)" }}
                >
                  <p className="text-3xl font-bold text-accent">
                    <CountUp end={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-1 text-xs tracking-wider text-muted">{stat.label}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Visual element */}
        <ScrollReveal direction="right">
          <div className="relative">
            {/* Decorative frame */}
            <div className="absolute -inset-4 border border-accent/10" />
            <div className="absolute -inset-8 border border-accent/5" />

            <div className="relative aspect-[4/5] bg-gradient-to-br from-surface via-surface-2 to-surface flex items-center justify-center overflow-hidden">
              {/* Animated grid */}
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage: `linear-gradient(rgba(201,168,76,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,.3) 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
              />

              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <span
                  className="text-8xl font-bold tracking-[0.3em] md:text-9xl"
                  style={{
                    background: "linear-gradient(135deg, #c9a84c 0%, #2a2a2a 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  M
                </span>
              </motion.div>

              {/* Corner decorations */}
              <div className="absolute top-4 left-4 h-12 w-12 border-t border-l border-accent/20" />
              <div className="absolute bottom-4 right-4 h-12 w-12 border-b border-r border-accent/20" />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
