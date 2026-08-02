import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { TextReveal } from "@/components/animations/TextReveal";
import { ImageReveal } from "@/components/animations/ImageReveal";
import { SpecEyebrow, SpecLabel } from "@/components/ui/SpecLabel";
import { Wordmark } from "@/components/ui/Wordmark";
import { getAllProducts } from "@/services/productService";
import { FOUNDED_YEAR, CATEGORIES, ORIGIN } from "@/lib/constants";

/**
 * Brand story, set as an editorial spread.
 *
 * The previous version carried invented social proof — "500+ products",
 * "10K+ happy customers" — against a catalogue of eight. Numbers on a
 * commerce page are a promise, so these are derived from real data or
 * dropped entirely.
 */
export async function BrandStory() {
  const productCount = (await getAllProducts()).length;

  const facts = [
    { term: "Established", value: String(FOUNDED_YEAR) },
    { term: "Pieces", value: String(productCount) },
    { term: "Categories", value: String(CATEGORIES.length) },
    { term: "Origin", value: ORIGIN },
  ];

  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-24 lg:grid-cols-2 lg:gap-20 lg:px-12 lg:py-32">
        <div className="lg:pr-8">
          <ScrollReveal>
            <SpecEyebrow>Our story</SpecEyebrow>
          </ScrollReveal>

          <TextReveal className="font-display mt-8 text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.05] text-foreground">
            We would rather make one good thing than ten passable ones.
          </TextReveal>

          <ScrollReveal delay={0.15}>
            <p className="mt-8 max-w-lg text-[15px] leading-relaxed text-muted">
              Brand Industrys started in {FOUNDED_YEAR} in Mumbai, working in
              small runs because that is what lets us check every piece before
              it goes out. We keep the catalogue short on purpose — {productCount}{" "}
              pieces across clothing, watches and shoes.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.25}>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted">
              Orders run through WhatsApp rather than a checkout form. It is
              slower, and it means we can confirm your size and answer a
              question about fit before anything ships.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.35}>
            <SpecLabel rows={facts} variant="stacked" className="mt-12 max-w-sm" />
          </ScrollReveal>
        </div>

        {/* The wordmark as a printed plate — the logo at poster scale */}
        <ScrollReveal direction="right">
          <ImageReveal className="border border-border">
            <div className="flex aspect-[4/5] items-center justify-center bg-surface px-8">
              <Wordmark
                showEstablished
                className="text-[clamp(1.75rem,4.5vw,3.25rem)] text-foreground"
              />
            </div>
          </ImageReveal>
        </ScrollReveal>
      </div>
    </section>
  );
}
