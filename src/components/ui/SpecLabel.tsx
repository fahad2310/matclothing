import type { Product } from "@/types/product";
import { ORIGIN, SEASON } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * The care label — this site's signature device.
 *
 * Every garment carries a woven tag with its reference, weight, composition
 * and origin. Rather than treat that as product trivia buried on the detail
 * page, the tag is the structural unit the whole site is built from: it
 * labels products, sections, and cart lines.
 *
 * Only renders rows that have real data. Nothing is invented to fill the tag.
 */

export interface SpecRow {
  term: string;
  value: string;
}

/** Turns a product into care-label rows, skipping anything unset. */
export function productSpecRows(
  product: Product,
  variantId?: string,
): SpecRow[] {
  const variant =
    product.variants.find((v) => v.id === (variantId ?? product.defaultVariantId)) ??
    product.variants[0];

  const rows: SpecRow[] = [
    { term: "Ref", value: product.id.toUpperCase() },
    { term: "Season", value: SEASON },
  ];

  if (product.material) rows.push({ term: "Fabric", value: product.material });
  if (product.weightGsm) rows.push({ term: "Weight", value: `${product.weightGsm} gsm` });
  if (variant?.color?.name) rows.push({ term: "Colour", value: variant.color.name });
  if (product.careInstructions) rows.push({ term: "Care", value: product.careInstructions });

  rows.push({ term: "Origin", value: ORIGIN });

  return rows;
}

interface SpecLabelProps {
  rows: SpecRow[];
  /**
   * `inline` — one running row, for product cards and tight spaces.
   * `stacked` — a sewn-in tag with term/value columns, for detail pages.
   */
  variant?: "inline" | "stacked";
  className?: string;
}

export function SpecLabel({ rows, variant = "inline", className }: SpecLabelProps) {
  if (rows.length === 0) return null;

  if (variant === "inline") {
    return (
      <p className={cn("spec-label", className)}>
        {rows.map((row, i) => (
          <span key={row.term}>
            {i > 0 && <span className="mx-1.5 text-accent-soft">·</span>}
            {row.value}
          </span>
        ))}
      </p>
    );
  }

  return (
    <dl
      className={cn(
        // Stitched tag: label stock, hairline border, one flat edge where
        // it would be sewn into the seam.
        "spec-label border border-border bg-label px-4 py-3.5",
        "border-l-2 border-l-accent-soft",
        className,
      )}
    >
      {rows.map((row) => (
        <div
          key={row.term}
          className="flex items-baseline gap-3 py-1 first:pt-0 last:pb-0"
        >
          <dt className="w-20 shrink-0 text-accent-soft">{row.term}</dt>
          <dd className="text-foreground/75 normal-case tracking-[0.06em]">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Section eyebrow set in the same tag language, so headings and products
 * read as parts of one system.
 */
export function SpecEyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("spec-label flex items-center gap-3", className)}>
      <span aria-hidden className="h-px w-8 bg-accent-soft" />
      {children}
    </p>
  );
}
