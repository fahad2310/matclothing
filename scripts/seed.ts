/**
 * Migrates src/data/products.json into Postgres.
 *
 * Idempotent: rerunning replaces each product's variants wholesale rather
 * than duplicating them, so it is safe to run again after editing the JSON.
 * Existing product rows are updated in place, which preserves created_at.
 */
import { readFileSync } from "fs";
import { join } from "path";
import { eq } from "drizzle-orm";
import { getDb, schema } from "../src/db";

interface JsonSize {
  size: string | number;
  inStock: boolean;
  quantity?: number;
}
interface JsonVariant {
  id: string;
  color: { name: string; hex: string };
  sizes: JsonSize[];
  images: string[];
}
interface JsonProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  price: number;
  originalPrice?: number;
  currency: string;
  variants: JsonVariant[];
  defaultVariantId: string;
  modelPath?: string;
  tags: string[];
  featured: boolean;
  createdAt: string;
  material?: string;
  weightGsm?: number;
  careInstructions?: string;
}

/** Pre-quantity data only had a boolean. Give in-stock sizes a starting count. */
const DEFAULT_QTY_WHEN_IN_STOCK = 10;

async function main() {
  const db = getDb();
  const file = join(process.cwd(), "src/data/products.json");
  const products = JSON.parse(readFileSync(file, "utf-8")) as JsonProduct[];

  console.log(`seeding ${products.length} products…`);

  for (const p of products) {
    await db
      .insert(schema.products)
      .values({
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description ?? "",
        longDescription: p.longDescription ?? null,
        category: p.category,
        pricePaise: Math.round(p.price * 100),
        originalPricePaise:
          p.originalPrice != null ? Math.round(p.originalPrice * 100) : null,
        currency: p.currency ?? "INR",
        defaultVariantId: p.defaultVariantId,
        modelPath: p.modelPath ?? null,
        tags: p.tags ?? [],
        featured: Boolean(p.featured),
        material: p.material ?? null,
        weightGsm: p.weightGsm ?? null,
        careInstructions: p.careInstructions ?? null,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      })
      .onConflictDoUpdate({
        target: schema.products.id,
        set: {
          slug: p.slug,
          name: p.name,
          description: p.description ?? "",
          category: p.category,
          pricePaise: Math.round(p.price * 100),
          originalPricePaise:
            p.originalPrice != null ? Math.round(p.originalPrice * 100) : null,
          defaultVariantId: p.defaultVariantId,
          tags: p.tags ?? [],
          featured: Boolean(p.featured),
          updatedAt: new Date(),
        },
      });

    // Cascade clears images and sizes with the variants.
    await db.delete(schema.variants).where(eq(schema.variants.productId, p.id));

    for (const [vi, v] of p.variants.entries()) {
      await db.insert(schema.variants).values({
        id: v.id,
        productId: p.id,
        colorName: v.color.name,
        colorHex: v.color.hex,
        position: vi,
      });

      if (v.images?.length) {
        await db.insert(schema.variantImages).values(
          v.images.map((url, i) => ({
            id: `${v.id}-img-${i}`,
            variantId: v.id,
            url,
            // Local SVG placeholders are not blob objects — no pathname.
            blobPathname: null,
            alt: `${p.name} — ${v.color.name}`,
            position: i,
          })),
        );
      }

      if (v.sizes?.length) {
        await db.insert(schema.variantSizes).values(
          v.sizes.map((s, i) => ({
            id: `${v.id}-size-${String(s.size).replace(/\W/g, "")}`,
            variantId: v.id,
            size: String(s.size),
            quantity:
              s.quantity ?? (s.inStock ? DEFAULT_QTY_WHEN_IN_STOCK : 0),
            position: i,
          })),
        );
      }
    }

    console.log(`  ✓ ${p.name} (${p.variants.length} variants)`);
  }

  console.log("done");
}

main().catch((err) => {
  console.error("seed failed:", err);
  process.exit(1);
});
