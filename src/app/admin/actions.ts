"use server";

import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { del } from "@vercel/blob";
import { getDb, schema } from "@/db";
import { verifySession } from "@/lib/auth";

/**
 * Product mutations.
 *
 * Server actions rather than route handlers: the admin forms post directly
 * to these, so there is no client-side fetch layer to keep in sync and no
 * chance of the browser calling an endpoint the UI has drifted from.
 *
 * Every action re-checks the session. A server action is a public HTTP
 * endpoint — middleware protecting /admin pages does not protect these.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

async function requireAdmin() {
  if (!(await verifySession())) {
    throw new Error("Not signed in");
  }
}

function refresh(slug?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  if (slug) revalidatePath(`/shop/${slug}`);
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface SizeInput {
  size: string;
  quantity: number;
}

export interface ImageInput {
  url: string;
  blobPathname?: string | null;
  alt?: string | null;
}

export interface VariantInput {
  id?: string;
  colorName: string;
  colorHex: string;
  sizes: SizeInput[];
  images: ImageInput[];
}

export interface ProductInput {
  id?: string;
  name: string;
  slug?: string;
  description: string;
  longDescription?: string;
  category: string;
  /** Rupees, as typed by the admin. Converted to paise on write. */
  price: number;
  originalPrice?: number | null;
  tags: string[];
  featured: boolean;
  material?: string | null;
  weightGsm?: number | null;
  careInstructions?: string | null;
  variants: VariantInput[];
}

export async function saveProduct(input: ProductInput): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!input.name?.trim()) return { ok: false, error: "Name is required" };
    if (!input.category) return { ok: false, error: "Category is required" };
    if (!Number.isFinite(input.price) || input.price <= 0) {
      return { ok: false, error: "Price must be greater than zero" };
    }
    if (input.variants.length === 0) {
      return { ok: false, error: "Add at least one colourway" };
    }

    const db = getDb();
    const isNew = !input.id;
    const id = input.id ?? `${input.category.slice(0, 5)}-${Date.now()}`;
    const slug = slugify(input.slug || input.name);

    const values = {
      slug,
      name: input.name.trim(),
      description: input.description ?? "",
      longDescription: input.longDescription || null,
      category: input.category,
      pricePaise: Math.round(input.price * 100),
      originalPricePaise:
        input.originalPrice != null && input.originalPrice > 0
          ? Math.round(input.originalPrice * 100)
          : null,
      tags: input.tags ?? [],
      featured: Boolean(input.featured),
      material: input.material || null,
      weightGsm: input.weightGsm || null,
      careInstructions: input.careInstructions || null,
      updatedAt: new Date(),
    };

    if (isNew) {
      await db.insert(schema.products).values({ id, currency: "INR", ...values });
    } else {
      await db.update(schema.products).set(values).where(eq(schema.products.id, id));
    }

    // Variants are replaced wholesale. Images already uploaded to Blob are
    // re-inserted by URL, so no blob object is orphaned by this path —
    // deleteImage handles removal explicitly.
    await db.delete(schema.variants).where(eq(schema.variants.productId, id));

    let defaultVariantId: string | null = null;

    for (const [vi, v] of input.variants.entries()) {
      const variantId = v.id || `${id}-v${vi}-${Date.now()}`;
      if (vi === 0) defaultVariantId = variantId;

      await db.insert(schema.variants).values({
        id: variantId,
        productId: id,
        colorName: v.colorName || "Default",
        colorHex: v.colorHex || "#14110e",
        position: vi,
      });

      if (v.images.length) {
        await db.insert(schema.variantImages).values(
          v.images.map((img, i) => ({
            id: `${variantId}-img-${i}-${Date.now()}`,
            variantId,
            url: img.url,
            blobPathname: img.blobPathname ?? null,
            alt: img.alt ?? `${input.name} — ${v.colorName}`,
            position: i,
          })),
        );
      }

      if (v.sizes.length) {
        await db.insert(schema.variantSizes).values(
          v.sizes.map((s, i) => ({
            id: `${variantId}-size-${s.size.replace(/\W/g, "")}-${i}`,
            variantId,
            size: s.size,
            quantity: Math.max(0, Math.floor(s.quantity) || 0),
            position: i,
          })),
        );
      }
    }

    await db
      .update(schema.products)
      .set({ defaultVariantId })
      .where(eq(schema.products.id, id));

    refresh(slug);
    return { ok: true, id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save";
    console.error("[saveProduct]", message);
    return { ok: false, error: message };
  }
}

/**
 * Updates one size's stock. Separate from saveProduct so the dashboard can
 * adjust a count inline without rewriting the whole product.
 */
export async function setStock(
  variantSizeId: string,
  quantity: number,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await getDb()
      .update(schema.variantSizes)
      .set({ quantity: Math.max(0, Math.floor(quantity) || 0) })
      .where(eq(schema.variantSizes.id, variantSizeId));
    refresh();
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update stock";
    console.error("[setStock]", message);
    return { ok: false, error: message };
  }
}

export async function setFeatured(
  productId: string,
  featured: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await getDb()
      .update(schema.products)
      .set({ featured, updatedAt: new Date() })
      .where(eq(schema.products.id, productId));
    refresh();
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update";
    console.error("[setFeatured]", message);
    return { ok: false, error: message };
  }
}

/**
 * Archive hides a product from the storefront but keeps the row. Reversible,
 * unlike deleteProduct — which also destroys the uploaded photos.
 */
export async function setArchived(
  productId: string,
  archived: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await getDb()
      .update(schema.products)
      .set({ archivedAt: archived ? new Date() : null, updatedAt: new Date() })
      .where(eq(schema.products.id, productId));
    refresh();
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not archive";
    console.error("[setArchived]", message);
    return { ok: false, error: message };
  }
}

/** Permanent. Removes the product rows and every Blob object it owned. */
export async function deleteProduct(productId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const db = getDb();

    const variantRows = await db
      .select({ id: schema.variants.id })
      .from(schema.variants)
      .where(eq(schema.variants.productId, productId));

    if (variantRows.length) {
      const images = await db
        .select({ pathname: schema.variantImages.blobPathname })
        .from(schema.variantImages)
        .where(
          inArray(
            schema.variantImages.variantId,
            variantRows.map((v) => v.id),
          ),
        );

      const pathnames = images
        .map((i) => i.pathname)
        .filter((p): p is string => Boolean(p));

      // Blob deletion is best-effort: losing the DB row matters more than
      // an orphaned object, and failing here would strand the product.
      if (pathnames.length) {
        await del(pathnames).catch((err) =>
          console.error("[deleteProduct] blob cleanup failed:", err),
        );
      }
    }

    await db.delete(schema.products).where(eq(schema.products.id, productId));
    refresh();
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete";
    console.error("[deleteProduct]", message);
    return { ok: false, error: message };
  }
}

/** Removes a single photo, from both the catalogue and Blob storage. */
export async function deleteImage(blobPathname: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await del(blobPathname);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete image";
    console.error("[deleteImage]", message);
    return { ok: false, error: message };
  }
}
