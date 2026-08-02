import type { Product } from "@/types/product";

/**
 * Pure stock helpers.
 *
 * These live apart from productService deliberately. They read an
 * already-loaded Product and touch no database, so client components can
 * import them freely — importing them from productService would pull the
 * Drizzle and Postgres drivers into the browser bundle.
 */

export function isProductSoldOut(product: Product): boolean {
  return product.variants.every((v) => v.sizes.every((s) => !s.inStock));
}

export function isVariantSoldOut(product: Product, variantId: string): boolean {
  const variant = product.variants.find((v) => v.id === variantId);
  if (!variant) return true;
  return variant.sizes.every((s) => !s.inStock);
}

/** Total units across every variant and size. */
export function totalStock(product: Product): number {
  return product.variants.reduce(
    (sum, v) => sum + v.sizes.reduce((s, size) => s + size.quantity, 0),
    0,
  );
}
