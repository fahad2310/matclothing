"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { isProductSoldOut } from "@/services/productService";
import { Badge } from "./Badge";
import { TiltCard } from "@/components/animations/TiltCard";

interface ProductCardProps {
  product: Product;
}

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
      <TiltCard intensity={5}>
        <Link href={`/shop/${product.slug}`} className="group block">
          <div className="relative aspect-square overflow-hidden bg-surface">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface to-surface-2 transition-transform duration-500 group-hover:scale-105">
                <span className="text-4xl font-bold tracking-wider text-muted/20">
                  {product.category === "shoes"
                    ? "👟"
                    : product.category === "watches"
                      ? "⌚"
                      : "👕"}
                </span>
              </div>
            )}

            {/* Sold out overlay */}
            {soldOut && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
                <span className="border border-foreground/20 bg-background/80 px-4 py-1.5 text-xs font-medium tracking-[0.2em] uppercase text-foreground/70">
                  Sold Out
                </span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1 z-20">
              {soldOut && <Badge variant="default">Sold Out</Badge>}
              {!soldOut && isNew && <Badge variant="new">New</Badge>}
              {!soldOut && hasDiscount && <Badge variant="sale">Sale</Badge>}
            </div>

            {/* Quick info overlay */}
            <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-background/90 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
              <p className="text-xs text-muted">{product.description}</p>
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted">
              {product.category}
            </p>
            <h3 className="text-sm font-medium text-foreground transition-colors group-hover:text-accent">
              {product.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {formatPrice(product.price, product.currency)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-muted line-through">
                  {formatPrice(product.originalPrice!, product.currency)}
                </span>
              )}
            </div>

            {/* Color swatches */}
            {product.variants.length > 1 && (
              <div className="flex gap-1.5 pt-1">
                {product.variants.map((v) => (
                  <span
                    key={v.id}
                    className="h-3 w-3 rounded-full border border-border"
                    style={{ backgroundColor: v.color.hex }}
                    title={v.color.name}
                  />
                ))}
              </div>
            )}
          </div>
        </Link>
      </TiltCard>
    </motion.div>
  );
}
