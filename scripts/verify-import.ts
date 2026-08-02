/** Confirms imported drafts landed correctly and are hidden from the shop. */
import { isNotNull, isNull, desc } from "drizzle-orm";
import { getDb, schema } from "../src/db";

async function main() {
  const db = getDb();

  const hidden = await db
    .select()
    .from(schema.products)
    .where(isNotNull(schema.products.archivedAt));
  const live = await db
    .select()
    .from(schema.products)
    .where(isNull(schema.products.archivedAt));

  console.log(`hidden drafts: ${hidden.length}`);
  console.log(`live products: ${live.length}`);

  const blobImages = await db
    .select({ url: schema.variantImages.url, path: schema.variantImages.blobPathname })
    .from(schema.variantImages)
    .where(isNotNull(schema.variantImages.blobPathname))
    .orderBy(desc(schema.variantImages.createdAt))
    .limit(3);

  console.log(`blob-backed images: ${blobImages.length}`);

  for (const img of blobImages) {
    const res = await fetch(img.url, { method: "HEAD" });
    const size = res.headers.get("content-length") ?? "?";
    console.log(`  ${res.status}  ${size}B  ${img.url.slice(0, 72)}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
