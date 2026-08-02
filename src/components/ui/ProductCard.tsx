"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { isProductSoldOut } from "@/services/productService";
import { Badge } from "./Badge";
import { SpecLabel, productSpecRows } from "./SpecLabel";

interface ProductCardProps {
  product: Product;
}

/**
 * Product card as a catalogue plate.
 *
 * No perspective tilt — a grid of tilting cards reads as a template
 * flourish, and quiet luxury doesn't tilt. The hover instead does what a
 * printed catalogue can't: the image eases in, and the care label rises
 * into the space beneath it.
 */
export function ProductCard({ product }: ProductCardProps) {
  const defaultVariant = product.variants.find(
    (v) => v.id === product.defaultVariantId,
  );
  const primaryImage = defaultVariant?.images?.[0];
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const isNew = product.tags.includes("new");
  const soldOut = isProductSoldOut(product);

  return (
    <motion.div layout layoutId={product.id}>
      <Link href={`/shop/${product.slug}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden border border-border bg-surface">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface">
              <span className="spec-label">{product.category}</span>
            </div>
          )}

          {soldOut && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70">
              <span className="spec-label border border-border bg-background px-4 py-2 text-foreground">
                Sold out
              </span>
            </div>
          )}

          <div className="absolute left-3 top-3 z-20 flex flex-col gap-1">
            {soldOut && <Badge variant="default">Sold out</Badge>}
            {!soldOut && isNew && <Badge variant="new">New</Badge>}
            {!soldOut && hasDiscount && <Badge variant="sale">Sale</Badge>}
          </div>

          {/* The care label rides up on hover — the tag you'd flip to read */}
          <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full border-t border-border bg-label/95 px-4 py-3 backdrop-blur-sm transition-transform duration-500 ease-out group-hover:translate-y-0">
            <SpecLabel rows={productSpecRows(product)} variant="inline" />
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <p className="spec-label">{product.category}</p>
          <h3 className="font-display text-xl leading-tight text-foreground transition-colors duration-300 group-hover:text-accent">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-foreground">
              {formatPrice(product.price, product.currency)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted line-through">
                {formatPrice(product.originalPrice!, product.currency)}
              </span>
            )}
          </div>

          {product.variants.length > 1 && (
            <div className="flex gap-1.5 pt-1">
              {product.variants.map((v) => (
                <span
                  key={v.id}
                  className="h-2.5 w-2.5 rounded-full border border-border"
                  style={{ backgroundColor: v.color.hex }}
                  title={v.color.name}
                />
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
