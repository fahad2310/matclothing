"use client";

import Link from "next/link";
import { getFeaturedProducts } from "@/services/productService";
import { ProductCard } from "@/components/ui/ProductCard";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { StaggerChildren } from "@/components/animations/StaggerChildren";

export function FeaturedProducts() {
  const featured = getFeaturedProducts().slice(0, 6);

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24">
      {/* Background accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-accent/[0.03] blur-[150px] pointer-events-none" />

      <div className="relative mb-12 flex items-end justify-between">
        <div>
          <ScrollReveal>
            <p className="text-[10px] tracking-[0.5em] uppercase text-accent mb-3">
              Curated Selection
            </p>
          </ScrollReveal>
          <TextReveal className="text-4xl font-bold tracking-wider text-foreground md:text-5xl">
            Featured
          </TextReveal>
        </div>
        <ScrollReveal direction="left">
          <Link
            href="/shop"
            className="group flex items-center gap-2 text-xs tracking-wider uppercase text-muted transition-colors hover:text-accent"
          >
            View All
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </ScrollReveal>
      </div>

      <StaggerChildren
        className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        stagger={0.12}
      >
        {featured.map((product) => (
          <div key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </StaggerChildren>
    </section>
  );
}
