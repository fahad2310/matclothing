/**
 * Publishes imported drafts: sets a price, gives them stock, un-archives.
 *
 * Stock is the reason this needs a default. A published product with zero
 * quantity renders as "Sold out" everywhere, so publishing without it
 * would put fifteen dead listings on the shop.
 *
 * Usage:
 *   npx dotenv -e .env.local -- npx tsx scripts/publish-drafts.ts <rupees> [perSize]
 */
import { eq, like, isNotNull, and } from "drizzle-orm";
import { getDb, schema } from "../src/db";

async function main() {
  const rupees = Number(process.argv[2]);
  const perSize = Number(process.argv[3] ?? 10);

  if (!Number.isFinite(rupees) || rupees <= 0) {
    console.error("usage: tsx scripts/publish-drafts.ts <rupees> [perSize]");
    process.exit(1);
  }

  const db = getDb();

  const drafts = await db
    .select()
    .from(schema.products)
    .where(and(isNotNull(schema.products.archivedAt), like(schema.products.id, "import-%")));

  if (drafts.length === 0) {
    console.log("no imported drafts to publish");
    return;
  }

  console.log(`publishing ${drafts.length} drafts at ₹${rupees}, ${perSize} per size`);

  for (const [i, d] of drafts.entries()) {
    const n = String(i + 1).padStart(3, "0");
    const name = `Imported Piece ${n}`;
    const slug = `imported-piece-${n}`;

    await db
      .update(schema.products)
      .set({
        name,
        slug,
        description: "Imported article. Message us on WhatsApp for fit and dispatch.",
        pricePaise: Math.round(rupees * 100),
        archivedAt: null,
        tags: ["new"],
        updatedAt: new Date(),
      })
      .where(eq(schema.products.id, d.id));

    const variants = await db
      .select({ id: schema.variants.id })
      .from(schema.variants)
      .where(eq(schema.variants.productId, d.id));

    for (const v of variants) {
      await db
        .update(schema.variantSizes)
        .set({ quantity: perSize })
        .where(eq(schema.variantSizes.variantId, v.id));
    }

    console.log(`  [${n}] ${name} — ₹${rupees}`);
  }

  console.log(`\npublished ${drafts.length}`);
  console.log("Names are placeholders — rename each in /admin/products.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
