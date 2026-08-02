import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Relational catalogue.
 *
 * products.json modelled variants and sizes as nested JSON, which made
 * "set the stock on size M of the olive colourway" a whole-document
 * rewrite. Splitting them into rows lets the admin update one field
 * without racing another edit.
 *
 * Prices are stored in paise (integer minor units). Floats and money do
 * not mix — ₹12,500 is 1_250_000.
 */

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    longDescription: text("long_description"),
    category: text("category").notNull(),

    pricePaise: integer("price_paise").notNull(),
    originalPricePaise: integer("original_price_paise"),
    currency: text("currency").notNull().default("INR"),

    defaultVariantId: text("default_variant_id"),
    modelPath: text("model_path"),
    tags: text("tags").array().notNull().default([]),
    featured: boolean("featured").notNull().default(false),

    // Care-label fields
    material: text("material"),
    weightGsm: integer("weight_gsm"),
    careInstructions: text("care_instructions"),

    /** Soft delete — an archived product leaves the storefront but keeps
     *  its order history intact. */
    archivedAt: timestamp("archived_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("products_slug_idx").on(t.slug),
    index("products_category_idx").on(t.category),
    index("products_featured_idx").on(t.featured),
  ],
);

export const variants = pgTable(
  "variants",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    colorName: text("color_name").notNull(),
    colorHex: text("color_hex").notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("variants_product_idx").on(t.productId)],
);

export const variantImages = pgTable(
  "variant_images",
  {
    id: text("id").primaryKey(),
    variantId: text("variant_id")
      .notNull()
      .references(() => variants.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    /** Blob pathname — required to delete the object when the row goes. */
    blobPathname: text("blob_pathname"),
    alt: text("alt"),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("variant_images_variant_idx").on(t.variantId)],
);

export const variantSizes = pgTable(
  "variant_sizes",
  {
    id: text("id").primaryKey(),
    variantId: text("variant_id")
      .notNull()
      .references(() => variants.id, { onDelete: "cascade" }),
    /** Kept as text so "M", "42", and "40mm" share one column. */
    size: text("size").notNull(),
    /** Units on hand. inStock is derived from this, never stored twice. */
    quantity: integer("quantity").notNull().default(0),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("variant_sizes_variant_idx").on(t.variantId)],
);

export const productsRelations = relations(products, ({ many }) => ({
  variants: many(variants),
}));

export const variantsRelations = relations(variants, ({ one, many }) => ({
  product: one(products, {
    fields: [variants.productId],
    references: [products.id],
  }),
  images: many(variantImages),
  sizes: many(variantSizes),
}));

export const variantImagesRelations = relations(variantImages, ({ one }) => ({
  variant: one(variants, {
    fields: [variantImages.variantId],
    references: [variants.id],
  }),
}));

export const variantSizesRelations = relations(variantSizes, ({ one }) => ({
  variant: one(variants, {
    fields: [variantSizes.variantId],
    references: [variants.id],
  }),
}));
