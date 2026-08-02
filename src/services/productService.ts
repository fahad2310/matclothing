import { cache } from "react";
import { asc, eq, isNull, and } from "drizzle-orm";
import { getDb, hasDb, schema } from "@/db";
import type { Product, ProductCategory, ProductSize } from "@/types/product";

/**
 * The only module that knows the catalogue lives in Postgres.
 *
 * Rows are mapped back to the Product domain type the storefront already
 * uses, so components did not change when the JSON file went away. Prices
 * are stored in paise and surfaced in rupees — the boundary is here and
 * nowhere else.
 */

type Row = typeof schema.products.$inferSelect & {
  variants: (typeof schema.variants.$inferSelect & {
    images: (typeof schema.variantImages.$inferSelect)[];
    sizes: (typeof schema.variantSizes.$inferSelect)[];
  })[];
};

/** Sizes are stored as text so "M", "42" and "40mm" share a column. */
function parseSize(raw: string): ProductSize {
  const n = Number(raw);
  return Number.isFinite(n) && raw.trim() !== "" ? n : (raw as ProductSize);
}

function toProduct(row: Row): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    longDescription: row.longDescription ?? undefined,
    category: row.category as ProductCategory,
    price: row.pricePaise / 100,
    originalPrice:
      row.originalPricePaise != null ? row.originalPricePaise / 100 : undefined,
    currency: row.currency,
    defaultVariantId: row.defaultVariantId ?? row.variants[0]?.id ?? "",
    modelPath: row.modelPath ?? undefined,
    tags: row.tags ?? [],
    featured: row.featured,
    material: row.material ?? undefined,
    weightGsm: row.weightGsm ?? undefined,
    careInstructions: row.careInstructions ?? undefined,
    archived: row.archivedAt != null,
    createdAt:
      row.createdAt?.toISOString().split("T")[0] ??
      new Date().toISOString().split("T")[0],
    variants: row.variants.map((v) => ({
      id: v.id,
      color: { name: v.colorName, hex: v.colorHex },
      images: v.images.map((i) => i.url),
      sizes: v.sizes.map((s) => ({
        size: parseSize(s.size),
        quantity: s.quantity,
        inStock: s.quantity > 0,
      })),
    })),
  };
}

const withChildren = {
  variants: {
    orderBy: asc(schema.variants.position),
    with: {
      images: { orderBy: asc(schema.variantImages.position) },
      sizes: { orderBy: asc(schema.variantSizes.position) },
    },
  },
} as const;

/**
 * cache() dedupes within a single request — one render that hits
 * getAllProducts from three components issues one query, not three.
 */
export const getAllProducts = cache(async (): Promise<Product[]> => {
  // An unprovisioned database yields an empty catalogue rather than a
  // crash. The first Vercel build runs before Neon exists, and failing
  // there would block the very deploy that lets you provision it.
  if (!hasDb()) return [];

  const rows = await getDb().query.products.findMany({
    where: isNull(schema.products.archivedAt),
    orderBy: asc(schema.products.createdAt),
    with: withChildren,
  });
  return (rows as Row[]).map(toProduct);
});

/** Includes archived products. Admin only. */
export const getAllProductsForAdmin = cache(async (): Promise<Product[]> => {
  if (!hasDb()) return [];

  const rows = await getDb().query.products.findMany({
    orderBy: asc(schema.products.createdAt),
    with: withChildren,
  });
  return (rows as Row[]).map(toProduct);
});

export const getProductBySlug = cache(
  async (slug: string): Promise<Product | undefined> => {
    if (!hasDb()) return undefined;

    const row = await getDb().query.products.findFirst({
      where: and(
        eq(schema.products.slug, slug),
        isNull(schema.products.archivedAt),
      ),
      with: withChildren,
    });
    return row ? toProduct(row as Row) : undefined;
  },
);

export const getProductById = cache(
  async (id: string): Promise<Product | undefined> => {
    if (!hasDb()) return undefined;

    const row = await getDb().query.products.findFirst({
      where: eq(schema.products.id, id),
      with: withChildren,
    });
    return row ? toProduct(row as Row) : undefined;
  },
);

export async function getProductsByCategory(
  category: ProductCategory,
): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.category === category);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.featured);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const lower = query.toLowerCase();
  const all = await getAllProducts();
  return all.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower) ||
      p.tags.some((t) => t.toLowerCase().includes(lower)),
  );
}

export async function getRelatedProducts(
  productId: string,
  limit = 4,
): Promise<Product[]> {
  const all = await getAllProducts();
  const product = all.find((p) => p.id === productId);
  if (!product) return [];
  return all
    .filter((p) => p.id !== productId && p.category === product.category)
    .slice(0, limit);
}

// Pure stock predicates live in @/lib/stock — importing them from here
// would pull the database driver into client bundles.
export {
  isProductSoldOut,
  isVariantSoldOut,
  totalStock,
} from "@/lib/stock";
