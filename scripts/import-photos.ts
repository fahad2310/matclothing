/**
 * Imports downloaded photos into the catalogue as hidden drafts.
 *
 * Each photo becomes an archived product with a placeholder name and no
 * stock, so nothing reaches the storefront until a human sets a real name,
 * price and quantity in the admin. Prices are the one thing this script
 * will not guess.
 *
 * Photos are uploaded to Vercel Blob when a token is present, because the
 * local public/uploads directory does not exist on Vercel's filesystem and
 * any path pointing there would 404 in production.
 *
 * Usage:
 *   npx dotenv -e .env.local -- npx tsx scripts/import-photos.ts <dir> [category]
 */
import { readdirSync, readFileSync, statSync } from "fs";
import { join, extname, basename } from "path";
import { getDb, schema } from "../src/db";

const SIZES: Record<string, string[]> = {
  clothing: ["XS", "S", "M", "L", "XL", "XXL"],
  shoes: ["38", "40", "42", "44", "46"],
  watches: ["38mm", "40mm", "42mm", "44mm"],
};

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

async function main() {
  const dir = process.argv[2];
  const category = process.argv[3] ?? "clothing";

  if (!dir) {
    console.error("usage: tsx scripts/import-photos.ts <dir> [category]");
    process.exit(1);
  }

  const files = readdirSync(dir)
    .filter((f) => MIME[extname(f).toLowerCase()])
    .sort();

  if (files.length === 0) {
    console.log("no images found");
    return;
  }

  const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  console.log(
    `${files.length} images · category "${category}" · storage: ${useBlob ? "vercel blob" : "local path"}`,
  );

  const db = getDb();
  const stamp = Date.now();
  let created = 0;

  for (const [i, file] of files.entries()) {
    const full = join(dir, file);
    const ext = extname(file).toLowerCase();
    const n = String(i + 1).padStart(3, "0");

    let url: string;
    let pathname: string | null = null;

    if (useBlob) {
      const { put } = await import("@vercel/blob");
      const body = readFileSync(full);
      const blob = await put(`products/${basename(file)}`, body, {
        access: "public",
        contentType: MIME[ext],
        addRandomSuffix: true,
      });
      url = blob.url;
      pathname = blob.pathname;
    } else {
      url = `/uploads/ig/${basename(dir)}/${file}`;
    }

    const id = `import-${stamp}-${n}`;
    const variantId = `${id}-v0`;

    await db.insert(schema.products).values({
      id,
      slug: `draft-${stamp}-${n}`,
      // Deliberately obvious. A placeholder that looks like a real name is
      // how a placeholder ends up in front of a customer.
      name: `DRAFT ${n} — needs name and price`,
      description: "",
      category,
      pricePaise: 100, // £1 sentinel; the draft is hidden until this is set
      currency: "INR",
      tags: ["draft", "imported"],
      featured: false,
      defaultVariantId: variantId,
      // Archived, so it cannot appear on the storefront by accident.
      archivedAt: new Date(),
    });

    await db.insert(schema.variants).values({
      id: variantId,
      productId: id,
      colorName: "As pictured",
      colorHex: "#14110e",
      position: 0,
    });

    await db.insert(schema.variantImages).values({
      id: `${variantId}-img-0`,
      variantId,
      url,
      blobPathname: pathname,
      alt: "",
      position: 0,
    });

    await db.insert(schema.variantSizes).values(
      (SIZES[category] ?? SIZES.clothing).map((size, k) => ({
        id: `${variantId}-size-${size}`,
        variantId,
        size,
        quantity: 0,
        position: k,
      })),
    );

    created++;
    console.log(`  [${n}] ${file} → ${useBlob ? "blob" : "local"} (${Math.round(statSync(full).size / 1024)} KB)`);
  }

  console.log(`\ncreated ${created} hidden drafts`);
  console.log("Open /admin/products to name, price and publish them.");
}

main().catch((err) => {
  console.error("import failed:", err);
  process.exit(1);
});
