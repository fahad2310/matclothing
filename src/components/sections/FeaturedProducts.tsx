import Link from "next/link";
import { getFeaturedProducts } from "@/services/productService";
import { ProductCard } from "@/components/ui/ProductCard";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { StaggerChildren } from "@/components/animations/StaggerChildren";
import { SpecEyebrow } from "@/components/ui/SpecLabel";

/**
 * Server component — the catalogue now comes from Postgres, so this reads
 * it directly rather than shipping the query to the browser. The reveal
 * wrappers stay client-side underneath.
 */
export async function FeaturedProducts() {
  const featured = (await getFeaturedProducts()).slice(0, 6);

  if (featured.length === 0) return null;

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-12 lg:py-32">
        <div className="mb-14 flex items-end justify-between gap-6">
          <div>
            <ScrollReveal>
              <SpecEyebrow>Selected pieces</SpecEyebrow>
            </ScrollReveal>
            <TextReveal className="font-display mt-6 text-[clamp(2.25rem,4.5vw,3.75rem)] leading-none text-foreground">
              Featured
            </TextReveal>
          </div>

          <ScrollReveal direction="left">
            <Link
              href="/shop"
              className="group flex items-center gap-2 whitespace-nowrap pb-2 text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:text-accent"
            >
              See everything
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
          </ScrollReveal>
        </div>

        <StaggerChildren
          className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.1}
        >
          {featured.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
