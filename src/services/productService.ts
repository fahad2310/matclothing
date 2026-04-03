import { products } from "@/data/products";
import type { Product, ProductCategory } from "@/types/product";

export function getAllProducts(): Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function searchProducts(query: string): Product[] {
  const lower = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower) ||
      p.tags.some((t) => t.includes(lower)),
  );
}

export function getRelatedProducts(productId: string, limit = 4): Product[] {
  const product = getProductById(productId);
  if (!product) return [];
  return products
    .filter((p) => p.id !== productId && p.category === product.category)
    .slice(0, limit);
}

/** Check if a product is completely sold out (no sizes in stock across all variants) */
export function isProductSoldOut(product: Product): boolean {
  return product.variants.every((v) =>
    v.sizes.every((s) => !s.inStock),
  );
}

/** Check if a specific variant is sold out */
export function isVariantSoldOut(product: Product, variantId: string): boolean {
  const variant = product.variants.find((v) => v.id === variantId);
  if (!variant) return true;
  return variant.sizes.every((s) => !s.inStock);
}
